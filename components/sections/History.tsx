"use client";

import { useEffect, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { historyItems } from "@/data/history";
import styles from "./History.module.css";
import { TimelineCard } from "./TimelineCard";
import { useHorizontalHistory } from "./useHorizontalHistory";

export function History({ images = {} }: { images?: Record<string, string> }) {
  const items = historyItems.map((item) => ({
    ...item,
    image: images[item.id] || item.image,
  }));
  const {
    trackRef,
    activeIndex,
    goToIndex,
    isAutoPlaying,
    isManuallyPaused,
    prefersReducedMotion,
    toggleAutoPlay,
    autoplayHandlers,
    trackHandlers,
  } = useHorizontalHistory(items.length);
  const journeyRef = useRef<HTMLElement>(null);
  const progress = activeIndex / Math.max(1, items.length - 1);

  useEffect(() => {
    const journey = journeyRef.current;
    const marker = journey?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!journey || !marker) return;
    const box = marker.getBoundingClientRect();
    const viewport = journey.getBoundingClientRect();
    if (box.left < viewport.left + 24 || box.right > viewport.right - 24) {
      journey.scrollTo({
        left:
          journey.scrollLeft +
          box.left -
          viewport.left -
          journey.clientWidth / 2 +
          box.width / 2,
        behavior: "instant",
      });
    }
  }, [activeIndex]);

  return (
    <section
      id="historia"
      className={styles.history}
      aria-labelledby="history-title"
      tabIndex={-1}
      {...autoplayHandlers}
    >
      <div className={styles.topbar}>
        <SectionHeader
          id="history-title"
          title="NOSSA HISTÓRIA"
          description="Mais de cinco décadas construídas com pessoas, confiança e cooperação."
          stacked
          className={styles.historyHeader}
        />
      </div>

      <div
        className={styles.viewport}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Capítulos da Nossa História"
      >
        <div
          id="history-track"
          ref={trackRef}
          className={styles.track}
          tabIndex={0}
          aria-label="Capítulos: use as setas esquerda e direita para navegar"
          {...trackHandlers}
          onDragStart={(event) => event.preventDefault()}
        >
          {items.map((item, index) => (
            <TimelineCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              active={index === activeIndex}
            />
          ))}
        </div>
        <button
          type="button"
          className={`${styles.slideArrow} ${styles.previous}`}
          onClick={() => goToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Capítulo anterior"
          aria-controls="history-track"
        >
          <Icon name="chevron-left" />
        </button>
        <button
          type="button"
          className={`${styles.slideArrow} ${styles.next}`}
          onClick={() => goToIndex(activeIndex + 1)}
          disabled={activeIndex === items.length - 1}
          aria-label="Próximo capítulo"
          aria-controls="history-track"
        >
          <Icon name="chevron-right" />
        </button>
      </div>

      <div className={styles.navigationCaption}>
        <div className={styles.captionActions}>
          <span>Arraste para explorar ou escolha um ano</span>
          <button
            type="button"
            className={styles.autoToggle}
            data-history-autoplay-control
            onClick={toggleAutoPlay}
            disabled={prefersReducedMotion}
            aria-label={
              prefersReducedMotion
                ? "Reprodução automática desativada pela preferência de movimento reduzido"
                : isManuallyPaused
                  ? "Retomar reprodução automática"
                  : "Pausar reprodução automática"
            }
          >
            <Icon
              name={isManuallyPaused || prefersReducedMotion ? "play" : "pause"}
            />
            Automático
          </button>
        </div>
        <span
          className={styles.status}
          role="status"
          aria-live={isAutoPlaying ? "off" : "polite"}
          aria-atomic="true"
        >
          {String(activeIndex + 1).padStart(2, "0")} / {items.length} ·{" "}
          {items[activeIndex].year}
        </span>
      </div>
      <nav
        ref={journeyRef}
        className={styles.journey}
        aria-label="Navegação pela história"
      >
        <div className={styles.road}>
          <div
            className={styles.roadProgress}
            style={{ transform: `scaleX(${progress})` }}
          />
          <div
            className={styles.traveler}
            style={{ left: `${progress * 100}%` }}
            aria-hidden="true"
          >
            <span className={styles.journeyMarker} />
          </div>
          <div className={styles.milestones}>
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.milestone} ${index <= activeIndex ? styles.milestoneReached : ""} ${index === activeIndex ? styles.milestoneActive : ""}`}
                style={{ left: `${(index / (items.length - 1)) * 100}%` }}
                onClick={() => goToIndex(index)}
                aria-label={`Ir para ${item.year}: ${item.title}`}
                aria-controls={`history-${item.id}`}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span className={styles.tooltip} aria-hidden="true">
                  <strong>{item.year}</strong>
                  <small>{item.title}</small>
                </span>
                <span className={styles.milestoneDot} />
                <span className={styles.milestoneYear}>{item.year}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div
        id="historia-fim"
        className={styles.historyEnd}
        tabIndex={-1}
        aria-label="Fim da seção Nossa História"
      />
    </section>
  );
}
