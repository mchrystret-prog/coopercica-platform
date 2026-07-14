"use client";

import type { Store } from "@/data/stores";
import { useState } from "react";

export function Stores({ items }: { items: Store[] }) {
  const [current, setCurrent] = useState(0);

  const store = items[current];

  return (
    <section className="section stores-section">
      <div className="shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Nossas Lojas</span>
            <h2>Sempre perto de você.</h2>
          </div>

          <p>
            Escolha uma unidade e encontre as informações para a sua próxima
            visita.
          </p>
        </div>

        <div className="store-stage">
          <div
            className="store-photo"
            style={{
              backgroundImage: `linear-gradient(180deg,transparent,rgba(0,0,0,.68)),url(${store.image})`,
            }}
          >
            <div>
              <span>{store.city}</span>
              <h3>
                {store.name} — {store.neighborhood}
              </h3>
            </div>
          </div>

          <div className="store-info">
            <span className="eyebrow">Unidade selecionada</span>

            <h3>{store.name}</h3>

            <p>
              {store.neighborhood} • {store.city}
            </p>

            <p>{store.address}</p>

            <p>{store.hours}</p>

            <a
              className="button"
              target="_blank"
              rel="noreferrer"
              href={store.mapsUrl}
            >
              Ver rota ↗
            </a>
          </div>
        </div>

        <div className="store-tabs">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrent(index)}
              className={index === current ? "active" : ""}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}