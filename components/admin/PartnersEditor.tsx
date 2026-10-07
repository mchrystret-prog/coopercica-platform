"use client";
import { partnerRows, type Partner } from "@/lib/home-partners";
export function PartnersEditor({ value, busy, onChange }: { value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void }) {
  const rows = partnerRows(value);
  const update = (items: Partner[]) => onChange({ items: JSON.stringify(items) });
  const patch = (index: number, change: Partial<Partner>) => update(rows.map((item, i) => i === index ? { ...item, ...change } : item));
  return <div className="cms-section-card"><div className="cms-section-card-head"><div><small>Página inicial · abaixo dos vídeos</small><h2>Parceiros</h2></div></div>
    <p>Cadastre parcerias reais e seus destinos. Os cards podem ser arrastados ou navegados com setas. A opção Faculdades começa como rascunho; publique somente após informar a instituição e o link correto.</p>
    <fieldset disabled={busy}><legend>Configuração da seção</legend><div className="settings-form">
      <label>Exibir seção<select value={value.enabled || "true"} onChange={e => onChange({ enabled: e.target.value })}><option value="true">Sim</option><option value="false">Não</option></select></label>
      <label>Título<input value={value.title ?? "Parceiros"} maxLength={100} onChange={e => onChange({ title: e.target.value })} /></label>
    </div></fieldset>
    {rows.map((item, index) => <fieldset disabled={busy} key={index}><legend>Parceiro {index + 1}</legend><div className="settings-form">
      <label>Título<input value={item.title} maxLength={100} onChange={e => patch(index, { title: e.target.value })} /></label>
      <label>Descrição<textarea value={item.description} maxLength={240} rows={2} onChange={e => patch(index, { description: e.target.value })} /></label>
      <label>Link de destino<input type="url" value={item.href} placeholder="https://..." onChange={e => patch(index, { href: e.target.value })} /><small>Use o link direto da parceria ou da loja no iFood.</small></label>
      <label>Cor<select value={item.theme} onChange={e => patch(index, { theme: e.target.value as Partner["theme"] })}><option value="green">Verde</option><option value="red">Vermelho</option></select></label>
      <label>Ilustração<select value={item.icon} onChange={e => patch(index, { icon: e.target.value as Partner["icon"] })}><option value="bag">Compras / Delivery</option><option value="education">Educação</option><option value="partnership">Parceria</option></select></label>
      <label>Status<select value={item.enabled ? "true" : "false"} onChange={e => patch(index, { enabled: e.target.value === "true" })}><option value="true">Publicado</option><option value="false">Rascunho</option></select></label>
      <div className="form-span-full"><button type="button" disabled={index === 0} aria-label={`Mover parceiro ${index + 1} para cima`} onClick={() => { const next = [...rows]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update(next); }}>Subir</button> <button type="button" disabled={index === rows.length - 1} aria-label={`Mover parceiro ${index + 1} para baixo`} onClick={() => { const next = [...rows]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update(next); }}>Descer</button> <button type="button" aria-label={`Remover parceiro ${index + 1}`} onClick={() => update(rows.filter((_, i) => i !== index))}>Remover</button></div>
    </div></fieldset>)}
    <button type="button" disabled={busy || rows.length >= 20} onClick={() => update([...rows, { title: "", description: "", href: "", theme: "green", icon: "partnership", enabled: false }])}>+ Adicionar parceiro</button>
    <p>Até 20 parceiros. Salve as alterações para publicar.</p>
  </div>;
}
