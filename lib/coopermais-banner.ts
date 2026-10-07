import { SUPABASE_URL } from "./leaflets";
export const coopermaisBannerDefaults = {
  video: "/coopermais/coopermais.mp4",
  image: "/coopermais/coopermais-poster.jpg",
  alt: "Seja Cliente Coopermais. Cadastre-se no Sou Coopermais e faça parte.",
  ctaLabel: "Quero ser Coopermais",
  ctaHref: "https://soucoopermais.com.br/",
};
export function getCoopermaisBanner(value: Record<string, string> = {}) {
  const media = (src: string | undefined, extension: RegExp) => {
    if (!src || /[\s?#]/.test(src)) return undefined;
    try {
      const url = new URL(src);
      return url.origin === SUPABASE_URL && !url.username && !url.password &&
        url.pathname.startsWith("/storage/v1/object/public/site-content/sections/") && extension.test(url.pathname) ? src : undefined;
    } catch { return undefined; }
  };
  let ctaHref = coopermaisBannerDefaults.ctaHref;
  try {
    const url = new URL(value.ctaHref);
    if (url.protocol === "https:" && !url.username && !url.password) ctaHref = url.href;
  } catch { /* Use the official membership destination. */ }
  return {
    video: value.mode === "image" ? undefined : media(value.video, /\.(mp4|webm)$/i) || coopermaisBannerDefaults.video,
    image: media(value.image, /\.(png|jpe?g|webp)$/i) || coopermaisBannerDefaults.image,
    alt: value.alt?.trim().slice(0, 300) || coopermaisBannerDefaults.alt,
    ctaLabel: value.ctaLabel?.trim().slice(0, 80) || coopermaisBannerDefaults.ctaLabel,
    ctaHref,
  };
}
