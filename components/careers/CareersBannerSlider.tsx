"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CareersBanner } from "@/lib/careers-banners";
import styles from "./CareersBannerSlider.module.css";

export function CareersBannerSlider({ items }: { items: CareersBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (paused || hovered || items.length < 2) return;
    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % items.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, items.length]);

  if (!items.length) return null;

  const safeCurrent = current % items.length;
  const previous = () => setCurrent((value) => value % items.length === 0 ? items.length - 1 : value % items.length - 1);
  const next = () => setCurrent((value) => (value + 1) % items.length);

  return (
    <section
      className={styles.slider}
      aria-label="Banners do Portal de Vagas"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {items.map((banner, index) => {
        const active = index === safeCurrent;
        const media = (
          <picture>
            {banner.mobileImage ? <source media="(max-width: 767px)" srcSet={banner.mobileImage} /> : null}
            <img
              className={styles.image}
              src={banner.desktopImage}
              alt={banner.title}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </picture>
        );
        return banner.href ? (
          <a
            key={banner.id}
            className={`${styles.slide} ${active ? styles.active : ""}`}
            href={banner.href}
            aria-label={banner.title}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
          >
            {media}
          </a>
        ) : (
          <div
            key={banner.id}
            className={`${styles.slide} ${active ? styles.active : ""}`}
            aria-hidden={!active}
          >
            {media}
          </div>
        );
      })}

      {items.length > 1 ? (
        <>
          <button type="button" onClick={previous} aria-label="Banner anterior" className={`${styles.arrow} ${styles.previous}`}>
            <Icon name="chevron-left" />
          </button>
          <button type="button" onClick={next} aria-label="Próximo banner" className={`${styles.arrow} ${styles.next}`}>
            <Icon name="chevron-right" />
          </button>
          <div className={styles.controls}>
            {items.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Exibir banner ${index + 1}: ${banner.title}`}
                aria-current={index === safeCurrent ? "true" : undefined}
                onClick={() => setCurrent(index)}
                className={styles.dot}
              />
            ))}
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Retomar reprodução automática" : "Pausar reprodução automática"}
              title={paused ? "Retomar reprodução" : "Pausar reprodução"}
              className={styles.pause}
            >
              <Icon name={paused ? "play" : "pause"} />
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
