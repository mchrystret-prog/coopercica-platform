"use client";
import { useEffect, useRef, useState } from "react";
import type { Magazine } from "@/types/content";
import { emptyMagazineEditorial, magazineEditorials, type MagazineEditorial } from "@/lib/magazine-editorial";
import type { MagazinePdfSuggestion } from "@/lib/magazine-pdf-summary";

export function MagazineEditorialEditor({ magazines, value, busy, onChange }: { magazines: Magazine[]; value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void }) {
  const [editionId, setEditionId] = useState("");
  const [reading, setReading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState<{ id: string; content: MagazinePdfSuggestion } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  const edition = magazines.find(item => item.id === editionId) ?? magazines[0];
  const entries = magazineEditorials(value);
  const editorial = edition ? entries[edition.id] ?? emptyMagazineEditorial : emptyMagazineEditorial;
  function update(patch: Partial<MagazineEditorial>) {
    if (!edition) return;
    onChange({ editionDetails: JSON.stringify({ ...entries, [edition.id]: { ...editorial, ...patch } }) });
  }
  async function readPdf() {
    if (!edition?.pdfHref || controller.current) return;
    const active = new AbortController();
    controller.current = active;
    const id = edition.id;
    setReading(true); setSuggestion(null); setError(""); setStatus("Abrindo PDF…");
    const timeout = window.setTimeout(() => active.abort(new Error("A leitura excedeu dois minutos. Tente novamente ou preencha manualmente.")), 120_000);
    try {
      const { readMagazinePdf } = await import("@/lib/magazine-pdf-browser");
      const content = await readMagazinePdf(edition.pdfHref, active.signal, message => {
        if (controller.current === active) setStatus(message);
      });
      if (controller.current === active && !active.signal.aborted) {
        setSuggestion({ id, content }); setStatus("Sugestão pronta para revisão.");
      }
    } catch (cause) {
      if (controller.current === active) {
        const reason = active.signal.aborted ? active.signal.reason : cause;
        setError(reason instanceof Error && reason.name !== "AbortError" ? reason.message : "Leitura cancelada.");
        setStatus("");
      }
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === active) { controller.current = null; setReading(false); }
    }
  }
  return <article className="cms-section-card">
    <div className="cms-section-card-head"><div><small>Página inicial · Revista</small><h2>Nessa edição · resumo e destaques</h2></div></div>
    <p>As capas e PDFs continuam no menu Revistas. Aqui você escolhe a edição em destaque e descreve o conteúdo real de cada revista. Clique em Salvar alterações para publicar.</p>
    {edition ? <fieldset disabled={busy}><legend>Conteúdo editorial</legend><div className="settings-form">
      <label>Edição em destaque<select value={value.featuredId || ""} onChange={event => onChange({ featuredId: event.target.value })}><option value="">Mais recente automaticamente</option>{magazines.map(item => <option key={item.id} value={item.id}>{item.title} · {item.edition}</option>)}</select><small>Se a edição escolhida sair do ar, a próxima edição publicada aparece automaticamente.</small></label>
      <label>Edição para editar<select disabled={reading} value={edition.id} onChange={event => { setEditionId(event.target.value); setSuggestion(null); setError(""); setStatus(""); }}>{magazines.map(item => <option key={item.id} value={item.id}>{item.title} · {item.edition}</option>)}</select></label>
      <div className="form-span-full">
        <button type="button" disabled={reading || !edition.pdfHref} onClick={readPdf}>Ler PDF e sugerir conteúdo</button>
        {reading && <button type="button" onClick={() => controller.current?.abort()}>Cancelar leitura</button>}
        <p>Identifica quadros e títulos na camada de texto do PDF, sem enviar o arquivo a um serviço de IA. Revise a sugestão antes de aplicar. Até 15 MB e 60 páginas.</p>
        {!edition.pdfHref && <p>Cadastre um PDF válido desta edição no menu Revistas para usar a leitura automática.</p>}
        <p role="status" aria-live="polite">{status}</p>
        {error && <p role="alert">{error}</p>}
        {suggestion?.id === edition.id && <section aria-label="Sugestão extraída do PDF">
          <h3>Revisar sugestão</h3>
          <p>{suggestion.content.summary}</p>
          <ul>{suggestion.content.highlights.map((item, index) => <li key={index}><strong>{item.label}</strong>: {item.text} · página {item.page}</li>)}</ul>
          <p>Lidas {suggestion.content.pagesRead} de {suggestion.content.totalPages} páginas. O reconhecimento pode omitir quadros ou associar títulos incorretamente; confira com a revista.</p>
          <button type="button" onClick={() => {
            update({ summary: suggestion.content.summary, highlights: suggestion.content.highlights.map(({ label, text }) => ({ label, text })) });
            setSuggestion(null); setStatus("Sugestão aplicada aos campos. Revise e clique em Salvar alterações para publicar.");
          }}>Aplicar sugestão ao resumo e destaques</button>
          <button type="button" onClick={() => { setSuggestion(null); setStatus("Sugestão descartada. Os campos foram preservados."); }}>Descartar sugestão</button>
        </section>}
      </div>
      <label className="form-span-full">Título editorial<input value={editorial.headline} maxLength={140} placeholder={edition.title} onChange={event => update({ headline: event.target.value })} /><small>Ex.: Cooperar é cuidar. Se ficar vazio, usamos o título cadastrado na revista.</small></label>
      <label className="form-span-full">Resumo para “Nessa edição”<textarea rows={4} maxLength={700} value={editorial.summary} onChange={event => update({ summary: event.target.value })} /><small>Apresente o conteúdo real desta revista. Abaixo, adicione os assuntos com categoria, como no índice da edição. Sem resumo cadastrado, aparece uma chamada geral da seção.</small></label>
      {editorial.highlights.map((item, index) => <div className="form-span-full settings-form" key={index}>
        <label>Categoria do destaque {index + 1}<input maxLength={60} value={item.label} placeholder="Ex.: Receitas" onChange={event => update({ highlights: editorial.highlights.map((row, i) => i === index ? { ...row, label: event.target.value } : row) })} /></label>
        <label>Conteúdo do destaque {index + 1}<input maxLength={200} value={item.text} placeholder="Título ou assunto da matéria" onChange={event => update({ highlights: editorial.highlights.map((row, i) => i === index ? { ...row, text: event.target.value } : row) })} /></label>
        <button type="button" aria-label={`Remover destaque ${index + 1}`} onClick={() => update({ highlights: editorial.highlights.filter((_, i) => i !== index) })}>Remover destaque</button>
      </div>)}
      <div className="form-span-full"><button type="button" disabled={editorial.highlights.length >= 8} onClick={() => update({ highlights: [...editorial.highlights, { label: "", text: "" }] })}>+ Adicionar destaque</button><p>Até 8 destaques. Itens sem conteúdo não aparecem no site.</p></div>
    </div></fieldset> : <p>Publique uma revista no menu Revistas para configurar o destaque.</p>}
  </article>;
}
