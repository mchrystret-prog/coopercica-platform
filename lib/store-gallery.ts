import { SUPABASE_URL } from "./leaflets";
export function storePhotoUrl(src: string) {
  if (/^\/stores\/[a-z0-9-]+\.(jpe?g|png|webp)$/i.test(src)) return src;
  try { const url = new URL(src); return url.origin === SUPABASE_URL && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith("/storage/v1/object/public/site-content/stores/") && /\.(jpe?g|png|webp)$/i.test(url.pathname) ? src : null; }
  catch { return null; }
}
export function storeGallery(value: Record<string, string>, slug: string): string[] {
  try { const photos: unknown = JSON.parse(value[slug] || "[]"); return Array.isArray(photos) ? [...new Set(photos.filter((src): src is string => typeof src === "string" && !!storePhotoUrl(src)))].slice(0, 6) : []; }
  catch { return []; }
}
export function validateStoreGalleries(value: Record<string, string>) {
  for (const text of Object.values(value)) {
    try { const photos = JSON.parse(text); if (!Array.isArray(photos) || photos.length > 6 || photos.some(src => typeof src !== "string" || !storePhotoUrl(src))) return "Cada loja pode ter até 6 fotos válidas. Revise a galeria."; }
    catch { return "Não foi possível ler as fotos de uma loja. Revise a galeria."; }
  }
  return null;
}
