import "server-only";
import { offersConfig, publicHttps, normalizeOffers, type OffersChannel } from "./home-offers";
import { getSiteSetting } from "./site";
// Extra provider hosts require deployment configuration, never a public CMS field.
const builtInHosts = ["www.coopercicadelivery.com.br", "coopercicadelivery.com.br", "www.coopercicadrogaria.com.br", "coopercicadrogaria.com.br", "sicomprasafe.yourintegration.top"];
export async function loadHomeOffers(channel: OffersChannel) {
  const config = offersConfig(await getSiteSetting(`offers_${channel}`, {}), channel);
  if (!config.enabled) return { status: "disabled" as const, products: [] };
  const endpoint = publicHttps(config.endpoint);
  const allowedHosts = [...builtInHosts, ...(process.env.OFFERS_API_ALLOWED_HOSTS || "").split(",").map(h => h.trim().toLowerCase()).filter(Boolean)];
  if (!endpoint || !allowedHosts.includes(new URL(endpoint).hostname)) throw new Error("Endpoint de ofertas não autorizado.");
  const secret = channel === "delivery" ? process.env.OFFERS_DELIVERY_TOKEN : process.env.OFFERS_PHARMACY_TOKEN;
  if (config.useToken && !secret) throw new Error("Token de ofertas não configurado.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json", ...(config.useToken ? { Authorization: `Bearer ${secret}` } : {}) },
      redirect: "error", signal: controller.signal, cache: "no-store",
    });
    if (!response.ok || !response.body) throw new Error("API de ofertas indisponível.");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0, body = "";
    try {
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 2 * 1024 * 1024) { controller.abort(); throw new Error("Resposta de ofertas excede o limite."); }
        body += decoder.decode(chunk.value, { stream: true });
      }
      body += decoder.decode();
    } finally { reader.releaseLock(); }
    return { status: "ready" as const, products: normalizeOffers(JSON.parse(body), config) };
  } finally { clearTimeout(timeout); }
}
