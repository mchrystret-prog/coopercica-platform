"use client";
import { useEffect, useRef } from "react";
import type { Magazine } from "@/types/content";
import styles from "./MobileMagazineCarousel.module.css";

export function MobileMagazineCarousel({ items, selectedId, onSelect }: {
  items: Magazine[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrolling = useRef(false);
  const touching = useRef(false);
  const firstSync = useRef(true);
  const selected = useRef(selectedId);
  const select = useRef(onSelect);
  useEffect(() => { selected.current = selectedId; select.current = onSelect; }, [selectedId, onSelect]);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const sync = (animate = false) => {
      if ((scrolling.current && !animate) || !element.clientWidth) return;
      const index = items.findIndex(item => item.id === selected.current);
      const left = index * element.clientWidth;
      if (index >= 0 && Math.abs(element.scrollLeft - left) > 1) element.scrollTo({ left, behavior: animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
    };
    sync(!firstSync.current);
    if (element.clientWidth) firstSync.current = false;
    const resize = new ResizeObserver(() => sync());
    resize.observe(element);
    return () => resize.disconnect();
  }, [items, selectedId]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const settle = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (touching.current) return;
    const element = track.current;
    scrolling.current = false;
    if (!element?.clientWidth) return;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(element.scrollLeft / element.clientWidth)));
    if (items[index] && items[index].id !== selected.current) select.current(items[index].id);
  };
  return (
    <div id="magazine-mobile-stack" ref={track} className={styles.track} aria-label="Capas das revistas" aria-roledescription="carrossel" aria-describedby={items.length > 1 ? "magazine-stack-hint" : undefined}
      onTouchStart={() => { touching.current = true; if (timer.current) clearTimeout(timer.current); }}
      onTouchEnd={() => { touching.current = false; if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(settle, 160); }}
      onTouchCancel={() => { touching.current = false; if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(settle, 160); }}
      onScroll={() => { scrolling.current = true; if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(settle, 160); }}
      onScrollEnd={settle}
      onKeyDown={event => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const element = track.current;
        element?.scrollBy({ left: (event.key === "ArrowRight" ? 1 : -1) * element.clientWidth, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}
      tabIndex={items.length > 1 ? 0 : -1}>
      {items.map((item, index) => <div key={item.id} className={styles.slide}>
        <a href={item.href} className={styles.cover} aria-label={`Folhear ${item.title}`} tabIndex={item.id === selectedId ? 0 : -1} data-analytics-kind="download" data-analytics-id={`magazine:${item.id}`}>
          {item.cover ? <>
            {/* Native scroll keeps the decoded cover nodes mounted throughout the swipe. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt={`Capa da ${item.title}`} width={360} height={480} draggable={false} decoding="async" loading={Math.abs(index - items.findIndex(row => row.id === selectedId)) <= 1 ? "eager" : "lazy"} />
          </> : <span className={styles.fallback}><strong>REVISTA COOPERCICA</strong><span>{item.edition}</span><span>{item.title}</span></span>}
        </a>
      </div>)}
    </div>
  );
}

