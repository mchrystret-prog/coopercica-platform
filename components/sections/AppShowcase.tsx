"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { appShowcaseItems } from "@/data/appShowcase";
import styles from "./AppShowcase.module.css";

export function AppShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const copyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    let context: { revert: () => void } | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    const init = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (
        cancelled ||
        !sectionRef.current ||
        !stageRef.current ||
        !phoneRef.current
      ) {
        return;
      }

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const stage = stageRef.current;
      const phone = phoneRef.current;
      const images = imageRefs.current.filter(Boolean);
      const copies = copyRefs.current.filter(Boolean);
      const progressItems = progressRefs.current.filter(Boolean);

      context = gsap.context(() => {
        gsap.set(images, {
          autoAlpha: 0,
          yPercent: 8,
          scale: 1.015,
          filter: "blur(7px)",
        });

        gsap.set(copies, {
          autoAlpha: 0,
          y: 28,
          filter: "blur(5px)",
        });

        gsap.set(progressItems, {
          scaleX: 1,
        });

        if (images[0]) {
          gsap.set(images[0], {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            filter: "blur(0px)",
          });
        }

        if (copies[0]) {
          gsap.set(copies[0], {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
          });
        }

        const timeline = gsap.timeline({
          defaults: {
            ease: "power3.inOut",
          },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * appShowcaseItems.length}`,
            pin: stage,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (value: number) => {
                const segments = appShowcaseItems.length;
                const step = 1 / segments;
                return Math.round(value / step) * step;
              },
              duration: { min: 0.25, max: 0.65 },
              delay: 0.08,
              ease: "power2.inOut",
            },
            onUpdate: (self) => {
              const index = Math.min(
                appShowcaseItems.length - 1,
                Math.floor(self.progress * appShowcaseItems.length),
              );

              setActiveIndex((current) => (current === index ? current : index));
            },
          },
        });

        appShowcaseItems.forEach((_, index) => {
          const start = index;
          const image = images[index];
          const copy = copies[index];

          if (index === 0) {
            timeline.to({}, { duration: 0.9 });
            return;
          }

          const previousImage = images[index - 1];
          const previousCopy = copies[index - 1];

          timeline
            .to(
              previousCopy,
              {
                autoAlpha: 0,
                y: -22,
                filter: "blur(5px)",
                duration: 0.28,
              },
              start,
            )
            .to(
              previousImage,
              {
                autoAlpha: 0,
                yPercent: -6,
                scale: 0.992,
                filter: "blur(6px)",
                duration: 0.34,
              },
              start,
            )
            .to(
              phone,
              {
                y: -7,
                scale: 0.994,
                duration: 0.2,
              },
              start,
            )
            .fromTo(
              image,
              {
                autoAlpha: 0,
                yPercent: 9,
                scale: 1.018,
                filter: "blur(8px)",
              },
              {
                autoAlpha: 1,
                yPercent: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.58,
                ease: "power3.out",
              },
              start + 0.22,
            )
            .fromTo(
              copy,
              {
                autoAlpha: 0,
                y: 26,
                filter: "blur(5px)",
              },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power3.out",
              },
              start + 0.28,
            )
            .to(
              phone,
              {
                y: 0,
                scale: 1,
                duration: 0.38,
                ease: "back.out(1.2)",
              },
              start + 0.28,
            )
            .to({}, { duration: 0.82 });
        });
      }, section);

      appShowcaseItems.forEach((item) => {
        const image = new Image();
        image.src = item.image;
      });

      resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      resizeObserver.observe(section);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    init();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      context?.revert();
    };
  }, []);

  return (
    <section
      id="app-showcase"
      ref={sectionRef}
      className={styles.section}
      aria-label="Aplicativo Coopercica"
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.layout}>
          <div className={styles.phoneColumn}>
            <div ref={phoneRef} className={styles.phone}>
              <div className={styles.phoneTop} aria-hidden="true">
                <span />
              </div>

              <div className={styles.screen}>
                {appShowcaseItems.map((item, index) => (
                  <img
                    key={item.id}
                    ref={(element) => {
                      imageRefs.current[index] = element;
                    }}
                    src={item.image}
                    alt={item.imageAlt}
                    className={styles.screenImage}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
              </div>
            </div>

            <div
              className={styles.phoneProgress}
              aria-label={`Tela ${activeIndex + 1} de ${appShowcaseItems.length}`}
            >
              {appShowcaseItems.map((item, index) => (
                <span
                  key={item.id}
                  ref={(element) => {
                    progressRefs.current[index] = element;
                  }}
                  className={`${styles.phoneProgressDot} ${
                    index === activeIndex ? styles.phoneProgressDotActive : ""
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className={styles.copyStage}>
            {appShowcaseItems.map((item, index) => (
              <div
                key={item.id}
                ref={(element) => {
                  copyRefs.current[index] = element;
                }}
                className={styles.copy}
                aria-hidden={index !== activeIndex}
              >
                <span className={styles.stepNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className={styles.stepEyebrow}>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <div>
          <span className={styles.kicker}>
            DISPONÍVEL PARA iOS E ANDROID
          </span>

          <h3>BAIXE E APROVEITE.</h3>
        </div>

        <div className={styles.buttons}>
          <a
            href="https://apps.apple.com/br/app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Baixar na App Store"
          >
            <img
              src="/badges/app-store.svg"
              alt="Download on the App Store"
            />
          </a>

          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Baixar no Google Play"
          >
            <img
              src="/badges/google-play.svg"
              alt="Disponível no Google Play"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
