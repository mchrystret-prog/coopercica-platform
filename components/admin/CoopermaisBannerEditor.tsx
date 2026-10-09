"use client";
import { UploadRequirements } from "./UploadRequirements";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { getCoopermaisBanner } from "@/lib/coopermais-banner";
export function CoopermaisBannerEditor({ value, busy, onChange, onUpload }: {
  value: Record<string, string>; busy: boolean;
  onChange: (patch: Record<string, string>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: "video" | "image") => void;
}) {
  const media = getCoopermaisBanner(value);
  return <div className="cms-section-editor"><article className="cms-section-card">
    <div className="cms-section-card-head"><h2>Badge Coopermais · abaixo do Delivery</h2></div>
    <p>Troque a mídia e salve as alterações para publicar. Todo o banner leva ao destino configurado. O vídeo roda sem som e em loop, com opção de pausa.</p>
    <div className="settings-form">
      <label>Tipo de mídia<select disabled={busy} value={value.mode || "video"} onChange={e => onChange({ mode: e.target.value })}><option value="video">Vídeo</option><option value="image">Imagem</option></select></label>
      <label>Enviar vídeo<input type="file" accept="video/mp4,video/webm" disabled={busy} onChange={e => onUpload(e, "video")} /><UploadRequirements rule="coopermaisVideo" /></label>
      <label>Imagem de apoio / capa<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => onUpload(e, "image")} /><UploadRequirements rule="coopermaisImage">Aparece antes do vídeo e se ele não carregar.</UploadRequirements></label>
      <label>Descrição da mídia<input disabled={busy} maxLength={300} value={value.alt ?? media.alt} onChange={e => onChange({ alt: e.target.value })} /></label>
      <label>Rótulo do link (acessibilidade)<input disabled={busy} maxLength={80} value={value.ctaLabel ?? media.ctaLabel} onChange={e => onChange({ ctaLabel: e.target.value })} /></label>
      <label>Destino do banner<input type="url" disabled={busy} value={value.ctaHref ?? media.ctaHref} onChange={e => onChange({ ctaHref: e.target.value })} /></label>
      <div className="form-span-full">{media.video ? <video key={media.video} src={media.video} poster={media.image} controls muted playsInline preload="metadata" aria-label={media.alt} style={{ width: "100%", height: "auto" }} /> : <Image src={media.image} alt={media.alt} width={2880} height={432} style={{ width: "100%", height: "auto" }} />}</div>
    </div>
    <button type="button" className="button button-secondary" disabled={busy} onClick={() => onChange({ mode: "video", video: "", image: "", alt: "", ctaLabel: "", ctaHref: "" })}>Restaurar vídeo original</button>
  </article></div>;
}
