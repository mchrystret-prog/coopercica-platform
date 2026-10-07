import { pageMetadata } from "@/lib/seo";
import { VideosLandingPage } from "@/components/videos/VideosLandingPage";
import { VideoGrid, VideoNavigation } from "@/components/videos/VideoGrid";
import { videos } from "@/data/videos";
export default function Page() { return <VideosLandingPage title="Receitas e dicas em vídeo" intro="Receitas, nutrição, churrasco e os bastidores da cooperativa."><section className="publication-section shell"><VideoNavigation active="videos" /><VideoGrid items={videos} /><p><a className="button" href="https://www.youtube.com/coopercicajundiai" target="_blank" rel="noopener noreferrer">Inscreva-se no canal</a></p></section></VideosLandingPage>; }

export const metadata = pageMetadata("Vídeos e receitas", "Assista às receitas, dicas de nutrição, churrasco e vídeos da Coopercica.", "/videos");
