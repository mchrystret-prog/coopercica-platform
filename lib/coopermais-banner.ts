import { SUPABASE_URL } from "./leaflets";
export const coopermaisBannerDefaults = {
  video: "/coopermais/coopermais.mp4",
  image: "/coopermais/coopermais-poster.jpg",
  mobileVideo: "/coopermais/coopermais-mobile.mp4",
  mobileImage: "/coopermais/coopermais-mobile-poster.jpg",
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
    mobileVideo: (value.mobileMode || value.mode) === "image" ? undefined : media(value.mobileVideo, /\.(mp4|webm)$/i) || coopermaisBannerDefaults.mobileVideo,
    mobileImage: media(value.mobileImage, /\.(png|jpe?g|webp)$/i) || coopermaisBannerDefaults.mobileImage,
    alt: value.alt?.trim().slice(0, 300) || coopermaisBannerDefaults.alt,
    ctaLabel: value.ctaLabel?.trim().slice(0, 80) || coopermaisBannerDefaults.ctaLabel,
    ctaHref,
  };
}

export const coopermaisInformationDefaults = {
  infoEyebrow: "Desde 1969",
  infoTitle: "Uma cooperativa de consumo com vantagens exclusivas para você.",
  historyCtaLabel: "Conheça a nossa história",
  historyCtaHref: "/quem-somos",
  metric1Value: "210 mil", metric1Label: "cooperados",
  metric2Value: "9", metric2Label: "lojas na região",
  metric3Value: "1.100", metric3Label: "colaboradores",
  metric4Value: "12 mil", metric4Label: "itens à venda",
};
function informationHref(value: string) {
  if (!value || /[\\\s\u0000-\u001f\u007f]/.test(value)) return null;
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return value;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function getCoopermaisInformation(value: Record<string, string> = {}) {
  const text = (key: keyof typeof coopermaisInformationDefaults, limit: number) => value[key]?.trim().slice(0, limit) || coopermaisInformationDefaults[key];
  return {
    enabled: value.infoEnabled !== "false",
    eyebrow: text("infoEyebrow", 80),
    title: text("infoTitle", 200),
    ctaLabel: text("historyCtaLabel", 80),
    ctaHref: informationHref(value.historyCtaHref?.trim()) || coopermaisInformationDefaults.historyCtaHref,
    metrics: ([1, 2, 3, 4] as const).map(index => ({ value: text(`metric${index}Value`, 24), label: text(`metric${index}Label`, 80) })),
  };
}
export function validateCoopermaisInformation(value: Record<string, string>) {
  return value.infoEnabled !== "false" && value.historyCtaHref?.trim() && !informationHref(value.historyCtaHref.trim())
    ? "Informe uma página interna, uma âncora ou um endereço HTTPS válido no botão da história." : null;
}
