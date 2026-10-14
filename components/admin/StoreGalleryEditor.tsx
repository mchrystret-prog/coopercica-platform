"use client";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import type { Store } from "@/data/stores";
import { storeGallery } from "@/lib/store-gallery";
import { UploadRequirements } from "./UploadRequirements";
export function StoreGalleryEditor({ stores, value, busy, onChange, onUpload }: { stores: Store[]; value: Record<string,string>; busy: boolean; onChange: (patch: Record<string,string>) => void; onUpload: (event: ChangeEvent<HTMLInputElement>, slug: string) => void }) {
  const [slug, setSlug] = useState(stores[0]?.slug || "");
  const store = stores.find(item => item.slug === slug);
  const photos = storeGallery(value, slug);
  const update = (next: string[]) => onChange({ [slug]: JSON.stringify(next) });
  const move = (index: number, direction: number) => { const next = [...photos]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; update(next); };
  return <article className="cms-section-card"><h2>Fotos das lojas</h2><p>A primeira foto aparece na moldura oval do cartão. As demais aparecem na galeria do modal. Endereço, horários e serviços continuam no cadastro de Lojas.</p>
    <div className="settings-form"><label>Unidade<select value={slug} disabled={busy} onChange={event => setSlug(event.target.value)}>{stores.map(item => <option key={item.slug} value={item.slug}>Loja {item.storeNumber} · {item.name}</option>)}</select></label>
      <label>Adicionar fotos<input key={slug} type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={busy || !store || photos.length >= 6} onChange={event => onUpload(event, slug)} /><UploadRequirements rule="store">Até 6 fotos por loja. Clique em Salvar alterações para publicar.</UploadRequirements></label>
    </div>
    {!photos.length ? <p>A galeria usará a foto principal do cadastro, quando disponível. Envie fotos desta unidade para personalizar o cartão e o modal.</p> : photos.map((src, index) => <div key={src} className="cms-section-card">
      <h3>{index === 0 ? "Foto principal" : `Foto ${index + 1}`}</h3><Image src={src} alt={`Foto ${index + 1} da Loja ${store?.storeNumber}`} width={1600} height={1000} style={{ width:"100%",maxWidth:360,height:"auto",borderRadius:16 }} />
      <div className="form-actions"><button type="button" className="button button-secondary" disabled={busy || index === 0} onClick={() => move(index,-1)}>Mover para cima</button><button type="button" className="button button-secondary" disabled={busy || index === photos.length-1} onClick={() => move(index,1)}>Mover para baixo</button><button type="button" className="button button-secondary" disabled={busy} onClick={() => update(photos.filter((_,i)=>i!==index))}>Remover foto {index+1}</button></div>
    </div>)}
  </article>;
}
