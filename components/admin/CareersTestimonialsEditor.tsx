"use client";

import { Button } from "@/components/ui/Button/Button";
import type { CareersTestimonial } from "@/lib/careers-testimonials";

export function CareersTestimonialsEditor({
  testimonials,
  busy,
  onChange,
}: {
  testimonials: CareersTestimonial[];
  busy: boolean;
  onChange: (items: CareersTestimonial[]) => void;
}) {
  function patch(id: string, changes: Partial<CareersTestimonial>) {
    onChange(testimonials.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function add() {
    onChange([...testimonials, {
      id: crypto.randomUUID(),
      quote: "",
      name: "",
      role: "",
      tenure: "",
      order: testimonials.reduce((max, item) => Math.max(max, item.order), 0) + 1,
      active: true,
    }]);
  }

  return (
    <article className="cms-section-card">
      <div className="cms-section-card-head">
        <div>
          <small>Portal de Vagas</small>
          <h2>Depoimentos dos colaboradores</h2>
        </div>
        <Button type="button" onClick={add} disabled={busy}>Adicionar depoimento</Button>
      </div>
      <p>
        Cadastre as histórias de quem faz parte da Coopercica. Os depoimentos ativos
        aparecem na seção verde do Portal de Vagas, em ordem crescente.
      </p>
      {testimonials.length === 0 ? (
        <p className="cms-empty">Nenhum depoimento cadastrado. Adicione o primeiro para começar.</p>
      ) : testimonials.map((item, index) => (
        <section className="cms-section-card" key={item.id}>
          <div className="cms-section-card-head">
            <div>
              <small>Depoimento {index + 1}</small>
              <h3>{item.name || "Novo depoimento"}</h3>
            </div>
            <label>
              <input
                type="checkbox"
                checked={item.active}
                disabled={busy}
                onChange={(event) => patch(item.id, { active: event.target.checked })}
              />
              Exibir no site
            </label>
          </div>
          <div className="settings-form">
            <label className="form-span-full">
              Depoimento
              <textarea
                rows={5}
                maxLength={3000}
                value={item.quote}
                disabled={busy}
                placeholder="Escreva o depoimento do colaborador"
                onChange={(event) => patch(item.id, { quote: event.target.value })}
              />
            </label>
            <label>
              Nome do colaborador
              <input
                value={item.name}
                maxLength={160}
                disabled={busy}
                onChange={(event) => patch(item.id, { name: event.target.value })}
              />
            </label>
            <label>
              Cargo
              <input
                value={item.role}
                maxLength={160}
                disabled={busy}
                onChange={(event) => patch(item.id, { role: event.target.value })}
              />
            </label>
            <label>
              Tempo de casa
              <input
                value={item.tenure}
                maxLength={100}
                disabled={busy}
                placeholder="Ex.: 10 anos de casa"
                onChange={(event) => patch(item.id, { tenure: event.target.value })}
              />
            </label>
            <label>
              Ordem de exibição
              <input
                type="number"
                min={1}
                step={1}
                value={item.order}
                disabled={busy}
                onChange={(event) => patch(item.id, { order: Math.max(1, Number(event.target.value) || 1) })}
              />
            </label>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => onChange(testimonials.filter((entry) => entry.id !== item.id))}
          >
            Remover depoimento
          </Button>
        </section>
      ))}
    </article>
  );
}
