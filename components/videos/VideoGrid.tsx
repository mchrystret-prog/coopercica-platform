import Link from "next/link";
import Image from "next/image";
export function VideoGrid({ items }: { items: { id: string; title: string }[] }) {
  return <div className="video-grid">{items.map((video) => <Link href={`/videos/${video.id}`} key={video.id}><div className="video-thumbnail"><Image unoptimized src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" width={480} height={360} /><span aria-hidden="true">▶</span></div><h2>{video.title}</h2></Link>)}</div>;
}
export function VideoNavigation({ active }: { active: "videos" | "playlists" }) {
  return <nav className="video-navigation" aria-label="Seções de vídeos"><Link href="/videos" aria-current={active === "videos" ? "page" : undefined}>Vídeos recentes</Link><Link href="/videos/playlists" aria-current={active === "playlists" ? "page" : undefined}>Playlists</Link></nav>;
}
