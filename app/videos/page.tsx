import { InternalPage } from "@/components/layout/InternalPage";
import { VideoGrid, VideoNavigation } from "@/components/videos/VideoGrid";
import { videos } from "@/data/videos";
export const metadata = { title: "Vídeos e receitas" };
export default function Page() { return <InternalPage eyebrow="Vídeos" title="Receitas e dicas em vídeo" intro="Receitas, nutrição, churrasco e os bastidores da cooperativa."><section className="publication-section shell"><VideoNavigation active="videos" /><VideoGrid items={videos} /><p><a className="button" href="https://www.youtube.com/coopercicajundiai" target="_blank" rel="noopener noreferrer">Inscreva-se no canal</a></p></section></InternalPage>; }
