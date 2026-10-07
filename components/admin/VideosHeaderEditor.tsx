"use client";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { getVideosHeader } from "@/lib/videos-header";
export function VideosHeaderEditor({ value, busy, onChange, onUpload }: {
  value: Record<string, string>;
  busy: boolean;
  onChange: (patch: Record<string, string>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: "image" | "mobileImage") => void;
}) {
  const hero = getVideosHeader(value);
  return <div className="cms-section-editor"><article className="cms-section-card">
    <div className="cms-section-card-head"><div><small>Vídeos e playlists</small><h2>Imagem do cabeçalho</h2></div></div>
    <p>A arte aparece de ponta a ponta, sem recortar textos ou fotos. Envie a imagem e clique em Salvar alterações para publicar.</p>
    <div className="settings-form">
      {([['image', 'Arte principal'], ['mobileImage', 'Arte para celular (opcional)']] as const).map(([field, label]) => <label key={field}>
        {label}
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || (field === 'mobileImage' && !value.image)} onChange={e => onUpload(e, field)} />
        <small>{field === 'image' ? 'Recomendado: 2048 × 522 px, como a arte original.' : 'Recomendado: 1080 × 810 px (4:3), com textos maiores. Sem esta versão, o celular mostra a arte principal inteira.'} JPG, PNG ou WebP, até 15 MB.</small>
      </label>)}
      <label className="form-span-full">Descrição da arte (acessibilidade)
        <input disabled={busy} maxLength={300} value={value.alt ?? hero.alt} onChange={e => onChange({ alt: e.target.value })} />
        <small>Inclua a mensagem principal da arte e uma breve descrição da cena.</small>
      </label>
      <div className="form-span-full"><Image src={hero.image} alt={hero.alt} width={2048} height={522} style={{ width: '100%', height: 'auto' }} /></div>
      {hero.mobileImage ? <div className="form-span-full"><p>Prévia da versão para celular</p><Image src={hero.mobileImage} alt={hero.alt} width={1080} height={810} style={{ width: 'min(100%, 360px)', height: 'auto' }} /></div> : null}
    </div>
    {value.mobileImage ? <button className="button button-secondary" disabled={busy} onClick={() => onChange({ mobileImage: '' })}>Remover versão para celular</button> : null}
    {value.image ? <button className="button button-secondary" disabled={busy} onClick={() => onChange({ image: '', mobileImage: '', alt: '' })}>Restaurar arte original</button> : null}
  </article></div>;
}
