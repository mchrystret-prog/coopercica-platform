/** Search discovery is opt-in until the company approves the public launch. */
export function isPreview() {
  return process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development";
}

export function indexingEnabled() {
  return process.env.SITE_INDEXING_ENABLED === "true" && !isPreview();
}

export function indexingHeaders() {
  return indexingEnabled()
    ? [{ source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
    : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" }] }];
}
