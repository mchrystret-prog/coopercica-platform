import type { NextConfig } from "next";
import { indexingHeaders } from "./lib/site-indexing";
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async headers() {
    return indexingHeaders();
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "pmcvhrkykezvtdzkkfpa.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};
export default nextConfig;