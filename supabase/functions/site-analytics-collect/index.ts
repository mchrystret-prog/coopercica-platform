import { readBatch } from "../_shared/analytics.ts";

const defaults = [
  "https://coopercica-platform.vercel.app",
  "https://coopercica.com.br",
  "https://www.coopercica.com.br",
  "http://localhost:3000",
];
Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  const allowed = (Deno.env.get("SITE_ANALYTICS_ALLOWED_ORIGINS") || "")
    .split(",")
    .filter(Boolean);
  if (![...defaults, ...allowed].includes(origin))
    return new Response(null, { status: 403 });
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers });
  const type = request.headers.get("content-type") || "";
  if (!/^(application\/json|text\/plain)(;|$)/i.test(type))
    return new Response(null, { status: 415, headers });
  try {
    const events = await readBatch(request);
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const key: string =
      secretKeys.default ||
      Object.values(secretKeys)[0] ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!key || !url) return new Response(null, { status: 503, headers });
    // Short-lived limiter digest; no raw IP or user agent is persisted.
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "unknown";
    const hmac = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign(
      "HMAC",
      hmac,
      new TextEncoder().encode(
        `${new Date().toISOString().slice(0, 10)}:${origin}:${ip}`,
      ),
    );
    const rateKey = [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const auth: Record<string, string> = {
      apikey: key,
      "Content-Type": "application/json",
    };
    if (!key.startsWith("sb_secret_")) auth.Authorization = `Bearer ${key}`;
    const response = await fetch(`${url}/rest/v1/rpc/site_analytics_ingest`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ p_events: events, p_rate_key: rateKey }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return new Response(null, {
        status: error.message === "rate_limited" ? 429 : 503,
        headers,
      });
    }
    return new Response(null, { status: 204, headers });
  } catch (error) {
    return new Response(null, {
      status:
        error instanceof Error && error.message === "payload_too_large"
          ? 413
          : 400,
      headers,
    });
  }
});
