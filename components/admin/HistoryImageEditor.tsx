"use client";

import type { ChangeEvent } from "react";
import { historyItems } from "@/data/history";

export function HistoryImageEditor({
  images,
  busy,
  onUpload,
  onRestore,
}: {
  images: Record<string, string>;
  busy: boolean;
  onUpload: (event: ChangeEvent<HTMLInputElement>, id: string) => void;
  onRestore: (id: string) => void;
}) {
  return (
    <div className="cms-section-editor">
      <p>
        Substitua a foto de cada capítulo. As imagens serão usadas na Home e em
        Quem Somos após salvar.
      </p>
      {historyItems.map((item) => (
        <article className="cms-section-card" key={item.id}>
          <div className="cms-section-card-head">
            <div>
              <small>{item.year}</small>
              <h2>{item.title}</h2>
            </div>
          </div>
          <img
            className="cms-upload-preview"
            src={images[item.id] || item.image}
            alt={item.imageAlt}
          />
          <div className="settings-form">
            <label className="form-span-full">
              Foto de {item.year}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={(e) => onUpload(e, item.id)}
              />
              <small>
                Recomendado: imagem horizontal, 1600 × 1000 px. JPG, PNG ou
                WebP, até 15 MB.
              </small>
            </label>
          </div>
          {images[item.id] ? (
            <button
              type="button"
              className="button button-secondary"
              disabled={busy}
              onClick={() => onRestore(item.id)}
            >
              Restaurar imagem original
            </button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
