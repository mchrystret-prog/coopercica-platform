import { SUPABASE_URL } from "./leaflets";

export type CareersBanner = {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage: string;
  href: string;
  order: number;
  active: boolean;
};

const careersStoragePrefix = `${SUPABASE_URL}/storage/v1/object/public/site-content/careers/`;

export function isValidCareersBannerImage(value: string): boolean {
  return value.startsWith(careersStoragePrefix) && !/[\\s?#]/.test(value);
}

export function parseCareersBanners(value: unknown): CareersBanner[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const stored = (value as Record<string, unknown>).banners;
  let entries: unknown;
  if (Array.isArray(stored)) entries = stored;
  else if (typeof stored === "string") {
    try { entries = JSON.parse(stored); } catch { return []; }
  }
  if (!Array.isArray(entries)) return [];
  return entries.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `banner-${index + 1}`,
      title: typeof item.title === "string" ? item.title.trim().slice(0, 300) : "",
      desktopImage: typeof item.desktopImage === "string" ? item.desktopImage : "",
      mobileImage: typeof item.mobileImage === "string" ? item.mobileImage : "",
      href: typeof item.href === "string" ? item.href.trim().slice(0, 2000) : "",
      order: Number.isFinite(Number(item.order)) ? Math.max(1, Math.floor(Number(item.order))) : index + 1,
      active: item.active === true,
    }));
}

export function isValidCareersBannerHref(value: string): boolean {
  const href = value.trim();
  if (!href) return true;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function getActiveCareersBanners(value: unknown): CareersBanner[] {
  return parseCareersBanners(value)
    .filter((banner) => banner.active && banner.title && isValidCareersBannerImage(banner.desktopImage) &&
      (!banner.mobileImage || isValidCareersBannerImage(banner.mobileImage)) && isValidCareersBannerHref(banner.href))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
