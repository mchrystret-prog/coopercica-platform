import { SUPABASE_URL } from "./leaflets";
import {
  campaignToken,
  safeDestination,
  safeLabel,
  safePath,
  type AnalyticsEvent,
  type EventType,
} from "../supabase/functions/_shared/analytics";

export type Consent = "unknown" | "granted" | "denied";
const CONSENT_KEY = "coopercica_analytics_consent_v1";
const SESSION_KEY = "coopercica_analytics_session_v1";
const CHANGE = "coopercica:analytics-consent";
let volatileConsent: Consent = "unknown";
let volatileSession: Session | null = null;
type Session = {
  id: string;
  last: number;
  source: string;
  medium: string;
  campaign: string;
  referrer_host: string;
};

export function getConsent(): Consent {
  if (typeof window === "undefined") return "unknown";
  if (
    navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  )
    return "denied";
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    if (
      stored?.expires > Date.now() &&
      ["granted", "denied"].includes(stored.choice)
    )
      return stored.choice;
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  return volatileConsent;
}
export function subscribeConsent(callback: () => void) {
  window.addEventListener(CHANGE, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE, callback);
    window.removeEventListener("storage", callback);
  };
}
export function chooseConsent(choice: "granted" | "denied") {
  volatileConsent = choice;
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ choice, expires: Date.now() + 180 * 86400000 }),
    );
  } catch {
    /* In-memory choice is still honored. */
  }
  if (choice === "denied") {
    volatileSession = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* No persistent session. */
    }
  }
  window.dispatchEvent(new Event(CHANGE));
}

function getSession(): Session {
  let saved = volatileSession;
  try {
    saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") || saved;
  } catch {
    /* Use memory. */
  }
  if (
    !saved ||
    typeof saved.id !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(saved.id) ||
    !Number.isFinite(saved.last) ||
    Date.now() - saved.last > 1800000 ||
    [saved.source, saved.medium, saved.campaign, saved.referrer_host].some(
      (value) => typeof value !== "string",
    )
  ) {
    const params = new URLSearchParams(location.search);
    let referrer = "";
    try {
      const url = new URL(document.referrer);
      if (url.origin !== location.origin) referrer = url.hostname;
    } catch {
      /* Direct access. */
    }
    saved = {
      id: crypto.randomUUID(),
      last: Date.now(),
      source: campaignToken(params.get("utm_source")) || referrer || "direto",
      medium:
        campaignToken(params.get("utm_medium")) ||
        (referrer ? "referencia" : "direto"),
      campaign: campaignToken(params.get("utm_campaign")),
      referrer_host: referrer,
    };
  }
  saved.last = Date.now();
  volatileSession = saved;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(saved));
  } catch {
    /* Use memory. */
  }
  return saved;
}

export function startAnalytics(
  pathname: string,
  pageViewId = crypto.randomUUID(),
) {
  const path = safePath(pathname);
  if (
    !path ||
    getConsent() !== "granted" ||
    new URLSearchParams(location.search).has("analytics_preview") ||
    window.self !== window.top
  )
    return () => {};
  const endpoint = `${SUPABASE_URL}/functions/v1/site-analytics-collect`;
  let queue: AnalyticsEvent[] = [],
    disposed = false,
    sending = false,
    retryAt = 0,
    clickCount = 0;
  const device = () =>
    innerWidth < 768
      ? ("mobile" as const)
      : innerWidth < 1100
        ? ("tablet" as const)
        : ("desktop" as const);
  const dimensions = () => ({
    viewport_width: Math.max(240, Math.min(4096, Math.round(innerWidth))),
    document_height: Math.max(
      1,
      Math.min(50000, document.documentElement.scrollHeight),
    ),
  });
  const emit = (
    event_type: EventType,
    detail: Partial<AnalyticsEvent> = {},
  ) => {
    if (disposed || getConsent() !== "granted") return;
    const session = getSession();
    queue.push({
      event_id: crypto.randomUUID(),
      session_id: session.id,
      page_view_id: pageViewId,
      event_type,
      path,
      device: device(),
      source: session.source,
      medium: session.medium,
      campaign: session.campaign,
      referrer_host: session.referrer_host,
      target_id: "",
      label: "",
      destination: "",
      x: null,
      y: null,
      value: 0,
      ...dimensions(),
      ...detail,
    });
    if (queue.length > 160) queue.shift();
  };
  const flush = (beacon = false) => {
    if (getConsent() !== "granted") {
      queue = [];
      return;
    }
    if (!queue.length || (!beacon && (sending || Date.now() < retryAt))) return;
    const batch = queue.splice(0, 30);
    const body = JSON.stringify({ consent: "granted", events: batch });
    if (
      beacon &&
      navigator.sendBeacon?.(endpoint, new Blob([body], { type: "text/plain" }))
    ) {
      if (queue.length) flush(true);
      return;
    }
    sending = true;
    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain" },
      keepalive: true,
      credentials: "omit",
    })
      .then((response) => {
        if (!response.ok) throw new Error("collection_failed");
      })
      .catch(() => {
        if (!disposed && getConsent() === "granted") {
          queue = [...batch, ...queue].slice(-160);
          retryAt = Date.now() + 30000;
        }
      })
      .finally(() => {
        sending = false;
      });
  };
  emit("page_view");

  const onClick = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      !event.isTrusted ||
      !(event.target instanceof Element) ||
      event.target.closest(
        '[data-analytics-ignore],form,input,textarea,select,[contenteditable="true"]',
      )
    )
      return;
    const element = event.target.closest<HTMLElement>(
      "[data-analytics-id],a,button",
    );
    const anchor = element?.closest<HTMLAnchorElement>("a[href]");
    let event_type: EventType = "click";
    if (element?.dataset.analyticsKind === "banner") {
      event_type = "banner_click";
      const id = element.dataset.analyticsId || "";
      if (!seen.has(id)) {
        seen.add(id);
        emit("banner_view", {
          target_id: id,
          label: safeLabel(element.dataset.analyticsLabel || "Banner"),
        });
      }
    } else if (
      element?.dataset.analyticsKind === "download" ||
      (anchor &&
        (/\.pdf(?:[?#]|$)/i.test(anchor.href) ||
          anchor.hasAttribute("download")))
    )
      event_type = "download";
    else if (anchor) event_type = "link_click";
    const section =
      element?.closest("section[id],footer[id],nav[id]")?.id ||
      (element?.closest("header") ? "header" : "page");
    const hasPosition =
      event.detail !== 0 &&
      !event.target.closest('[data-analytics-fixed],[role="dialog"]') &&
      ++clickCount <= 200;
    const height = dimensions().document_height;
    emit(event_type, {
      target_id: (
        element?.dataset.analyticsId ||
        `${section}:${element?.tagName.toLowerCase() || "area"}`
      ).slice(0, 100),
      label: safeLabel(
        element?.dataset.analyticsLabel ||
          element?.getAttribute("aria-label") ||
          `${section} · ${element?.tagName.toLowerCase() || "área"}`,
      ),
      destination: anchor ? safeDestination(anchor.href, location.href) : "",
      x: hasPosition
        ? Math.max(
            0,
            Math.min(
              1,
              (event.clientX + scrollX) /
                Math.max(innerWidth, document.documentElement.scrollWidth),
            ),
          )
        : null,
      y: hasPosition
        ? Math.max(0, Math.min(1, (event.clientY + scrollY) / height))
        : null,
    });
  };
  document.addEventListener("click", onClick);

  const depths = new Set<number>();
  let scrollTimer = 0;
  const checkDepth = () => {
    const percent = Math.min(
      100,
      Math.round(
        ((scrollY + innerHeight) / dimensions().document_height) * 100,
      ),
    );
    [25, 50, 75, 90, 100].forEach((value) => {
      if (percent >= value && !depths.has(value)) {
        depths.add(value);
        emit("scroll_depth", { value });
      }
    });
  };
  const onScroll = () => {
    if (!scrollTimer)
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        checkDepth();
      }, 250);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  checkDepth();

  const seen = new Set<string>();
  const ratios = new Map<Element, number>();
  const impressionTimers = new Map<Element, number>();
  const checkBanner = (element: HTMLElement) => {
    const id = element.dataset.analyticsId || "";
    const visible =
      document.visibilityState === "visible" &&
      element.dataset.analyticsActive === "true" &&
      (ratios.get(element) || 0) >= 0.5;
    if (!visible || seen.has(id)) {
      clearTimeout(impressionTimers.get(element));
      impressionTimers.delete(element);
      return;
    }
    if (impressionTimers.has(element)) return;
    impressionTimers.set(
      element,
      window.setTimeout(() => {
        impressionTimers.delete(element);
        if (
          disposed ||
          document.visibilityState !== "visible" ||
          element.dataset.analyticsActive !== "true" ||
          (ratios.get(element) || 0) < 0.5 ||
          seen.has(id)
        )
          return;
        seen.add(id);
        emit("banner_view", {
          target_id: id,
          label: safeLabel(element.dataset.analyticsLabel || "Banner"),
        });
      }, 1000),
    );
  };
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        ratios.set(entry.target, entry.intersectionRatio);
        checkBanner(entry.target as HTMLElement);
      }),
    { threshold: [0, 0.5, 1] },
  );
  const findBanners = () =>
    document
      .querySelectorAll<HTMLElement>('[data-analytics-kind="banner"]')
      .forEach((element) => {
        if (!ratios.has(element)) {
          ratios.set(element, 0);
          observer.observe(element);
        }
        checkBanner(element);
      });
  const mutations = new MutationObserver(findBanners);
  mutations.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-analytics-active", "data-analytics-id"],
  });
  findBanners();

  let activeSince =
    document.visibilityState === "visible" ? performance.now() : null;
  const engagement = () => {
    if (activeSince === null) return;
    const value = Math.min(
      60,
      Math.round((performance.now() - activeSince) / 1000),
    );
    activeSince = performance.now();
    if (value > 0) emit("engagement", { value });
  };
  const visibility = () => {
    if (document.visibilityState === "hidden") {
      engagement();
      activeSince = null;
      flush(true);
    } else {
      activeSince = performance.now();
      findBanners();
    }
    if (document.visibilityState === "hidden")
      impressionTimers.forEach((timer) => clearTimeout(timer));
    if (document.visibilityState === "hidden") impressionTimers.clear();
  };
  const pagehide = () => {
    engagement();
    flush(true);
  };
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("pagehide", pagehide);
  const timer = window.setInterval(() => {
    engagement();
    flush();
  }, 10000);
  return () => {
    engagement();
    if (getConsent() === "granted") flush(true);
    disposed = true;
    queue = [];
    clearInterval(timer);
    clearTimeout(scrollTimer);
    impressionTimers.forEach(clearTimeout);
    observer.disconnect();
    mutations.disconnect();
    document.removeEventListener("click", onClick);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", pagehide);
  };
}
