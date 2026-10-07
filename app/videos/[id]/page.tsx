import { pageMetadata, breadcrumbs } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { notFound } from "next/navigation";
import { InternalPage } from "@/components/layout/InternalPage";
import { VideoGrid, VideoNavigation } from "@/components/videos/VideoGrid";
import { videos } from "@/data/videos";
export function generateStaticParams() { return videos.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = videos.find(item => item.id === id);
  return video ? pageMetadata(video.title, `Assista a ${video.title} no canal Coopercica. Confira também outras receitas e dicas em vídeo.`, `/videos/${video.id}`) : { title: "Vídeo não encontrado", robots: { index: false } };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, video = videos.find((item) => item.id === id);
  if (!video) notFound();
  return <InternalPage eyebrow="Vídeos" title={video.title} intro="Mais uma dica do time Coopercica para o seu dia a dia."><StructuredData value={breadcrumbs([{ name: "Home", path: "/" }, { name: "Vídeos", path: "/videos" }, { name: video.title, path: `/videos/${video.id}` }])} /><section className="publication-section shell"><VideoNavigation active="videos" /><iframe className="video-player" src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><p><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">Assistir diretamente no YouTube</a></p><h2>Mais vídeos</h2><VideoGrid items={videos.filter((item) => item.id !== id).slice(0, 8)} /></section></InternalPage>;
}
