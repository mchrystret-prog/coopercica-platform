"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { historyItems } from "@/data/history";
import styles from "./History.module.css";

export function History() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const travelerRef = useRef<HTMLDivElement | null>(null);
  const scrollTriggerRef = useRef<any>(null);
  const gsapRef = useRef<any>(null);
  const navigationTweenRef = useRef<any>(null);
  const pulseTimerRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | undefined;

    const setup = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef.current = gsap;

      const section = sectionRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const traveler = travelerRef.current;

      if (!section || !track || !progress || !traveler) return;

      ctx = gsap.context(() => {
        const slides = Array.from(
          track.querySelectorAll<HTMLElement>("[data-history-slide]"),
        );

        const getDistance = () =>
          Math.max(0, track.scrollWidth - window.innerWidth);

        const horizontalTween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          paused: true,
        });

        const trigger = ScrollTrigger.create({
          id: "history-horizontal",
          trigger: section,
          animation: horizontalTween,
          start: "top top",
          end: () => `+=${getDistance()}`,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const rawProgress = self.progress;
            const segmentCount = Math.max(1, historyItems.length - 1);
            const exactIndex = rawProgress * segmentCount;
            const nearestIndex = Math.min(
              historyItems.length - 1,
              Math.max(0, Math.round(exactIndex)),
            );
            const nearestProgress = nearestIndex / segmentCount;
            const distanceToMarker = Math.abs(rawProgress - nearestProgress);
            const magneticThreshold = 0.018;
            const isMagnetic = distanceToMarker <= magneticThreshold;
            const travelerProgress = isMagnetic ? nearestProgress : rawProgress;

            gsap.set(progress, { scaleX: rawProgress });
            gsap.set(traveler, {
              left: `${travelerProgress * 100}%`,
              scale: isMagnetic ? 1.09 : 1,
              rotate: isMagnetic ? 0 : self.direction > 0 ? 1.4 : -1.4,
            });
            // Foco cinematográfico mais sutil: o slide chega levemente desfocado,
            // permanece totalmente nítido no centro e só perde foco perto da saída.
            slides.forEach((slide, index) => {
              const image = slide.querySelector<HTMLElement>("[data-history-image]");
              const content = slide.querySelector<HTMLElement>(
                "[data-history-content]",
              );

              const distance = Math.min(1, Math.abs(exactIndex - index));
              const normalized = Math.max(0, (distance - 0.14) / 0.86);
              const blur = normalized * 6;
              const imageOpacity = 1 - normalized * 0.12;
              const imageScale = 1 + normalized * 0.028;
              const saturation = 1 - normalized * 0.08;
              const contrast = 1 - normalized * 0.035;

              if (image) {
                gsap.set(image, {
                  filter: `blur(${blur}px) saturate(${saturation}) contrast(${contrast})`,
                  opacity: imageOpacity,
                  scale: imageScale,
                });
              }

              if (content) {
                gsap.set(content, {
                  filter: `blur(${normalized * 3}px)`,
                  opacity: 1 - normalized * 0.34,
                  y: normalized * 18,
                });
              }
            });

            setActiveIndex((previous) => {
              if (previous === nearestIndex) return previous;

              setPulseIndex(nearestIndex);
              if (pulseTimerRef.current) {
                window.clearTimeout(pulseTimerRef.current);
              }
              pulseTimerRef.current = window.setTimeout(() => {
                setPulseIndex(null);
              }, 520);

              return nearestIndex;
            });
          },
        });

        scrollTriggerRef.current = trigger;

        requestAnimationFrame(() => {
          trigger.refresh();
          trigger.update();
        });
      }, section);
    };

    setup();

    return () => {
      if (pulseTimerRef.current) {
        window.clearTimeout(pulseTimerRef.current);
      }
      navigationTweenRef.current?.kill?.();
      scrollTriggerRef.current = null;
      ctx?.revert();
    };
  }, []);

  const goToIndex = (index: number) => {
    const trigger = scrollTriggerRef.current;
    const gsap = gsapRef.current;

    if (!trigger || !gsap) return;

    const clampedIndex = Math.min(
      historyItems.length - 1,
      Math.max(0, index),
    );
    const targetProgress =
      clampedIndex / Math.max(1, historyItems.length - 1);
    const targetScroll =
      trigger.start + (trigger.end - trigger.start) * targetProgress;

    navigationTweenRef.current?.kill?.();

    const scrollState = { value: window.scrollY };
    navigationTweenRef.current = gsap.to(scrollState, {
      value: targetScroll,
      duration: 1.15,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        window.scrollTo(0, scrollState.value);
      },
      onComplete: () => {
        window.scrollTo(0, targetScroll);
        trigger.update();
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      className={styles.history}
      aria-labelledby="history-title"
    >
      <div className={styles.topbar}>
        <div>
          <span className={styles.kicker}>NOSSA CAMINHADA</span>
          <h2 id="history-title" className={styles.heading}>
            NOSSA HISTÓRIA
          </h2>
          <p className={styles.headingSupport}>
            Mais de cinco décadas construídas com pessoas, confiança e cooperação.
          </p>
        </div>
      </div>

      <div ref={trackRef} className={styles.track}>
        {historyItems.map((item, index) => (
          <article
            key={item.id}
            data-history-slide
            className={`${styles.slide} ${styles[item.theme]}`}
          >
            <div className={styles.yearWatermark} aria-hidden="true">
              {item.year}
            </div>

            <div className={styles.media}>
              <img
                data-history-image
                src={item.image}
                alt={item.imageAlt}
                className={styles.image}
                loading={index < 2 ? "eager" : "lazy"}
              />
            </div>

            <div data-history-content className={styles.content}>
              <span className={styles.eyebrow}>{item.eyebrow}</span>
              <strong className={styles.year}>{item.year}</strong>
              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <span className={styles.counter}>
                Capítulo {String(index + 1).padStart(2, "0")} de{" "}
                {String(historyItems.length).padStart(2, "0")}
              </span>
            </div>
          </article>
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
<button
  className={styles.nextSection}
  aria-label="Ir para a próxima seção"
  onClick={() => {
    document
      .getElementById("app-showcase")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }}
>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 5v14M5 12l7 7 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</button>
    </section>
  );
}
