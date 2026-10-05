export const EVENT_TYPES = [
  "page_view",
  "banner_view",
  "banner_click",
  "link_click",
  "download",
  "scroll_depth",
  "engagement",
  "click",
  "rage_click",
  "non_interactive_click",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export type Device = "mobile" | "tablet" | "desktop";
export type AnalyticsEvent = {
  event_id: string;
  session_id: string;
  page_view_id: string;
  event_type: EventType;
  path: string;
  device: Device;
  source: string;
  medium: string;
  campaign: string;
  referrer_host: string;
  target_id: string;
  label: string;
  destination: string;
  x: number | null;
  y: number | null;
  viewport_width: number;
  document_height: number;
  value: number;
  occurred_at?: string;
  page_sequence?: number;
};

const PUBLIC_PATH =
  /^\/(?:$|(?:quem-somos|lojas|folheteria|delivery|drogaria|revista|politicas)\/?$|folheteria\/[a-z0-9-]{1,140}\/?$)/;
export function safePath(value: string): string | null {
  const path = value.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return PUBLIC_PATH.test(path) ? path : null;
}

// Never collect arbitrary DOM text, form values, URL queries, phone or email destinations.
export function safeLabel(value: string, limit = 100): string {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[omitido]")
    .replace(/(?:\+?\d[\s().-]*){8,}/g, "[omitido]")
    .replace(/[\x00-\x1f<>]/g, "")
    .trim()
    .slice(0, limit);
}
export function campaignToken(value: string | null): string {
  if (!value || /@|%40|(?:\d[\s().-]*){8,}/i.test(value)) return "";
  return value.replace(/[^\p{L}\p{N} ._-]/gu, "").slice(0, 80);
}
export function safeDestination(value: string, base: string): string {
  try {
    const url = new URL(value, base);
    if (url.protocol === "mailto:" || url.protocol === "tel:")
      return url.protocol.slice(0, -1);
    if (!/^https?:$/.test(url.protocol)) return "";
    if (/\.pdf$/i.test(url.pathname)) return `${url.hostname}/documento.pdf`;
    if (url.origin !== new URL(base).origin) return url.hostname;
    const path = safePath(url.pathname);
    if (!path) return "";
    const hash =
      /^#(?:home|historia|lojas|ofertas|delivery|drogaria|revista|app-showcase|footer)$/.test(
        url.hash,
      )
        ? url.hash
        : "";
    return path + hash;
  } catch {
    return "";
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const keys = [
  "event_id",
  "session_id",
  "page_view_id",
  "event_type",
  "path",
  "device",
  "source",
  "medium",
  "campaign",
  "referrer_host",
  "target_id",
  "label",
  "destination",
  "x",
  "y",
  "viewport_width",
  "document_height",
  "value",
];
export function parseAnalyticsBatch(input: unknown): AnalyticsEvent[] {
  if (!input || typeof input !== "object") throw new Error("invalid_batch");
  const batch = input as Record<string, unknown>;
  if (
    batch.consent !== "granted" ||
    Object.keys(batch).some((k) => !["consent", "events"].includes(k)) ||
    !Array.isArray(batch.events) ||
    batch.events.length < 1 ||
    batch.events.length > 40
  )
    throw new Error("invalid_batch");
  return batch.events.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("invalid_event");
    const e = item as Record<string, unknown>;
    if (
      keys.some((k) => !(k in e)) ||
      Object.keys(e).some(
        (k) =>
          !keys.includes(k) && !["occurred_at", "page_sequence"].includes(k),
      )
    )
      throw new Error("invalid_event");
    if ((e.occurred_at === undefined) !== (e.page_sequence === undefined))
      throw new Error("invalid_timing");
    if (
      e.occurred_at !== undefined &&
      (typeof e.occurred_at !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e.occurred_at) ||
        !Number.isFinite(Date.parse(e.occurred_at)) ||
        Math.abs(Date.now() - Date.parse(e.occurred_at)) > 86400000 ||
        !Number.isInteger(e.page_sequence) ||
        Number(e.page_sequence) < 1 ||
        Number(e.page_sequence) > 1000000)
    )
      throw new Error("invalid_timing");
    for (const key of ["event_id", "session_id", "page_view_id"])
      if (typeof e[key] !== "string" || !UUID.test(e[key]))
        throw new Error("invalid_id");
    if (
      !EVENT_TYPES.includes(e.event_type as EventType) ||
      !["mobile", "tablet", "desktop"].includes(String(e.device))
    )
      throw new Error("invalid_type");
    if (typeof e.path !== "string" || safePath(e.path) !== e.path)
      throw new Error("invalid_path");
    for (const key of [
      "source",
      "medium",
      "campaign",
      "referrer_host",
      "target_id",
      "label",
      "destination",
    ])
      if (typeof e[key] !== "string" || e[key].length > 200)
        throw new Error("invalid_text");
    for (const key of ["x", "y"])
      if (
        e[key] !== null &&
        (typeof e[key] !== "number" ||
          !Number.isFinite(e[key]) ||
          e[key] < 0 ||
          e[key] > 1)
      )
        throw new Error("invalid_position");
    if ((e.x === null) !== (e.y === null)) throw new Error("invalid_position");
    if (
      ![
        "click",
        "link_click",
        "banner_click",
        "download",
        "rage_click",
        "non_interactive_click",
      ].includes(String(e.event_type)) &&
      e.x !== null
    )
      throw new Error("invalid_position");
    if (
      !Number.isInteger(e.viewport_width) ||
      Number(e.viewport_width) < 240 ||
      Number(e.viewport_width) > 4096 ||
      !Number.isInteger(e.document_height) ||
      Number(e.document_height) < 1 ||
      Number(e.document_height) > 50000
    )
      throw new Error("invalid_dimensions");
    if (
      typeof e.value !== "number" ||
      !Number.isFinite(e.value) ||
      e.value < 0 ||
      e.value > 100
    )
      throw new Error("invalid_value");
    if (
      e.event_type === "scroll_depth"
        ? ![25, 50, 75, 90, 100].includes(e.value)
        : e.event_type === "engagement"
          ? e.value > 60
          : e.value !== 0
    )
      throw new Error("invalid_value");
    const host = String(e.referrer_host);
    if (host && !/^[a-z0-9.-]{1,100}$/i.test(host))
      throw new Error("invalid_host");
    const destination = String(e.destination);
    if (
      destination &&
      !/^(?:\/|[a-z0-9.-]+(?:\/documento\.pdf)?$|mailto$|tel$)/i.test(
        destination,
      )
    )
      throw new Error("invalid_destination");
    if (/[?@%\s]/.test(destination) || destination.length > 180)
      throw new Error("invalid_destination");
    if (
      destination.startsWith("/") &&
      safeDestination(destination, "https://coopercica-platform.vercel.app") !==
        destination
    )
      throw new Error("invalid_destination");
    const target = String(e.target_id);
    if (!/^[a-z0-9:_-]{0,100}$/i.test(target))
      throw new Error("invalid_target");
    return {
      ...e,
      source: campaignToken(String(e.source)),
      medium: campaignToken(String(e.medium)),
      campaign: campaignToken(String(e.campaign)),
      label: safeLabel(String(e.label)),
    } as AnalyticsEvent;
  });
}

export async function readBatch(request: Request): Promise<AnalyticsEvent[]> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid_batch");
  const decoder = new TextDecoder();
  let bytes = 0,
    text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 32768) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }
    text += decoder.decode(value, { stream: true });
  }
  return parseAnalyticsBatch(JSON.parse(text + decoder.decode()));
}
