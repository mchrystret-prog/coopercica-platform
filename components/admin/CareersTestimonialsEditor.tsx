"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import type { CareersTestimonial } from "@/lib/careers-testimonials";

export function CareersTestimonialsEditor({
  testimonials,
  busy,
  onChange,
  onUpload,
  uploadErrors = {},
}: {
  testimonials: CareersTestimonial[];
  busy: boolean;
  onChange: (items: CareersTestimonial[]) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, testimonialId: string) => void;
  uploadErrors?: Record<string, string>;
}) {
  function patch(id: string, changes: Partial<CareersTestimonial>) {
    onChange(testimonials.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  const [editingId, setEditingId] = useState<string | null>(null);

  function add() {
    const id = crypto.randomUUID();
    onChange([...testimonials, {
      id,
      quote: "",
      name: "",
      role: "",
      tenure: "",
      image: "",
      order: testimonials.reduce((max, item) => Math.max(max, item.order), 0) + 1,
      active: true,
    }]);
    setEditingId(id);
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
        <div className="cms-record-item" key={item.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: 14, border: "1px solid #dfe5df", borderRadius: 10 }}>
            {item.image ? <Image src={item.image} alt="" width={52} height={52} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: "50%" }} /> : <span style={{ width: 52, height: 52, display: "grid", placeItems: "center", background: "#f2f4f2", borderRadius: "50%" }}>{item.name?.trim().charAt(0).toUpperCase() || "?"}</span>}
            <div style={{ flex: "1 1 220px", minWidth: 0 }}><strong>{item.name || `Depoimento ${index + 1}`}</strong><div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, color: "#647064", marginTop: 4 }}><span>{item.role || "Cargo não informado"}</span><span>{item.tenure || "Tempo de casa não informado"}</span><span>{item.active ? "Ativo" : "Inativo"}</span></div></div>
            <div style={{ display: "flex", gap: 8 }}><Button type="button" variant="secondary" disabled={busy} onClick={() => setEditingId(editingId === item.id ? null : item.id)}>{editingId === item.id ? "Fechar edição" : "Editar"}</Button><Button type="button" variant="secondary" disabled={busy} onClick={() => { onChange(testimonials.filter((entry) => entry.id !== item.id)); if (editingId === item.id) setEditingId(null); }}>Apagar</Button></div>
          </div>
          {editingId === item.id ? <section className="cms-section-card" style={{ marginTop: 10 }}>
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
              Foto do colaborador *
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} aria-required="true" onChange={(event) => onUpload(event, item.id)} />
              <small>Obrigatória para publicar o depoimento. Prefira uma foto quadrada, com o rosto bem visível.</small>
              {uploadErrors[`careers-testimonial:${item.id}`] ? <small className="cms-upload-error" role="alert">{uploadErrors[`careers-testimonial:${item.id}`]}</small> : null}
              {item.image ? <Image className="cms-upload-preview" src={item.image} alt={`Foto de ${item.name || "colaborador"}`} width={240} height={240} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "50%" }} /> : <small>Nenhuma foto enviada.</small>}
              {item.image ? <Button type="button" variant="secondary" disabled={busy} onClick={() => patch(item.id, { image: "" })}>Remover foto</Button> : null}
            </label>
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
          </section> : null}
        </div>
      ))}
    </article>
  );
}
