"use client";
import { manualFeed, type VideoItem } from "@/lib/home-videos";
export function HomeVideosEditor({ value, busy, onChange }: { value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void }) {
  const feed = manualFeed(value);
  function rows(key: "videos" | "playlists", items: VideoItem[]) {
    const update = (next: VideoItem[]) => onChange({ [key]: JSON.stringify(next) });
    return <fieldset disabled={busy} className="form-span-full"><legend>{key === "videos" ? "Vídeos recentes / lista de reserva" : "Playlists / lista de reserva"}</legend>{items.map((item, index) => <div className="settings-form" key={`${key}-${index}`}>
      <label>Título<input value={item.title} maxLength={160} onChange={e => update(items.map((row, i) => i === index ? { ...row, title: e.target.value } : row))} /></label>
      <label>Link ou ID do YouTube<input value={item.id} onChange={e => update(items.map((row, i) => i === index ? { ...row, id: e.target.value } : row))} /></label>
      {key === "playlists" ? <label>Vídeo para a capa (opcional)<input value={item.cover || ""} placeholder="Link ou ID de um vídeo da playlist" onChange={e => update(items.map((row, i) => i === index ? { ...row, cover: e.target.value } : row))} /></label> : null}
      <div><button type="button" disabled={index === 0} onClick={() => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update(next); }}>Subir</button> <button type="button" onClick={() => update(items.filter((_, i) => i !== index))}>Remover</button></div>
    </div>)}<button type="button" disabled={items.length >= 30} onClick={() => update([...items, { id: "", title: "" }])}>+ Adicionar {key === "videos" ? "vídeo" : "playlist"}</button></fieldset>;
  }
  // Keep unfinished rows editable until the user saves and validation runs.
  const editable = (key: "videos" | "playlists") => { try { const raw = JSON.parse(value[key]); if (Array.isArray(raw)) return raw as VideoItem[]; } catch {} return feed[key]; };
  return <div className="cms-section-card"><div className="cms-section-card-head"><div><small>Página inicial · após a revista</small><h2>Vídeos do YouTube</h2></div></div>
    <p>O destaque inicia sem som quando a seção aparece. Os cards trocam o destaque; as playlists abrem no YouTube. Salve as alterações para publicar.</p>
    <div className="settings-form">
      <label>Exibir seção<select disabled={busy} value={value.enabled || "true"} onChange={e => onChange({ enabled: e.target.value })}><option value="true">Sim</option><option value="false">Não</option></select></label>
      <label>Título<input disabled={busy} value={value.title ?? feed.title} maxLength={100} onChange={e => onChange({ title: e.target.value })} /></label>
      <label>Fonte<select disabled={busy} value={value.mode || "manual"} onChange={e => onChange({ mode: e.target.value })}><option value="manual">Manual pelo CMS</option><option value="api">YouTube Data API</option></select></label>
      <label>Vídeo em destaque<input disabled={busy} value={value.featured || ""} placeholder="Link ou ID; vazio usa o primeiro vídeo" onChange={e => onChange({ featured: e.target.value })} /></label>
      {value.mode === "api" ? <><label>Canal<input disabled={busy} value={value.channel || "@coopercicajundiai"} onChange={e => onChange({ channel: e.target.value })} /><small>@ do canal ou ID iniciado por UC.</small></label><label>Playlist de vídeos (opcional)<input disabled={busy} value={value.uploads || ""} onChange={e => onChange({ uploads: e.target.value })} /></label><p className="form-span-full">Ative a YouTube Data API v3 e configure YOUTUBE_API_KEY nas variáveis do servidor na Vercel. A chave fica fora do CMS. Atualização a cada hora. Sem chave ou durante falhas da API, o site usa as listas abaixo.</p></> : null}
      {rows("videos", editable("videos"))}{rows("playlists", editable("playlists"))}
    </div>
  </div>;
}
