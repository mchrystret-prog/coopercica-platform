"use client";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { Magazine as MagazineType } from "@/types/content";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Magazine.module.css";
type MagazineWithCover = MagazineType & { cover?: string; image?: string; thumbnail?: string };
export function Magazine({ items, content = {} }: { items: MagazineType[]; content?: Record<string, string> }) {
  const magazines = useMemo(() => items.filter(item => Boolean(item?.id && item?.href)), [items]);
  const [index, setIndex] = useState(0);
  const deck = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; dx: number; horizontal: boolean } | null>(null);
  const suppressClick = useRef(false);
  const current = Math.min(index, Math.max(0, magazines.length - 1));
  const selected = magazines[current];
  if (!selected) return null;
  const change = (direction: number) => setIndex((current + direction + magazines.length) % magazines.length);
  function start(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || magazines.length < 2) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, horizontal: false };
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const value = gesture.current;
    if (!value || value.id !== event.pointerId) return;
    const dx = event.clientX - value.x, dy = event.clientY - value.y;
    if (!value.horizontal && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesture.current = null; return; }
    if (!value.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      value.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (value.horizontal) {
      event.preventDefault();
      value.dx = dx;
      suppressClick.current = true;
      deck.current?.style.setProperty("--drag", `${Math.max(-100, Math.min(100, dx))}px`);
      deck.current?.setAttribute("data-dragging", "true");
    }
  }
  function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const value = gesture.current;
    if (!value || value.id !== event.pointerId) return;
    gesture.current = null;
    deck.current?.style.setProperty("--drag", "0px");
    deck.current?.removeAttribute("data-dragging");
    if (!cancelled && value.horizontal && Math.abs(value.dx) >= 40) change(value.dx < 0 ? 1 : -1);
  }
  return <Section id="revista" className={styles.section} tabIndex={-1} aria-labelledby="magazine-title"><Container>
    <SectionHeader className={styles.header} id="magazine-title" eyebrow={content.eyebrow || "REVISTA COOPERCICA"} title={[content.title1 ?? "TODO MÊS, UMA", content.title2 ?? "NOVA EDIÇÃO PRA VOCÊ."].filter(Boolean)} stacked />
    <div className={styles.carousel} role="region" aria-roledescription="carrossel" aria-label="Edições da Revista Coopercica">
      <div ref={deck} className={styles.deck} tabIndex={0} aria-label="Deslize ou use as setas para trocar a revista" onPointerDown={start} onPointerMove={move} onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)} onClickCapture={event => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); } }} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); change(event.key === "ArrowRight" ? 1 : -1); } }}>
        {magazines.map((item, position) => {
          const distance = (position - current + magazines.length) % magazines.length;
          const layer = distance === 0 ? "current" : distance === 1 ? "next" : distance === magazines.length - 1 ? "previous" : "hidden";
          const cover = (item as MagazineWithCover).cover ?? (item as MagazineWithCover).image ?? (item as MagazineWithCover).thumbnail;
          return <a key={item.id} className={styles.coverLink} data-position={layer} href={item.href} tabIndex={distance === 0 ? 0 : -1} aria-hidden={distance !== 0} aria-label={`Ler ${item.edition}: ${item.title}`} data-analytics-kind="download" data-analytics-id={`magazine:${item.id}`} data-analytics-label={`Revista: ${item.edition}`} draggable={false}>
            {cover ? <Image unoptimized src={cover} alt={`Capa da ${item.edition}`} width={360} height={480} className={styles.coverImage} draggable={false} loading={distance === 0 ? "eager" : "lazy"} /> : <div className={styles.coverFallback}><span>REVISTA COOPERCICA</span><strong>{item.edition}</strong><small>{item.title}</small></div>}
          </a>;
        })}
      </div>
      <div className={styles.navigation}><button type="button" onClick={() => change(-1)} disabled={magazines.length < 2} aria-label="Revista anterior">←</button><span aria-live="polite" aria-atomic="true">{current + 1} de {magazines.length} · {selected.edition}</span><button type="button" onClick={() => change(1)} disabled={magazines.length < 2} aria-label="Próxima revista">→</button></div>
      <div className={styles.info}><h3>{selected.title}</h3><div className={styles.actions}><Button href={selected.href} data-analytics-kind="download" data-analytics-id={`magazine:${selected.id}`}>Ler edição</Button><Button variant="secondary" href="/revista">{content.ctaLabel || "Ver todas as edições"}</Button></div></div>
    </div>
  </Container></Section>;
}
