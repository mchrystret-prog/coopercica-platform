"use client";
import { UploadRequirements } from "./UploadRequirements";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { getCoopermaisBanner } from "@/lib/coopermais-banner";
export function CoopermaisBannerEditor({ value, busy, onChange, onUpload }: {
  value: Record<string, string>; busy: boolean;
  onChange: (patch: Record<string, string>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: "video" | "image" | "mobileVideo" | "mobileImage") => void;
}) {
  const media = getCoopermaisBanner(value);
  return <div className="cms-section-editor"><article className="cms-section-card">
    <div className="cms-section-card-head"><h2>Banner Seja Coopermais</h2></div>
    <p>Configure uma mídia para cada tela e salve as alterações para publicar. Todo o banner leva ao destino configurado. Os vídeos rodam sem som e em loop, com opção de pausa.</p>
    <h3>Desktop · faixa horizontal</h3>
    <div className="settings-form">
      <label>Tipo de mídia desktop<select disabled={busy} value={value.mode || "video"} onChange={e => onChange({ mode: e.target.value })}><option value="video">Vídeo</option><option value="image">Imagem</option></select></label>
      <label>Vídeo desktop<input type="file" accept="video/mp4,video/webm" disabled={busy} onChange={e => onUpload(e, "video")} /><UploadRequirements rule="coopermaisVideo" /></label>
      <label>Imagem / capa desktop<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => onUpload(e, "image")} /><UploadRequirements rule="coopermaisImage">Aparece antes do vídeo e se ele não carregar.</UploadRequirements></label>
      <div className="form-span-full">{media.video ? <video key={media.video} src={media.video} poster={media.image} controls muted playsInline preload="metadata" aria-label="Prévia desktop" style={{ width: "100%", height: "auto" }} /> : <Image src={media.image} alt={media.alt} width={2880} height={432} style={{ width: "100%", height: "auto" }} />}</div>
    </div>
    <h3>Mobile · vertical (4:5)</h3>
    <p>Exibido em telas de até 767 px. Crie a arte em 1080 × 1350 px: a mídia será mostrada inteira, sem recortar nem esticar. Reserve o canto inferior esquerdo para o controle de pausa (44 px na tela).</p>
    <div className="settings-form">
      <label>Tipo de mídia mobile<select disabled={busy} value={value.mobileMode || value.mode || "video"} onChange={e => onChange({ mobileMode: e.target.value })}><option value="video">Vídeo</option><option value="image">Imagem</option></select></label>
      <label>Vídeo mobile<input type="file" accept="video/mp4,video/webm" disabled={busy} onChange={e => onUpload(e, "mobileVideo")} /><UploadRequirements rule="coopermaisMobileVideo" /></label>
      <label>Imagem / capa mobile<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => onUpload(e, "mobileImage")} /><UploadRequirements rule="coopermaisMobileImage">Aparece antes do vídeo e se ele não carregar.</UploadRequirements></label>
      <div className="form-span-full" style={{ maxWidth: 360 }}>{media.mobileVideo ? <video key={media.mobileVideo} src={media.mobileVideo} poster={media.mobileImage} controls muted playsInline preload="metadata" aria-label="Prévia mobile" style={{ width: "100%", height: "auto" }} /> : <Image src={media.mobileImage} alt={media.alt} width={1080} height={1350} style={{ width: "100%", height: "auto" }} />}</div>
    </div>
    <h3>Link e acessibilidade</h3>
    <div className="settings-form">
      <label>Descrição da mídia<input disabled={busy} maxLength={300} value={value.alt ?? media.alt} onChange={e => onChange({ alt: e.target.value })} /></label>
      <label>Rótulo do link<input disabled={busy} maxLength={80} value={value.ctaLabel ?? media.ctaLabel} onChange={e => onChange({ ctaLabel: e.target.value })} /></label>
      <label>Destino do banner<input type="url" disabled={busy} value={value.ctaHref ?? media.ctaHref} onChange={e => onChange({ ctaHref: e.target.value })} /></label>
    </div>
    <button type="button" className="button button-secondary" disabled={busy} onClick={() => onChange({ mode: "video", mobileMode: "video", video: "", image: "", mobileVideo: "", mobileImage: "", alt: "", ctaLabel: "", ctaHref: "" })}>Restaurar mídias originais</button>
  </article></div>;
}
