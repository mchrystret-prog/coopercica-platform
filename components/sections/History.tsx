"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { historyItems } from "@/data/history";
import styles from "./History.module.css";
import { TimelineCard } from "./TimelineCard";
import { useHorizontalHistory } from "./useHorizontalHistory";

export function History() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const travelerRef = useRef<HTMLDivElement | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);
  const [skipVisible, setSkipVisible] = useState(false);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
    setPulseIndex(index);

    if (pulseTimerRef.current) {
      window.clearTimeout(pulseTimerRef.current);
    }

    pulseTimerRef.current = window.setTimeout(() => {
      setPulseIndex(null);
    }, 520);
  }, []);

  const { goToIndex } = useHorizontalHistory({
    viewportRef,
    trackRef,
    progressRef,
    travelerRef,
    itemCount: historyItems.length,
    onActiveIndexChange: handleActiveIndexChange,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const headerOffset = 82;
      const inside = rect.top <= headerOffset && rect.bottom > window.innerHeight * .35;
      setSkipVisible(inside);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const skipHistory = () => {
    const section = sectionRef.current;
    if (!section) return;
    const isDesktop = window.matchMedia("(min-width: 901px)").matches;
    if (isDesktop) {
      const trigger = (window as typeof window & { ScrollTrigger?: { getById?: (id: string) => { end?: number } | undefined } }).ScrollTrigger?.getById?.("history-horizontal-v2");
      if (trigger?.end) {
        window.scrollTo({ top: trigger.end + 2, behavior: "smooth" });
        return;
      }
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (viewport && track) {
        const distance = Math.max(1, track.scrollWidth - viewport.clientWidth);
        window.scrollTo({ top: section.offsetTop + distance + 84, behavior: "smooth" });
        return;
      }
    }
    document.getElementById("historia-fim")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="historia"
      ref={sectionRef}
      className={styles.history}
      aria-labelledby="history-title"
      tabIndex={-1}
    >
      <div ref={viewportRef} className={styles.viewport}>
        <div className={styles.topbar}>
          <div>
            <h2 id="history-title" className={styles.heading}>
              NOSSA HISTÓRIA
            </h2>
            <p className={styles.headingSupport}>
              Mais de cinco décadas construídas com pessoas, confiança e
              cooperação.
            </p>
          </div>
          <button type="button" className={`${styles.skipButton} ${skipVisible ? styles.skipButtonVisible : ""}`} onClick={skipHistory} aria-label="Pular a seção Nossa História">Pular história <span aria-hidden="true">↓</span></button>
        </div>

        <div ref={trackRef} className={styles.track}>
          {historyItems.map((item, index) => (
            <TimelineCard
              key={item.id}
              item={item}
              index={index}
              total={historyItems.length}
            />
          ))}
        </div>

        <nav className={styles.journey} aria-label="Navegação pela história">
          <div className={styles.road}>
            <div ref={progressRef} className={styles.roadProgress} />

            <div
              ref={travelerRef}
              className={`${styles.traveler} ${
                pulseIndex !== null ? styles.travelerSnapped : ""
              }`}
              aria-hidden="true"
            >
              <img
                src="/history/coopercica-c.png"
                alt=""
                className={styles.travelerImage}
              />
            </div>

            <div className={styles.milestones}>
              {historyItems.map((item, index) => {
                const active = index === activeIndex;
                const reached = index <= activeIndex;
                const pulsing = index === pulseIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.milestone} ${
                      reached ? styles.milestoneReached : ""
                    } ${active ? styles.milestoneActive : ""} ${
                      pulsing ? styles.milestonePulse : ""
                    }`}
                    style={{
                      left: `${(index / (historyItems.length - 1)) * 100}%`,
                    }}
                    onClick={() => goToIndex(index)}
                    aria-label={`Ir para ${item.year}: ${item.title}`}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className={styles.tooltip}>
                      <strong>{item.year}</strong>
                      <small>{item.title}</small>
                    </span>
                    <span className={styles.milestoneDot} />
                    <span className={styles.milestoneYear}>{item.year}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
      <span id="historia-fim" className={styles.historyEnd} aria-hidden="true" />
    </section>
  );
}
