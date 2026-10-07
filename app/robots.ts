import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  const rule = !indexingEnabled() ? { disallow: "/" } : { allow: "/", disallow: ["/admin", "/api/", "/design-system"] };
  return { rules: [{ userAgent: "*", ...rule }, { userAgent: "OAI-SearchBot", ...rule }], ...(indexingEnabled() ? { sitemap: absoluteUrl("/sitemap.xml") } : {}) };
}
