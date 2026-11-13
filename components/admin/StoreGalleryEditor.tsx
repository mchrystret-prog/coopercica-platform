"use client";
import { CmsFileInput } from "./CmsFileInput";
import { Button } from "@/components/ui/Button/Button";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { UploadRequirements } from "./UploadRequirements";
export function StoreGalleryEditor({ photos, storeNumber, busy, onChange, onUpload }: { photos: string[]; storeNumber: string | number; busy: boolean; onChange: (photos: string[]) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const move = (index: number, direction: number) => { const next = [...photos]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; onChange(next); };
  return <section className="cms-section-card form-span-full" aria-label="Fotos da unidade"><h2>Fotos da unidade</h2><p>A primeira foto aparece no círculo do card. Todas aparecem na galeria do modal.</p>
    <label>Adicionar fotos<CmsFileInput type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={busy || photos.length >= 6} onChange={onUpload} /><UploadRequirements rule="store">Até 6 fotos. Salve as alterações da loja para publicar.</UploadRequirements></label>
    {!photos.length ? <p>A galeria usa a imagem original da unidade, quando disponível.</p> : photos.map((src, index) => <div key={src} className="cms-section-card">
      <h3>{index === 0 ? "Foto principal" : `Foto ${index + 1}`}</h3><Image src={src} alt={`Foto ${index + 1} da Loja ${storeNumber}`} width={1600} height={1000} style={{ width: "100%", maxWidth: 360, height: "auto", borderRadius: 16 }} />
      <div className="form-actions"><Button variant="secondary" type="button" className="button button-secondary" disabled={busy || index === 0} onClick={() => move(index, -1)}>Mover para cima</Button><Button variant="secondary" type="button" className="button button-secondary" disabled={busy || index === photos.length - 1} onClick={() => move(index, 1)}>Mover para baixo</Button><Button variant="danger" type="button" className="button button-secondary" disabled={busy} onClick={() => onChange(photos.filter((_, i) => i !== index))}>Remover foto {index + 1}</Button></div>
    </div>)}
  </section>;
}
