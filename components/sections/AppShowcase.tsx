"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { appShowcaseItems } from "@/data/appShowcase";
import styles from "./AppShowcase.module.css";

export function AppShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const copyRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (
        cancelled ||
        !sectionRef.current ||
        !stageRef.current ||
        !phoneRef.current
      ) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const stage = stageRef.current;
      const phone = phoneRef.current;
      const images = imageRefs.current.filter(
        (image): image is HTMLImageElement => image !== null,
      );
      const copies = copyRefs.current.filter(
        (copy): copy is HTMLElement => copy !== null,
      );
      const media = gsap.matchMedia();

      media.add("(min-width: 901px)", () => {
        gsap.set(images, {
          autoAlpha: 0,
          yPercent: 7,
          scale: 1.018,
          filter: "blur(7px)",
        });

        gsap.set(copies, {
          autoAlpha: 0,
          y: 24,
          filter: "blur(5px)",
          pointerEvents: "none",
        });

        gsap.set(images[0], {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
          filter: "blur(0px)",
        });

        gsap.set(copies[0], {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          pointerEvents: "auto",
        });

        const timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          scrollTrigger: {
            id: "app-showcase-scroll",
            trigger: section,
            start: "top 82px",
            end: () =>
              `+=${window.innerHeight * Math.max(2, appShowcaseItems.length - 1)}`,
            pin: stage,
            pinSpacing: true,
            scrub: 0.42,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            onUpdate: (self) => {
              const nextIndex = Math.min(
                appShowcaseItems.length - 1,
                Math.round(self.progress * (appShowcaseItems.length - 1)),
              );

              setActiveIndex((current) =>
                current === nextIndex ? current : nextIndex,
              );
            },
          },
        });

        timeline.to({}, { duration: 0.25 });

        for (let index = 1; index < appShowcaseItems.length; index += 1) {
          const previousImage = images[index - 1];
          const currentImage = images[index];
          const previousCopy = copies[index - 1];
          const currentCopy = copies[index];

          timeline
            .to(
              previousCopy,
              {
                autoAlpha: 0,
                y: -20,
                filter: "blur(5px)",
                pointerEvents: "none",
                duration: 0.3,
              },
              ">",
            )
            .to(
              previousImage,
              {
                autoAlpha: 0,
                yPercent: -5,
                scale: 0.992,
                filter: "blur(6px)",
                duration: 0.34,
              },
              "<",
            )
            .to(
              phone,
              {
                y: -6,
                scale: 0.995,
                duration: 0.18,
              },
              "<",
            )
            .fromTo(
              currentImage,
              {
                autoAlpha: 0,
                yPercent: 7,
                scale: 1.018,
                filter: "blur(7px)",
              },
              {
                autoAlpha: 1,
                yPercent: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.48,
                ease: "power3.out",
              },
              ">-0.1",
            )
            .fromTo(
              currentCopy,
              {
                autoAlpha: 0,
                y: 22,
                filter: "blur(5px)",
              },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                pointerEvents: "auto",
                duration: 0.42,
                ease: "power3.out",
              },
              "<+0.05",
            )
            .to(
              phone,
              {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.15)",
              },
              "<",
            )
            .to({}, { duration: 0.2 });
        }

        return () => {
        };
      });

      media.add("(max-width: 900px)", () => {
        gsap.set([...images, ...copies, phone], { clearProps: "all" });
        setActiveIndex(0);
      });

      cleanup = () => media.revert();
    };

    init();

    return () => {
      cancelled = true;
      cleanup?.();
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
                    loading={index === 0 ? "eager" : "lazy"}
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
                  className={`${styles.phoneProgressDot} ${
                    index === activeIndex ? styles.phoneProgressDotActive : ""
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.copyViewport}>
              {appShowcaseItems.map((item, index) => (
                <article
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
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>

            <div className={styles.storeBadges}>
              <span className={styles.storeBadgesLabel}>
                DISPONÍVEL PARA iOS E ANDROID
              </span>

              <div className={styles.storeBadgesLinks}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
