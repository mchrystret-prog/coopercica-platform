"use client";

import { Icon } from "@/components/ui/Icon";
import styles from "./Hero.module.css";
import type { Campaign } from "@/data/campaigns";
import { useEffect, useState } from "react";

interface HeroProps {
  items: Campaign[];
}

export function Hero({ items }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % items.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  if (!items.length) {
    return null;
  }

  const safeCurrent = current % items.length;

  const goToPrevious = () => {
    setCurrent((previous) =>
      (previous % items.length) === 0 ? items.length - 1 : (previous % items.length) - 1,
    );
  };

  const goToNext = () => {
    setCurrent((previous) => (previous + 1) % items.length);
  };

  return (
    <section
      id="home"
      aria-label="Campanhas em destaque"
      tabIndex={-1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={styles.hero}
    >
      {items.map((campaign, index) => {
        const isActive = index === safeCurrent;

        return (
          <a
            key={campaign.id}
            data-analytics-kind="banner"
            data-analytics-id={`banner:${campaign.id}`}
            data-analytics-label={campaign.title}
            data-analytics-active={isActive ? "true" : "false"}
            href={campaign.href}
            target={campaign.target ?? "_self"}
            rel={
              campaign.target === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
            aria-label={`Acessar campanha: ${campaign.title}`}
            tabIndex={isActive ? 0 : -1}
            className={`${styles.slide} ${isActive ? styles.active : ""}`}
          >
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={campaign.mobileImage}
              />

              <img
                src={campaign.desktopImage}
                alt={campaign.title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className={styles.image}
              />
            </picture>
          </a>
        );
      })}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Banner anterior"
            className={`${styles.arrow} ${styles.previous}`}
          >
            <Icon name="chevron-left" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Próximo banner"
            className={`${styles.arrow} ${styles.next}`}
          >
            <Icon name="chevron-right" />
          </button>

          <div
            className={styles.controls}
          >
            {items.map((campaign, index) => (
              <button
                key={campaign.id}
                type="button"
                aria-label={`Exibir campanha ${campaign.title}`}
                aria-current={index === safeCurrent ? "true" : undefined}
                onClick={() => setCurrent(index)}
                className={styles.dot}
              />
            ))}

            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={
                paused
                  ? "Retomar reprodução automática"
                  : "Pausar reprodução automática"
              }
              title={
                paused
                  ? "Retomar reprodução"
                  : "Pausar reprodução"
              }
              className={styles.pause}
            >
              <Icon name={paused ? "play" : "pause"} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}