import { SUPABASE_URL } from "./leaflets";

export type CareersBanner = { id: string; image: string; mobileImage: string; title: string; href: string; active: boolean };
export function careersBannerIds(value: Record<string, unknown>): string[] {
  try {
    const ids: unknown = JSON.parse(String(value.bannerOrder || "[]"));
    return Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === "string" && /^[a-z0-9-]{1,64}$/.test(id)))].slice(0, 12) : [];
  } catch { return []; }
}
export function careersBannerImage(value: unknown): string {
  if (value === "/careers/marcia-santos.jpg" || value === "/careers/cleo-morais.png") return value;
  return typeof value === "string" && value.startsWith(`${SUPABASE_URL}/storage/v1/object/public/site-content/careers/`) && !/[\s?#]/.test(value) ? value : "";
}
export function careersBannerHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const href = value.trim();
  if (/[\s\\]/.test(href)) return "";
  if (/^#[a-zA-Z][\w-]*$/.test(href) || /^\/(?!\/)/.test(href)) return href;
  try { const url = new URL(href); return url.protocol === "https:" && !url.username && !url.password ? href : ""; } catch { return ""; }
}
export function getCareersBanners(value: Record<string, unknown>): CareersBanner[] {
  return careersBannerIds(value).map(id => ({
    id,
    image: careersBannerImage(value[`banner_${id}_image`]),
    mobileImage: careersBannerImage(value[`banner_${id}_mobileImage`]),
    title: String(value[`banner_${id}_title`] || "").trim().slice(0, 500),
    href: careersBannerHref(value[`banner_${id}_href`] || "#oportunidades"),
    active: value[`banner_${id}_active`] !== "false",
  }));
}
export function careersBannerInterval(value: Record<string, unknown>): number {
  const seconds = Number(value.bannerInterval || 8);
  return (Number.isFinite(seconds) ? Math.min(30, Math.max(5, seconds)) : 8) * 1000;
}
export function validateCareersBanners(value: Record<string, unknown>): string | null {
  for (const [index, banner] of getCareersBanners(value).entries()) {
    if (!banner.image || !banner.title || !banner.href) return `Banner ${index + 1}: envie a imagem e preencha a descrição e um destino válido (âncora, caminho interno ou HTTPS).`;
    if (value[`banner_${banner.id}_mobileImage`] && !banner.mobileImage) return `Banner ${index + 1}: imagem mobile inválida.`;
  }
  return null;
}
