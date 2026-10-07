"use client";
import { useState } from "react";
import type { Magazine } from "@/types/content";
import { emptyMagazineEditorial, magazineEditorials, type MagazineEditorial } from "@/lib/magazine-editorial";

export function MagazineEditorialEditor({ magazines, value, busy, onChange }: { magazines: Magazine[]; value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void }) {
  const [editionId, setEditionId] = useState("");
  const edition = magazines.find(item => item.id === editionId) ?? magazines[0];
  const entries = magazineEditorials(value);
  const editorial = edition ? entries[edition.id] ?? emptyMagazineEditorial : emptyMagazineEditorial;
  function update(patch: Partial<MagazineEditorial>) {
    if (!edition) return;
    onChange({ editionDetails: JSON.stringify({ ...entries, [edition.id]: { ...editorial, ...patch } }) });
  }
  return <article className="cms-section-card">
    <div className="cms-section-card-head"><div><small>Página inicial · Revista</small><h2>Capa, resumo e destaques por edição</h2></div></div>
    <p>As capas e PDFs continuam no menu Revistas. Aqui você escolhe a edição em destaque e descreve o conteúdo real de cada revista. Clique em Salvar alterações para publicar.</p>
    {edition ? <fieldset disabled={busy}><legend>Conteúdo editorial</legend><div className="settings-form">
      <label>Edição em destaque<select value={value.featuredId || ""} onChange={event => onChange({ featuredId: event.target.value })}><option value="">Mais recente automaticamente</option>{magazines.map(item => <option key={item.id} value={item.id}>{item.title} · {item.edition}</option>)}</select><small>Se a edição escolhida sair do ar, a próxima edição publicada aparece automaticamente.</small></label>
      <label>Edição para editar<select value={edition.id} onChange={event => setEditionId(event.target.value)}>{magazines.map(item => <option key={item.id} value={item.id}>{item.title} · {item.edition}</option>)}</select></label>
      <label className="form-span-full">Título editorial<input value={editorial.headline} maxLength={140} placeholder={edition.title} onChange={event => update({ headline: event.target.value })} /><small>Ex.: Cooperar é cuidar. Se ficar vazio, usamos o título cadastrado na revista.</small></label>
      <label className="form-span-full">Resumo desta edição<textarea rows={4} maxLength={700} value={editorial.summary} onChange={event => update({ summary: event.target.value })} /><small>Apresente o conteúdo desta edição. Sem resumo cadastrado, aparece uma chamada geral da seção.</small></label>
      {editorial.highlights.map((item, index) => <div className="form-span-full settings-form" key={index}>
        <label>Categoria do destaque {index + 1}<input maxLength={60} value={item.label} placeholder="Ex.: Receitas" onChange={event => update({ highlights: editorial.highlights.map((row, i) => i === index ? { ...row, label: event.target.value } : row) })} /></label>
        <label>Conteúdo do destaque {index + 1}<input maxLength={200} value={item.text} placeholder="Título ou assunto da matéria" onChange={event => update({ highlights: editorial.highlights.map((row, i) => i === index ? { ...row, text: event.target.value } : row) })} /></label>
        <button type="button" aria-label={`Remover destaque ${index + 1}`} onClick={() => update({ highlights: editorial.highlights.filter((_, i) => i !== index) })}>Remover destaque</button>
      </div>)}
      <div className="form-span-full"><button type="button" disabled={editorial.highlights.length >= 8} onClick={() => update({ highlights: [...editorial.highlights, { label: "", text: "" }] })}>+ Adicionar destaque</button><p>Até 8 destaques. Itens sem conteúdo não aparecem no site.</p></div>
    </div></fieldset> : <p>Publique uma revista no menu Revistas para configurar o destaque.</p>}
  </article>;
}
