import { SUPABASE_URL } from "./leaflets";
export function socialImage(value: Record<string, string>) {
  if (!value.image) return null;
  try {
    const url = new URL(value.image);
    return url.origin === SUPABASE_URL && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith("/storage/v1/object/public/site-content/social/") && /\.(png|jpe?g|webp)$/i.test(url.pathname) ? url.href : null;
  } catch { return null; }
}
