"use client";

import { useEffect, useMemo, useState } from "react";
import type { Magazine as MagazineType } from "@/types/content";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Magazine.module.css";

type MagazineWithOptionalCover = MagazineType & {
  cover?: string;
  image?: string;
  thumbnail?: string;
};

type MagazineProps = {
  items: MagazineType[];
};

function getCover(item: MagazineWithOptionalCover): string | null {
  return item.cover ?? item.image ?? item.thumbnail ?? null;
}

export function Magazine({ items }: MagazineProps) {
  const magazines = useMemo(
    () => items.filter((item) => Boolean(item?.id && item?.href)),
    [items]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    magazines[0]?.id ?? null
  );

  useEffect(() => {
    if (!magazines.length) {
      setSelectedId(null);
      return;
    }

    const selectedStillExists = magazines.some(
      (item) => item.id === selectedId
    );

    if (!selectedStillExists) {
      setSelectedId(magazines[0].id);
    }
  }, [magazines, selectedId]);

  const selectedMagazine =
    magazines.find((item) => item.id === selectedId) ?? magazines[0];

  if (!selectedMagazine) {
    return null;
  }

  const selectedCover = getCover(
    selectedMagazine as MagazineWithOptionalCover
  );

  return (
    <Section
      id="revista"
      className={styles.section}
      tabIndex={-1}
      aria-labelledby="magazine-title"
    >
      <Container>
        <SectionHeader
          className={styles.header}
          eyebrow="REVISTA COOPERCICA"
          title={["TODO MÊS, UMA", "NOVA EDIÇÃO PRA VOCÊ."]}
          stacked
        />

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.content}>
          <article className={styles.featured}>
            <div className={styles.coverStage}>
              <a
                className={styles.coverLink}
                href={selectedMagazine.href}
                aria-label={`Ler ${selectedMagazine.edition}: ${selectedMagazine.title}`}
              >
                <div className={styles.cover} key={selectedMagazine.id}>
                  {selectedCover ? (
                    <img
                      className={styles.coverImage}
                      src={selectedCover}
                      alt={`Capa da ${selectedMagazine.edition}`}
                    />
                  ) : (
                    <div className={styles.coverFallback}>
                      <span>REVISTA COOPERCICA</span>
                      <strong>{selectedMagazine.edition}</strong>
                      <small>{selectedMagazine.title}</small>
                    </div>
                  )}
                </div>
              </a>

              <span className={styles.coverShadow} aria-hidden="true" />
            </div>

            <a
              className={styles.readCta}
              href={selectedMagazine.href}
              aria-label={`Ler ${selectedMagazine.edition}: ${selectedMagazine.title}`}
            >
              <span>Ler edição</span>
              <span aria-hidden="true">→</span>
            </a>
          </article>

          <aside className={styles.gallery} aria-label="Galeria de edições">
            <div className={styles.galleryHeader}>
              <span>ACERVO RECENTE</span>
              <h3>EDIÇÕES</h3>
            </div>

            <div className={styles.galleryGrid} role="list">
              {magazines.map((item) => {
                const isActive = item.id === selectedMagazine.id;
                const cover = getCover(item as MagazineWithOptionalCover);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.galleryItem}
                    data-active={isActive ? "true" : "false"}
                    aria-pressed={isActive}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className={styles.thumbnail}>
                      {cover ? (
                        <img src={cover} alt="" aria-hidden="true" />
                      ) : (
                        <span className={styles.thumbnailFallback}>
                          {item.edition}
                        </span>
                      )}
                    </span>

                    <span className={styles.galleryMeta}>
                      <strong>{item.edition}</strong>
                      <small>{item.title}</small>
                    </span>

                    <span className={styles.galleryArrow} aria-hidden="true">
                      →
                    </span>
                  </button>
                );
              })}
            </div>

            <a className={styles.archiveCta} href="/revista">
              <span>Ver todas as edições</span>
              <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </Container>
    </Section>
  );
}