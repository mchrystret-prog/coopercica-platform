import "server-only";
import { manualFeed, youtubeId, type VideoFeed, type VideoItem } from "./home-videos";
type ApiItem = { id?: string; snippet?: { title?: string; resourceId?: { videoId?: string }; thumbnails?: { medium?: { url?: string } } }; contentDetails?: { relatedPlaylists?: { uploads?: string } }; status?: { embeddable?: boolean; privacyStatus?: string } };
function thumbnail(item: ApiItem): string | undefined {
  const value = item.snippet?.thumbnails?.medium?.url;
  try { const url = new URL(value || ""); return url.protocol === "https:" && ["i.ytimg.com", "img.youtube.com"].includes(url.hostname) ? url.href : undefined; } catch { return undefined; }
}
export async function getHomeVideos(settings: Record<string, string>): Promise<VideoFeed> {
  const fallback = manualFeed(settings);
  const key = process.env.YOUTUBE_API_KEY;
  if (settings.mode !== "api" || !key) return fallback;
  const api = async (resource: string, query: Record<string, string>): Promise<ApiItem[]> => {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
    url.search = new URLSearchParams({ ...query, key }).toString();
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("YouTube unavailable");
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error("Invalid YouTube response");
    return data.items;
  };
  try {
    const channel = settings.channel || "@coopercicajundiai";
    if (!/^(@[A-Za-z0-9_.-]{3,100}|UC[A-Za-z0-9_-]{22})$/.test(channel)) return fallback;
    const channels = await api("channels", { part: "contentDetails", ...(channel.startsWith("@") ? { forHandle: channel } : { id: channel }) });
    const channelId = channels[0]?.id, uploads = youtubeId(settings.uploads || "", true) || channels[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!channelId || !uploads) return fallback;
    const [entries, lists] = await Promise.all([
      api("playlistItems", { part: "snippet", playlistId: uploads, maxResults: "12" }),
      api("playlists", { part: "snippet", channelId, maxResults: "12" }),
    ]);
    const ids = entries.map(item => youtubeId(item.snippet?.resourceId?.videoId || "")).filter(Boolean);
    const playable = ids.length ? await api("videos", { part: "snippet,status", id: ids.join(",") }) : [];
    const items: VideoItem[] = playable.filter(item => item.status?.embeddable && item.status.privacyStatus === "public" && youtubeId(item.id || "") && item.snippet?.title).map(item => ({ id: item.id!, title: item.snippet!.title!.slice(0, 160), thumbnail: thumbnail(item) }));
    if (!items.length) return fallback;
    const videoLists: VideoItem[] = lists.filter(item => youtubeId(item.id || "", true) && item.snippet?.title).map(item => ({ id: item.id!, title: item.snippet!.title!.slice(0, 160), thumbnail: thumbnail(item) }));
    return { ...fallback, videos: items, playlists: videoLists.length ? videoLists : fallback.playlists, featured: youtubeId(settings.featured || "") || items[0].id };
  } catch { return fallback; }
}
