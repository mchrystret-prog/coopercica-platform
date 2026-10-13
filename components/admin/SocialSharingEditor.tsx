"use client";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { UploadRequirements } from "./UploadRequirements";
export function SocialSharingEditor({ value, busy, onChange, onUpload }: { value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <article className="cms-section-card"><h2>Imagem de compartilhamento</h2>
    <p>Escolha a imagem que aparece na prévia quando alguém compartilha um link do site no WhatsApp e nas redes sociais.</p>
    <div className="settings-form"><label>Enviar imagem<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={onUpload} /><UploadRequirements rule="socialImage" /></label>
    <div className="form-span-full"><Image src={value.image || "/opengraph-image"} alt="Prévia da imagem de compartilhamento" width={1200} height={630} unoptimized style={{ width: "100%", maxWidth: 600, height: "auto", borderRadius: 16 }} /></div></div>
    <p>Após enviar, clique em Salvar alterações. Aplicativos de mensagens e redes sociais podem manter a prévia anterior em cache por algum tempo.</p>
    <button type="button" className="button button-secondary" disabled={busy || !value.image} onClick={() => onChange({ image: "" })}>Restaurar imagem padrão</button>
  </article>;
}
