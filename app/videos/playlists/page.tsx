import { pageMetadata } from "@/lib/seo";
import { VideosLandingPage } from "@/components/videos/VideosLandingPage";
import { VideoNavigation } from "@/components/videos/VideoGrid";
import { playlists } from "@/data/videos";
export default function Page() { return <VideosLandingPage title="Playlists" intro="Escolha um assunto para assistir aos vídeos da Coopercica."><section className="publication-section shell"><VideoNavigation active="playlists" /><div className="playlist-grid">{playlists.map((item) => <a key={item.id} href={`https://www.youtube.com/playlist?list=${item.id}`} target="_blank" rel="noopener noreferrer"><h2>{item.title}</h2><span>Abrir no YouTube ↗</span></a>)}</div></section></VideosLandingPage>; }

export const metadata = pageMetadata("Playlists de receitas e dicas", "Explore as playlists Coopercica: receitas, churrasco, dicas de café e histórias da cooperativa.", "/videos/playlists");
