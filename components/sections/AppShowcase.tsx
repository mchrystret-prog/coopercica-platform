"use client";

import { useEffect, useRef, useState } from "react";
import { appShowcaseItems } from "@/data/appShowcase";
import styles from "./AppShowcase.module.css";

export function AppShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cleanup = () => {};

    const init = async () => {
      const gsapModule = await import("gsap");
      const scrollTriggerModule = await import("gsap/ScrollTrigger");

      const gsap = gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      const cards = Array.from(
        sectionRef.current.querySelectorAll<HTMLElement>(
          "[data-app-step]"
        )
      );

      const triggers = cards.map((card, index) =>
        ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: "bottom center",

          onEnter: () => {
            setActiveIndex(index);
          },

          onEnterBack: () => {
            setActiveIndex(index);
          },
        })
      );

      cleanup = () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    };

    init();

    return () => cleanup();
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
            <div className={styles.phone}>
              <div className={styles.phoneTop}>
                <span />
              </div>

              <div className={styles.screen}>
                {appShowcaseItems.map((item, index) => (
                  <img
                    key={item.id}
                    src={item.image}
                    alt={item.imageAlt}
                    className={`${styles.screenImage} ${
                      index === activeIndex ? styles.active : ""
                    }`}
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                ))}
              </div>
            </div>

            <div className={styles.phoneProgress} aria-label="Progresso das telas do aplicativo">
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
              data-app-step
              className={`${styles.step} ${
                index === activeIndex ? styles.stepActive : ""
              }`}
            >
              <span className={styles.stepNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className={styles.stepEyebrow}>{item.eyebrow}</span>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.cta}>
        <div>
          <span className={styles.kicker}>BAIXE O APLICATIVO</span>
          <h3>A COOPERCICA SEMPRE COM VOCÊ.</h3>
        </div>

        <div className={styles.buttons}>
          <a
            href="#"
            className={styles.primaryButton}
            aria-label="Baixar o aplicativo Coopercica"
          >
            Baixar aplicativo
          </a>

          <a
            href="https://www.coopercicadelivery.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryButton}
          >
            Comprar online
          </a>
        </div>
      </div>
    </section>
  );
}