"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { appShowcaseItems } from "@/data/appShowcase";
import styles from "./AppShowcase.module.css";

export function AppShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndexRef = useRef(0);
  const transitionRef = useRef<{ kill: () => void } | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useLayoutEffect(() => {
    let context: { revert: () => void } | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;
    let removeLoadListener = () => {};

    const init = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      if (cancelled || !sectionRef.current) return;

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const phone = phoneRef.current;

      const transitionTo = (nextIndex: number) => {
        const currentIndex = activeIndexRef.current;

        if (
          nextIndex === currentIndex ||
          nextIndex < 0 ||
          nextIndex >= appShowcaseItems.length
        ) {
          return;
        }

        const direction = nextIndex > currentIndex ? 1 : -1;
        const outgoingImage = imageRefs.current[currentIndex];
        const incomingImage = imageRefs.current[nextIndex];
        const incomingStep = stepRefs.current[nextIndex];

        transitionRef.current?.kill();
        setTransitioning(true);

        const timeline = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => {
            activeIndexRef.current = nextIndex;
            setTransitioning(false);

            if (phone) gsap.set(phone, { clearProps: "transform" });
            if (outgoingImage) gsap.set(outgoingImage, { clearProps: "all" });
            if (incomingImage) gsap.set(incomingImage, { clearProps: "all" });
          },
        });

        transitionRef.current = timeline;

        if (phone) {
          timeline.to(
            phone,
            { y: direction * -7, scale: 0.992, duration: 0.22 },
            0,
          );
        }

        if (outgoingImage) {
          timeline.to(
            outgoingImage,
            {
              yPercent: direction * -7,
              scale: 0.992,
              opacity: 0,
              filter: "blur(6px)",
              duration: 0.28,
            },
            0,
          );
        }

        timeline.call(
          () => {
            activeIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);

            if (incomingImage) {
              gsap.set(incomingImage, {
                yPercent: direction * 8,
                scale: 1.012,
                opacity: 0,
                filter: "blur(7px)",
              });
            }

            if (incomingStep) {
              const textElements = incomingStep.querySelectorAll(
                "[data-app-copy]",
              );

              gsap.fromTo(
                textElements,
                {
                  y: direction * 18,
                  opacity: 0,
                  filter: "blur(4px)",
                },
                {
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                  duration: 0.48,
                  stagger: 0.055,
                  ease: "power3.out",
                  overwrite: true,
                },
              );
            }
          },
          [],
          0.2,
        );

        if (incomingImage) {
          timeline.to(
            incomingImage,
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.46,
              ease: "power3.out",
            },
            0.2,
          );
        }

        if (phone) {
          timeline.to(
            phone,
            {
              y: 0,
              scale: 1,
              duration: 0.38,
              ease: "back.out(1.35)",
            },
            0.22,
          );
        }
      };

      context = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-app-step]");

        cards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 58%",
            end: "bottom 42%",
            invalidateOnRefresh: true,
            onEnter: () => transitionTo(index),
            onEnterBack: () => transitionTo(index),
          });
        });
      }, section);

      appShowcaseItems.forEach((item) => {
        const image = new Image();
        image.src = item.image;
      });

      resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(section);

      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("load", refresh, { once: true });
      removeLoadListener = () => window.removeEventListener("load", refresh);
    };

    init();

    return () => {
      cancelled = true;
      transitionRef.current?.kill();
      resizeObserver?.disconnect();
      removeLoadListener();
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
      <div className={styles.layout}>
        <div className={styles.phoneColumn}>
          <div className={styles.stickyPhone}>
            <div
              ref={phoneRef}
              className={`${styles.phone} ${
                transitioning ? styles.phoneTransitioning : ""
              }`}
            >
              <div className={styles.phoneTop} aria-hidden="true">
                <span />
              </div>

              <div className={styles.screen}>
                <div
                  className={`${styles.screenGlow} ${
                    transitioning ? styles.screenGlowActive : ""
                  }`}
                  aria-hidden="true"
                />

                {appShowcaseItems.map((item, index) => (
                  <img
                    key={item.id}
                    ref={(element) => {
                      imageRefs.current[index] = element;
                    }}
                    src={item.image}
                    alt={item.imageAlt}
                    className={`${styles.screenImage} ${
                      index === activeIndex ? styles.active : ""
                    }`}
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
                  className={`${styles.phoneProgressDot} ${
                    index === activeIndex ? styles.phoneProgressDotActive : ""
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.steps}>
          {appShowcaseItems.map((item, index) => (
            <article
              key={item.id}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
              data-app-step
              className={`${styles.step} ${
                index === activeIndex ? styles.stepActive : ""
              }`}
            >
              <span className={styles.stepNumber} data-app-copy>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className={styles.stepEyebrow} data-app-copy>
                {item.eyebrow}
              </span>

              <h3 data-app-copy>{item.title}</h3>
              <p data-app-copy>{item.description}</p>
            </article>
          ))}
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
