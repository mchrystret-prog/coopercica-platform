"use client";

import { CmsFileInput } from "./CmsFileInput";
import { Button } from "@/components/ui/Button/Button";
import type { ChangeEvent } from "react";
import { historyItems } from "@/data/history";
import { historyEntries, resolveHistory, type HistoryEntry } from "@/lib/history-timeline";
import { UploadRequirements } from "./UploadRequirements";

export function HistoryImageEditor({
  images,
  busy,
  onUpload,
  onRestore,
  onChange,
}: {
  images: Record<string, string>;
  busy: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
  onRestore: (id: string) => void;
  onChange: (entries: HistoryEntry[]) => void;
}) {
  const entries = historyEntries(images);
  const items = resolveHistory(images, historyItems, true);
  const patch = (id: string, values: Partial<HistoryEntry>) => onChange(entries.map(item => item.id === id ? { ...item, ...values } : item));
  const move = (index: number, delta: number) => { const next = [...entries]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange(next); };
  return (
    <div className="cms-section-editor">
      <p>
        Adicione, edite, oculte ou remova os marcos. A ordem abaixo será usada na Home e em Quem Somos após salvar.
      </p>
      <Button type="button" variant="primary" disabled={busy || entries.length >= 80} onClick={() => onChange([...entries, { id: crypto.randomUUID(), year: "", title: "Novo marco", description: "", image: "", imageAlt: "", theme: "light", active: true }])}>Adicionar marco</Button>
      {!items.length ? <p>Nenhum marco cadastrado. Adicione um marco para exibir a timeline.</p> : null}
      {items.map((item, index) => (
        <article className="cms-section-card" key={item.id}>
          <div className="cms-section-card-head">
            <div>
              <small>{item.year}</small>
              <h2>{item.title}</h2>
            </div>
          </div>
          {item.image ? <img
            className="cms-upload-preview"
            src={images[item.id] || item.image}
            alt={item.imageAlt}
          /> : null}
          <div className="settings-form">
            <label>Ano ou período<input value={item.year} maxLength={30} disabled={busy} placeholder="Ex.: 2026 ou Hoje" onChange={e => patch(item.id, { year: e.target.value })} /></label>
            <label>Chamada / data completa<input value={item.eyebrow} maxLength={120} disabled={busy} onChange={e => patch(item.id, { eyebrow: e.target.value })} /></label>
            <label className="form-span-full">Título<input value={item.title} maxLength={160} disabled={busy} onChange={e => patch(item.id, { title: e.target.value })} /></label>
            <label className="form-span-full">Descrição<textarea value={item.description} maxLength={4000} rows={4} disabled={busy} onChange={e => patch(item.id, { description: e.target.value })} /></label>
            <label>Descrição da imagem<input value={item.imageAlt} maxLength={300} disabled={busy} onChange={e => patch(item.id, { imageAlt: e.target.value })} /></label>
            <label>Tema do cartão<select value={item.theme} disabled={busy} onChange={e => patch(item.id, { theme: e.target.value as HistoryEntry["theme"] })}><option value="light">Claro</option><option value="soft">Suave</option><option value="medium">Intermediário</option><option value="dark">Escuro</option></select></label>
            <label><input type="checkbox" checked={entries[index].active !== false} disabled={busy} onChange={e => patch(item.id, { active: e.target.checked })} />Exibir este marco no site</label>
            <label className="form-span-full">
              Foto de {item.year}
              <CmsFileInput
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={(e) => onUpload(e, item.id)}
              />
              <UploadRequirements rule="history" />
            </label>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
          <Button type="button" variant="secondary" disabled={busy || index === 0} onClick={() => move(index, -1)}>Mover para cima</Button>
          <Button type="button" variant="secondary" disabled={busy || index === items.length - 1} onClick={() => move(index, 1)}>Mover para baixo</Button>
          <Button type="button" variant="danger" disabled={busy} onClick={() => { if (window.confirm(`Remover o marco ${item.year || "novo"} — ${item.title}? A remoção será publicada somente ao salvar.`)) onChange(entries.filter(entry => entry.id !== item.id)); }}>Remover marco</Button>
          </div>
          {images[item.id] && historyItems.some(original => original.id === item.id) ? (
            <Button variant="secondary"
              type="button"
              className="button button-secondary"
              disabled={busy}
              onClick={() => onRestore(item.id)}
            >
              Restaurar imagem original
            </Button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
