import { InternalPage } from "@/components/layout/InternalPage";
import { VideoNavigation } from "@/components/videos/VideoGrid";
import { playlists } from "@/data/videos";
export const metadata = { title: "Playlists" };
export default function Page() { return <InternalPage eyebrow="Vídeos" title="Playlists" intro="Escolha um assunto para assistir aos vídeos da Coopercica."><section className="publication-section shell"><VideoNavigation active="playlists" /><div className="playlist-grid">{playlists.map((item) => <a key={item.id} href={`https://www.youtube.com/playlist?list=${item.id}`} target="_blank" rel="noopener noreferrer"><h2>{item.title}</h2><span>Abrir no YouTube ↗</span></a>)}</div></section></InternalPage>; }
