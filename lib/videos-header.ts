import { SUPABASE_URL } from "./leaflets";
export const videosHeaderDefault = {
  image: "/videos/header.png",
  alt: "Mais conteúdo pra você. Família reunida assistindo ao canal da Coopercica.",
};
export function getVideosHeader(value: unknown) {
  const settings = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
  const valid = (src: unknown): src is string => {
    if (typeof src !== "string" || /[\s?#]/.test(src)) return false;
    try {
      const url = new URL(src);
      return url.origin === SUPABASE_URL && !url.username && !url.password &&
        url.pathname.startsWith("/storage/v1/object/public/site-content/videos/") &&
        /\.(png|jpe?g|webp)$/i.test(url.pathname);
    } catch { return false; }
  };
  const custom = valid(settings.image);
  return {
    image: custom ? settings.image as string : videosHeaderDefault.image,
    mobileImage: custom && valid(settings.mobileImage) ? settings.mobileImage : undefined,
    alt: custom && typeof settings.alt === "string" && settings.alt.trim()
      ? settings.alt.trim().slice(0, 300) : videosHeaderDefault.alt,
  };
}
