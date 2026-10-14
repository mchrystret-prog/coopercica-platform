import type { MetadataRoute } from "next";
import { getJobs } from "@/lib/jobs";
import { getActiveLeaflets } from "@/lib/leaflets";
import { videos } from "@/data/videos";
import { absoluteUrl, jobIsCurrent, indexingEnabled } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled()) return [];
  const [jobs, leaflets] = await Promise.all([getJobs().catch(() => []), getActiveLeaflets().catch(() => [])]);
  return [
    ...["/", "/quem-somos", "/lojas", "/delivery", "/drogaria", "/folheteria", "/revista", "/vagas", "/videos", "/videos/playlists", "/politicas"].map(path => ({ url: absoluteUrl(path) })),
    ...jobs.filter(j => jobIsCurrent(j)).map(j => ({ url: absoluteUrl(`/vagas/${j.slug}`), ...(Number.isFinite(Date.parse(j.updated_at)) ? { lastModified: new Date(j.updated_at) } : {}) })),
    ...leaflets.map(l => ({ url: absoluteUrl(`/folheteria/${l.slug}`) })),
    ...videos.map(v => ({ url: absoluteUrl(`/videos/${v.id}`) })),
  ];
}
