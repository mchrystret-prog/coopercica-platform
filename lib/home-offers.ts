import type { LeafletProduct } from "./leaflets";
export type OffersChannel = "delivery" | "pharmacy";
export const offerFields = {
  description: "Nome do produto", regular_price: "Preço regular", offer_all_price: "Preço de oferta",
  coopermais_price: "Preço Coopermais", image_url: "Imagem", delivery_url: "Link do produto",
  ean: "EAN", unit: "Unidade", complement: "Complemento", age_18: "Selo +18",
  breastfeeding_warning: "Advertência de leite", available: "Disponibilidade", ends_at: "Validade",
} as const;
export type OfferField = keyof typeof offerFields;
export type OffersConfig = {
  enabled: boolean; preview: boolean; endpoint: string; title: string; limit: number; productsPath: string;
  fields: Record<OfferField, string>; useToken: boolean;
};
export function offersConfig(value: unknown, channel: OffersChannel): OffersConfig {
  const data = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const text = (key: string, fallback = "") => typeof data[key] === "string" ? data[key].trim().slice(0, 2000) : fallback;
  const requested = Number(data.limit);
  return {
    enabled: data.enabled === "true", preview: data.preview !== "false", endpoint: text("endpoint"),
    title: text("title") || (channel === "delivery" ? "Ofertas do Delivery" : "Ofertas da Drogaria"),
    limit: Number.isFinite(requested) && requested >= 1 ? Math.min(40, Math.floor(requested)) : 12,
    productsPath: text("productsPath"), useToken: data.useToken === "true",
    fields: Object.fromEntries(Object.keys(offerFields).map(key => [key, text(`field_${key}`, key)])) as Record<OfferField, string>,
  };
}
export function atPath(value: unknown, path: string): unknown {
  if (!path) return value;
  return path.split(".").reduce<unknown>((current, key) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) return undefined;
    return current && typeof current === "object" && Object.hasOwn(current, key)
      ? (current as Record<string, unknown>)[key] : undefined;
  }, value);
}
export function publicHttps(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") ||
      !host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":") ||
      /(^|\.)(localhost|local|internal|test|invalid)$/.test(host)) return null;
    return url.href;
  } catch { return null; }
}
function price(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const text = String(value).trim().replace(/^R\$\s*/, "");
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 && amount <= 1000000 ? amount : null;
}
const flag = (value: unknown) => value === true || value === 1 || ["true", "sim", "1"].includes(String(value).toLowerCase());
export function normalizeOffers(payload: unknown, config: OffersConfig, now = Date.now()): LeafletProduct[] {
  const list = atPath(payload, config.productsPath);
  if (!Array.isArray(list)) throw new Error("A resposta não contém a lista de produtos configurada.");
  const products: LeafletProduct[] = [];
  const seen = new Set<string>();
  for (const [index, row] of list.slice(0, 1000).entries()) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const get = (field: OfferField) => config.fields[field] ? atPath(row, config.fields[field]) : undefined;
    const name = get("description");
    const regular = price(get("regular_price"));
    const available = get("available");
    const ends = get("ends_at");
    if (typeof name !== "string" || !name.trim() || !regular || available === false || available === 0 || ["false", "nao", "não", "0"].includes(String(available).toLowerCase())) continue;
    if (ends !== undefined && ends !== null && ends !== "") {
      // Date-only expiry is inclusive in the retailer's São Paulo timezone.
      const expires = typeof ends === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ends) ? Date.parse(`${ends}T23:59:59.999-03:00`) : Date.parse(String(ends));
      if (!Number.isFinite(expires) || expires < now) continue;
    }
    const string = (field: OfferField) => typeof get(field) === "string" ? String(get(field)).trim().slice(0, 300) || null : null;
    const ean = string("ean");
    const url = publicHttps(get("delivery_url"));
    const key = ean || url || name.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const offer = price(get("offer_all_price"));
    const cooper = price(get("coopermais_price"));
    products.push({
      id: `api-${index}`, sort_order: index, ean, description: name.trim().slice(0, 300),
      complement: string("complement"), regular_price: regular,
      offer_all_price: offer && offer < regular ? offer : null,
      coopermais_price: cooper && cooper <= regular ? cooper : null,
      unit: string("unit"), delivery_url: url, image_url: publicHttps(get("image_url")),
      age_18: flag(get("age_18")), breastfeeding_warning: flag(get("breastfeeding_warning")),
      super_offer: false, buy_3_pay_2: false, promo_pack: null, family_code: null, section: null, special_section: null,
    });
    if (products.length >= config.limit) break;
  }
  return products;
}
