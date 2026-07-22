"use client";

import type { Store } from "@/data/stores";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Stores.module.css";

type StoresProps = {
  items: Store[];
};

type ViewMode = "cities" | "stores";

type CityGroup = {
  name: string;
  stores: Store[];
  image: string;
};

type IconProps = {
  className?: string;
};

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PinIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.4 3.5 10 7.8 7.8 10a15 15 0 0 0 6.2 6.2l2.2-2.2 4.3 2.6-.8 3.4a2 2 0 0 1-2 1.5C9.3 21.5 2.5 14.7 2.5 6.3a2 2 0 0 1 1.5-2Z" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function CityCard({
  city,
  onSelect,
}: {
  city: CityGroup;
  onSelect: (cityName: string) => void;
}) {
  const unitLabel =
    city.stores.length === 1 ? "1 unidade" : `${city.stores.length} unidades`;

  return (
    <button
      type="button"
      className={styles.cityCard}
      onClick={() => onSelect(city.name)}
      aria-label={`Ver ${unitLabel} em ${city.name}`}
    >
      <span className={styles.cityVisual}>
        <span
          className={styles.cityImage}
          style={{ backgroundImage: `url(${city.image})` }}
          aria-hidden="true"
        />
      </span>

      <span className={styles.cityInfo}>
        <span>
          <strong>{city.name}</strong>
          <small>{unitLabel}</small>
        </span>

        <span className={styles.cityAction} aria-hidden="true">
          <ArrowRightIcon />
        </span>
      </span>
    </button>
  );
}

function StoreCard({
  store,
  onSelect,
}: {
  store: Store;
  onSelect: (store: Store) => void;
}) {
  return (
    <article className={styles.storeCard}>
      <button
        type="button"
        className={styles.storeTrigger}
        onClick={() => onSelect(store)}
        aria-label={`Ver informações da unidade ${store.name}`}
      >
        <span
          className={styles.storeImage}
          style={{ backgroundImage: `url(${store.image})` }}
          aria-hidden="true"
        />
        <span className={styles.storeImageOverlay} aria-hidden="true" />

        <span className={styles.storeSummary}>
          <span className={styles.storeNumber}>
            Unidade {String(store.storeNumber).padStart(2, "0")}
          </span>

          <span className={styles.storeSummaryBottom}>
            <span>
              <strong>{store.name}</strong>
              <small>{store.neighborhood}</small>
            </span>

            <span className={styles.storeAction} aria-hidden="true">
              <ArrowRightIcon />
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}

function StoreModal({
  store,
  onClose,
}: {
  store: Store | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!store) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [store, onClose]);

  if (!store) return null;

  const mapsHref = store.maps || store.mapsUrl || "#";
  const titleId = `store-modal-title-${store.id}`;
  const descriptionId = `store-modal-description-${store.id}`;

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Fechar informações da unidade"
        >
          <CloseIcon />
        </button>

        <div
          className={styles.modalImage}
          style={{ backgroundImage: `url(${store.image})` }}
          aria-hidden="true"
        >
          <span className={styles.modalImageOverlay} />
          <span className={styles.modalStoreNumber}>
            Unidade {String(store.storeNumber).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.modalHeading}>
            <span>Informações da unidade</span>
            <h3 id={titleId}>{store.name}</h3>
            <p id={descriptionId}>
              {store.neighborhood} · {store.city}
            </p>
          </div>

          <dl className={styles.modalDetails}>
            <div className={styles.modalDetailItem}>
              <dt>
                <PinIcon className={styles.detailIcon} />
                Endereço
              </dt>
              <dd>{store.address}</dd>
            </div>

            <div className={styles.modalDetailItem}>
              <dt>
                <ClockIcon className={styles.detailIcon} />
                Horário
              </dt>
              <dd>{store.hours}</dd>
            </div>

            {store.phone ? (
              <div className={styles.modalDetailItem}>
                <dt>
                  <PhoneIcon className={styles.detailIcon} />
                  Telefone
                </dt>
                <dd>{store.phone}</dd>
              </div>
            ) : null}
          </dl>

          {store.services.length > 0 ? (
            <div className={styles.services}>
              <span>Serviços disponíveis</span>
              <ul>
                {store.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            className={styles.mapsButton}
            href={mapsHref}
            external={mapsHref !== "#"}
          >
            <PinIcon className={styles.buttonIcon} />
            Como chegar
          </Button>
        </div>
      </div>
    </div>
  );
}

const cityImages: Record<string, string> = {
  "Jundiaí": "/images/cities/jundiaí.jpg",
  "Campo Limpo Paulista": "/images/cities/campolimpo.jpg",
  "Várzea Paulista": "/images/cities/varzea.jpg",
  "Itupeva": "/images/cities/itupeva.jpg",
};

export function Stores({ items }: StoresProps) {
  const activeItems = useMemo(
    () => items.filter((item) => item.active !== false),
    [items],
  );

  const cityGroups = useMemo<CityGroup[]>(() => {
    const grouped = new Map<string, Store[]>();

    activeItems.forEach((store) => {
      const cityStores = grouped.get(store.city) ?? [];
      cityStores.push(store);
      grouped.set(store.city, cityStores);
    });

    return Array.from(grouped.entries()).map(([name, stores]) => ({
      name,
      stores,
      image:
        cityImages[name] ??
        stores.find((store) => store.featured)?.image ??
        stores[0]?.image ??
        "",
    }));
  }, [activeItems]);

  const [view, setView] = useState<ViewMode>("cities");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const selectedCityGroup = useMemo(
    () => cityGroups.find((city) => city.name === selectedCity) ?? null,
    [cityGroups, selectedCity],
  );

  if (cityGroups.length === 0) return null;

  function selectCity(cityName: string) {
    setSelectedCity(cityName);
    setSelectedStore(null);
    setView("stores");
  }

  function returnToCities() {
    setView("cities");
    setSelectedCity(null);
    setSelectedStore(null);
  }

  return (
    <>
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
            description={
              view === "cities"
                ? "Escolha uma cidade e conheça as unidades Coopercica mais próximas de você."
                : `Selecione uma unidade em ${selectedCityGroup?.name ?? ""} para ver todas as informações.`
            }
          />

          {view === "cities" ? (
            <div className={styles.citiesView}>
              <div className={styles.viewHeading}>
                <span className={styles.viewLabel}>Escolha uma cidade</span>
                <span className={styles.viewCount}>{cityGroups.length} cidades</span>
              </div>

              <div className={styles.cityGrid}>
                {cityGroups.map((city) => (
                  <CityCard key={city.name} city={city} onSelect={selectCity} />
                ))}
              </div>
            </div>
          ) : selectedCityGroup ? (
            <div className={styles.storesView}>
              <div className={styles.storesHeader}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={returnToCities}
                >
                  <span aria-hidden="true">←</span>
                  Todas as cidades
                </button>

                <div className={styles.selectedCityHeading}>
                  <span className={styles.viewLabel}>Cidade selecionada</span>
                  <h3>{selectedCityGroup.name}</h3>
                  <p>
                    {selectedCityGroup.stores.length}{" "}
                    {selectedCityGroup.stores.length === 1
                      ? "unidade"
                      : "unidades"}
                  </p>
                </div>
              </div>

              <div
                className={styles.storeGrid}
                aria-label={`Unidades em ${selectedCityGroup.name}`}
              >
                {selectedCityGroup.stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onSelect={setSelectedStore}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </Section>

      <StoreModal store={selectedStore} onClose={() => setSelectedStore(null)} />
    </>
  );
}