"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { CareersBanner } from "@/lib/careers-banners";
import styles from "./CareersBannerSlider.module.css";

export function CareersBannerSlider({ items, interval = 8000, autoplay = true }: { items: CareersBanner[]; interval?: number; autoplay?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(!autoplay);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const touch = useRef<number | null>(null);
  const swiped = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const stopped = paused || hovered || focused || reduced;
  useEffect(() => {
    if (stopped || items.length < 2) return;
    const timer = window.setInterval(() => { if (!document.hidden) setCurrent(previous => (previous + 1) % items.length); }, interval);
    return () => window.clearInterval(timer);
  }, [stopped, items.length, interval]);
  if (!items.length) return null;
  const active = current % items.length;
  const go = (index: number) => setCurrent((index + items.length) % items.length);
  return <section id="depoimentos" className={styles.slider} aria-label="Histórias de quem faz parte da Coopercica" aria-roledescription="carrossel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onKeyDown={event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); go(active + (event.key === "ArrowLeft" ? -1 : 1)); } }}>
    <div className={styles.stage} onClickCapture={event => { if (swiped.current) { event.preventDefault(); swiped.current = false; } }} onTouchStart={event => { swiped.current = false; touch.current = event.touches[0].clientX; }} onTouchEnd={event => {
      if (touch.current !== null) { const delta = event.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 50) { swiped.current = true; go(active + (delta < 0 ? 1 : -1)); setPaused(true); } } touch.current = null;
    }}>
      {items.map((item, index) => <a key={item.id} href={item.href} className={styles.slide} hidden={index !== active}
        data-analytics-kind="banner" data-analytics-id={`careers-banner:${item.id}`} data-analytics-label={`Vagas · ${item.title}`} data-analytics-active={index === active ? "true" : "false"}>
        <picture>
          {item.mobileImage ? <source media="(max-width: 767px)" srcSet={item.mobileImage} width={1080} height={1350} /> : null}
          {/* Uploaded artwork must remain whole, including its testimonial text. */}
          <img src={item.image} alt={item.title} width={3384} height={864} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
        </picture>
      </a>)}
    </div>
    {items.length > 1 ? <div className={styles.controls}>
      <button type="button" onClick={() => go(active - 1)} aria-label="Depoimento anterior"><Icon name="chevron-left" /></button>
      <div className={styles.dots}>{items.map((item, index) => <button key={item.id} type="button" aria-label={`Exibir depoimento ${index + 1}: ${item.title}`} aria-current={index === active ? "true" : undefined} onClick={() => go(index)}><span /></button>)}</div>
      <button type="button" onClick={() => go(active + 1)} aria-label="Próximo depoimento"><Icon name="chevron-right" /></button>
      {!reduced ? <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Retomar depoimentos" : "Pausar depoimentos"}><Icon name={paused ? "play" : "pause"} /></button> : null}
      <span className={styles.count} aria-live={stopped ? "polite" : "off"}>{active + 1} / {items.length}</span>
    </div> : null}
  </section>;
}
