import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  const rule = isPreview() ? { disallow: "/" } : { allow: "/", disallow: ["/admin", "/api/", "/design-system"] };
  return { rules: [{ userAgent: "*", ...rule }, { userAgent: "OAI-SearchBot", ...rule }], ...(!isPreview() ? { sitemap: absoluteUrl("/sitemap.xml") } : {}) };
}
