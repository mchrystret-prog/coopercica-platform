"use client";

import type { Store } from "@/data/stores";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Stores.module.css";

type StoresProps = {
  items: Store[];
};

export function Stores({ items }: StoresProps) {
  const activeItems = useMemo(
    () => items.filter((item) => item.active !== false),
    [items],
  );

  const cities = useMemo(
    () => Array.from(new Set(activeItems.map((item) => item.city))),
    [activeItems],
  );

  const [selectedCity, setSelectedCity] = useState(cities[0] ?? "");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
    activeItems[0]?.id ?? null,
  );

  const cityStores = useMemo(
    () => activeItems.filter((item) => item.city === selectedCity),
    [activeItems, selectedCity],
  );

  const selectedStore =
    cityStores.find((item) => item.id === selectedStoreId) ?? cityStores[0];

  if (!selectedStore || cities.length === 0) return null;

  function selectCity(city: string) {
    const firstStore = activeItems.find((item) => item.city === city);

    setSelectedCity(city);
    setSelectedStoreId(firstStore?.id ?? null);
  }

  return (
    <Section
      id="lojas"
      tone="muted"
      className={styles.section}
      tabIndex={-1}
    >
      <Container>
        <SectionHeader
          eyebrow="Nossas lojas"
          title={["Sempre perto", "de você."]}
          description="Escolha uma cidade e encontre a unidade ideal para a sua próxima visita."
        />

        <div className={styles.finder}>
          <div className={styles.navigation}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Cidades</span>

              <div className={styles.cityList} aria-label="Escolha uma cidade">
                {cities.map((city) => {
                  const isActive = city === selectedCity;

                  return (
                    <button
                      type="button"
                      key={city}
                      onClick={() => selectCity(city)}
                      className={isActive ? styles.cityActive : ""}
                      aria-pressed={isActive}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <div className={styles.unitHeading}>
                <span className={styles.filterLabel}>Unidades</span>
                <span className={styles.unitCount}>
                  {cityStores.length} {cityStores.length === 1 ? "unidade" : "unidades"}
                </span>
              </div>

              <div className={styles.unitList} aria-label={`Unidades em ${selectedCity}`}>
                {cityStores.map((store) => {
                  const isActive = store.id === selectedStore.id;

                  return (
                    <button
                      type="button"
                      key={store.id}
                      onClick={() => setSelectedStoreId(store.id)}
                      className={isActive ? styles.unitActive : ""}
                      aria-pressed={isActive}
                    >
                      <span>{store.name}</span>
                      <small>{store.neighborhood}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.stage} key={selectedStore.id}>
            <div
              className={styles.photo}
              style={{
                backgroundImage: `linear-gradient(180deg, transparent 38%, rgba(0, 0, 0, .78)), url(${selectedStore.image})`,
              }}
              role="img"
              aria-label={`Fachada da unidade ${selectedStore.name}`}
            >
              <div className={styles.photoCaption}>
                <span>{selectedStore.city}</span>
                <h3>{selectedStore.name}</h3>
              </div>
            </div>

            <div className={styles.info}>
              <span className="ds-eyebrow">Unidade selecionada</span>
              <h3>{selectedStore.name}</h3>
              <p className={styles.location}>
                {selectedStore.neighborhood} · {selectedStore.city}
              </p>

              <dl className={styles.details}>
                <div>
                  <dt>Endereço</dt>
                  <dd>{selectedStore.address}</dd>
                </div>
                <div>
                  <dt>Horário</dt>
                  <dd>{selectedStore.hours}</dd>
                </div>
                {selectedStore.phone ? (
                  <div>
                    <dt>Telefone</dt>
                    <dd>{selectedStore.phone}</dd>
                  </div>
                ) : null}
              </dl>

              <Button
                className={styles.action}
                href={selectedStore.maps || selectedStore.mapsUrl || "#"}
                external
              >
                Como chegar
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
