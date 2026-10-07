import { videos, playlists } from "@/data/videos";
export type VideoItem = { id: string; title: string; thumbnail?: string; cover?: string };
export type VideoFeed = { videos: VideoItem[]; playlists: VideoItem[]; featured: string; title: string };
export function youtubeId(input: string, playlist = false): string {
  let value = input.trim();
  try {
    const url = new URL(value);
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(url.hostname) || url.protocol !== "https:") return "";
    value = playlist ? url.searchParams.get("list") || "" : url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.split("/")[2] || "";
  } catch { /* A raw YouTube ID is also accepted. */ }
  return (playlist ? /^[A-Za-z0-9_-]{10,100}$/ : /^[A-Za-z0-9_-]{11}$/).test(value) ? value : "";
}
export function manualItems(raw: string | undefined, fallback: VideoItem[], playlist = false): VideoItem[] {
  if (raw === undefined || raw === "") return fallback;
  try {
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows)) return fallback;
    const seen = new Set<string>();
    return rows.slice(0, 30).flatMap(row => {
      if (!row || typeof row !== "object" || !("id" in row) || !("title" in row) || typeof row.id !== "string" || typeof row.title !== "string") return [];
      const id = youtubeId(row.id, playlist), title = row.title.trim().slice(0, 160);
      if (!id || !title || seen.has(id)) return [];
      seen.add(id);
      const cover = playlist && "cover" in row && typeof row.cover === "string" ? youtubeId(row.cover) : "";
      return [{ id, title, ...(cover ? { cover, thumbnail: `https://i.ytimg.com/vi/${cover}/hqdefault.jpg` } : {}) }];
    });
  } catch { return fallback; }
}
export function manualFeed(settings: Record<string, string>): VideoFeed {
  const items = manualItems(settings.videos, videos);
  const covers: Record<string, string> = { "Receitas salgadas": "YX6ignHLg5M", "Receitas doces": "chjpUtLfLbo", "Churrasco": "rLJruhxNTag", "Dicas de nutrição": "bj6EA6xt3rs" };
  const defaultPlaylists = playlists.map(item => ({ ...item, ...(covers[item.title] ? { cover: covers[item.title], thumbnail: `https://i.ytimg.com/vi/${covers[item.title]}/hqdefault.jpg` } : {}) }));
  return { videos: items, playlists: manualItems(settings.playlists, defaultPlaylists, true), featured: youtubeId(settings.featured || "") || items[0]?.id || "", title: settings.title?.trim().slice(0, 100) || "Mais conteúdo pra você." };
}
export function validateHomeVideos(settings: Record<string, string>): string | null {
  for (const [key, playlist] of [["videos", false], ["playlists", true]] as const) {
    if (!settings[key]) continue;
    try {
      const rows = JSON.parse(settings[key]);
      if (!Array.isArray(rows) || rows.length > 30 || rows.some(row => !row || typeof row.title !== "string" || !row.title.trim() || typeof row.id !== "string" || !youtubeId(row.id, playlist))) return "Informe títulos e links válidos do YouTube em todos os cards (máximo de 30 por lista).";
      if (playlist && rows.some(row => row.cover && (typeof row.cover !== "string" || !youtubeId(row.cover)))) return "Informe um vídeo válido para a capa da playlist.";
    } catch { return "A lista de vídeos está inválida."; }
  }
  if (settings.featured && !youtubeId(settings.featured)) return "Informe um link ou ID válido para o vídeo em destaque.";
  if (settings.mode === "api" && !/^(@[A-Za-z0-9_.-]{3,100}|UC[A-Za-z0-9_-]{22})$/.test(settings.channel || "@coopercicajundiai")) return "Informe o @ do canal ou seu ID iniciado por UC.";
  if (settings.uploads && !youtubeId(settings.uploads, true)) return "Informe um link ou ID válido para a playlist de vídeos.";
  return null;
}
