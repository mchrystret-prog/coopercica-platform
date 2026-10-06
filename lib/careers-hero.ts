import { SUPABASE_URL } from "./leaflets";
export type CareersHeroImage = {
  src: string;
  mobileSrc?: string;
  alt: string;
  position: "center" | "top" | "bottom";
};
export function getCareersHeroImage(
  value: unknown,
): CareersHeroImage | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const settings = value as Record<string, unknown>;
  const valid = (url: unknown): url is string =>
    typeof url === "string" &&
    url.startsWith(
      `${SUPABASE_URL}/storage/v1/object/public/site-content/careers/`,
    ) &&
    !/[\s?#]/.test(url);
  if (!valid(settings.image)) return undefined;
  return {
    src: settings.image,
    mobileSrc: valid(settings.mobileImage) ? settings.mobileImage : undefined,
    alt:
      typeof settings.alt === "string" ? settings.alt.trim().slice(0, 300) : "",
    position:
      settings.position === "top" || settings.position === "bottom"
        ? settings.position
        : "center",
  };
}
