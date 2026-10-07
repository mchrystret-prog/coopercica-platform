"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: server-rendered content is visible without JavaScript. */
export function CareersMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    const start = () => {
      stop();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      const seen = new WeakSet<Element>();
      const active = new Set<Animation>();
      const easing = getComputedStyle(document.documentElement).getPropertyValue("--ease-brand").trim() || "ease-out";
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          if (typeof element.animate !== "function") continue;
          const delay = Math.min(210, Math.max(0, Number(element.dataset.careersDelay) || 0));
          const animation = element.animate([
            { opacity: 0.35, translate: "0 18px" },
            { opacity: 1, translate: "0 0" },
          ], { duration: 560, delay, easing, fill: "backwards" });
          active.add(animation);
          void animation.finished.catch(() => {}).finally(() => active.delete(animation));
        }
      }, { threshold: 0.08 });
      const observe = () => {
        node.querySelectorAll("[data-careers-reveal]").forEach(element => {
          if (seen.has(element)) return;
          seen.add(element);
          observer.observe(element);
        });
      };
      observe();
      // Filtered vacancies may mount later; observe each card once, without scroll polling.
      const updates = new MutationObserver(observe);
      updates.observe(node, { childList: true, subtree: true });
      stop = () => {
        observer.disconnect();
        updates.disconnect();
        active.forEach(animation => animation.cancel());
        active.clear();
      };
    };
    start();
    preference.addEventListener("change", start);
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || preference.matches) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = document.getElementById(link.hash.slice(1));
      if (!destination || !node.contains(destination)) return;
      event.preventDefault();
      const heading = destination.querySelector<HTMLElement>("h2") || destination;
      const previous = heading.getAttribute("tabindex");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      heading.addEventListener("blur", () => {
        if (previous === null) heading.removeAttribute("tabindex");
        else heading.setAttribute("tabindex", previous);
      }, { once: true });
      destination.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.location.hash !== link.hash) window.history.pushState(window.history.state, "", link.hash);
    };
    node.addEventListener("click", navigate, true);
    return () => {
      stop();
      preference.removeEventListener("change", start);
      node.removeEventListener("click", navigate, true);
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
