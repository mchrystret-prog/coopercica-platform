"use client";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { getCareersHeroImage } from "@/lib/careers-hero";
export function CareersHeroEditor({
  value,
  busy,
  onChange,
  onUpload,
}: {
  value: Record<string, string>;
  busy: boolean;
  onChange: (patch: Record<string, string>) => void;
  onUpload: (
    event: ChangeEvent<HTMLInputElement>,
    field: "image" | "mobileImage",
  ) => void;
}) {
  const hero = getCareersHeroImage(value);
  return (
    <div className="cms-section-editor">
      <article className="cms-section-card">
        <div className="cms-section-card-head">
          <div>
            <small>Portal de Vagas</small>
            <h2>Foto de destaque</h2>
          </div>
        </div>
        <p>
          Use uma foto real da equipe Coopercica. Ela acompanha o texto no
          header e aparece abaixo dele no celular. Após o envio, clique em
          Salvar alterações para publicar.
        </p>
        <div className="settings-form">
          {(
            [
              ["image", "Foto principal"],
              ["mobileImage", "Foto mobile (opcional)"],
            ] as const
          ).map(([field, label]) => {
            const src = field === "image" ? hero?.src : hero?.mobileSrc;
            return (
              <label key={field}>
                {label}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy || (field === "mobileImage" && !value.image)}
                  onChange={(e) => onUpload(e, field)}
                />
                <small>
                  {field === "image"
                    ? "Recomendado: 1600 × 1200 px (4:3)."
                    : "Recomendado: 1080 × 810 px (4:3). Sem esta imagem, o celular usa a foto principal."}{" "}
                  JPG, PNG ou WebP, até 15 MB.
                </small>
                {src ? (
                  <Image
                    className="cms-upload-preview"
                    src={src}
                    alt={
                      field === "image"
                        ? "Prévia da foto principal"
                        : "Prévia da foto mobile"
                    }
                    width={640}
                    height={480}
                    style={{
                      objectFit: "cover",
                      objectPosition: hero?.position,
                    }}
                  />
                ) : null}
              </label>
            );
          })}
          <label>
            Descrição da foto (acessibilidade)
            <input
              maxLength={300}
              disabled={busy}
              value={value.alt || ""}
              placeholder="Ex.: Colaboradores da Coopercica reunidos na loja"
              onChange={(e) => onChange({ alt: e.target.value })}
            />
            <small>
              Descreva quem aparece e o contexto da foto, sem repetir o título
              do header.
            </small>
          </label>
          <label>
            Enquadramento
            <select
              disabled={busy}
              value={value.position || "center"}
              onChange={(e) => onChange({ position: e.target.value })}
            >
              <option value="center">Centro</option>
              <option value="top">Priorizar o topo</option>
              <option value="bottom">Priorizar a parte inferior</option>
            </select>
            <small>A foto preenche o espaço com um recorte proporcional.</small>
          </label>
        </div>
        {value.mobileImage ? (
          <button
            className="button button-secondary"
            disabled={busy}
            onClick={() => onChange({ mobileImage: "" })}
          >
            Remover versão mobile
          </button>
        ) : null}
        {value.image ? (
          <button
            className="button button-secondary"
            disabled={busy}
            onClick={() => onChange({ image: "", mobileImage: "" })}
          >
            Remover foto do header
          </button>
        ) : null}
      </article>
    </div>
  );
}
