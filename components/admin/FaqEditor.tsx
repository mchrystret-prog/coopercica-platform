"use client";
import { getFaqItems, type FaqItem } from "@/lib/home-faq";
export function FaqEditor({ value, busy, onChange }: { value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void }) {
  const items = getFaqItems(value);
  const updateItems = (next: FaqItem[]) => onChange({ items: JSON.stringify(next) });
  const update = (index: number, patch: Partial<FaqItem>) => updateItems(items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const move = (index: number, direction: number) => { const next = [...items]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; updateItems(next); };
  return <div className="cms-section-editor">
    <article className="cms-section-card"><h2>Perguntas Frequentes</h2><p>As perguntas ficam visíveis e as respostas abrem ao clicar. A seção aparece antes do rodapé.</p>
      <div className="settings-form">
        <label><input type="checkbox" checked={value.enabled !== "false"} disabled={busy} onChange={e => onChange({ enabled: String(e.target.checked) })} /> Exibir seção no site</label>
        <label>Chamada superior<input maxLength={80} value={value.eyebrow ?? "Tire suas dúvidas"} disabled={busy} onChange={e => onChange({ eyebrow: e.target.value })} /></label>
        <label>Título<input maxLength={100} value={value.title ?? "Perguntas frequentes."} disabled={busy} onChange={e => onChange({ title: e.target.value })} /></label>
        <label>Introdução (opcional)<textarea maxLength={400} value={value.description || ""} disabled={busy} onChange={e => onChange({ description: e.target.value })} /></label>
      </div>
    </article>
    {items.map((item, index) => <article className="cms-section-card" key={item.id}>
      <h3>Pergunta {index + 1}</h3><div className="settings-form">
        <label>Pergunta<input maxLength={200} value={item.question} disabled={busy} onChange={e => update(index, { question: e.target.value })} /></label>
        <label>Resposta<textarea rows={5} maxLength={4000} value={item.answer} disabled={busy} onChange={e => update(index, { answer: e.target.value })} /></label>
        <label><input type="checkbox" checked={item.active} disabled={busy} onChange={e => update(index, { active: e.target.checked })} /> Exibir pergunta</label>
      </div><div className="form-actions">
        <button type="button" className="button button-secondary" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Mover pergunta ${index + 1} para cima`}>Subir</button>
        <button type="button" className="button button-secondary" disabled={busy || index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Mover pergunta ${index + 1} para baixo`}>Descer</button>
        <button type="button" className="button button-secondary" disabled={busy} onClick={() => updateItems(items.filter((_, i) => i !== index))}>Remover pergunta {index + 1}</button>
      </div>
    </article>)}
    <button type="button" className="button" disabled={busy || items.length >= 30} onClick={() => updateItems([...items, { id: crypto.randomUUID(), question: "", answer: "", active: true }])}>Adicionar pergunta</button>
  </div>;
}
