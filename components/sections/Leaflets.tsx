"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import type { Leaflet } from "@/lib/leaflets";
import styles from "./Leaflets.module.css";

export function Leaflets({ items, content = {} }: { items: Leaflet[]; content?: Record<string, string> }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointerId: -1, startX: 0, scrollLeft: 0, moved: false });
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); el.removeEventListener("scroll", update); };
  }, [items]);

  const move = (direction: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLAnchorElement>("a");
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + (parseFloat(getComputedStyle(el).gap) || 0);
    el.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    drag.current.moved = false;
    if (event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft, moved: false };
  };

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) <= 6) return;
    const el = event.currentTarget;
    if (!state.moved) {
      state.moved = true;
      // Capture only after a drag starts so ordinary link clicks keep working.
      el.setPointerCapture(event.pointerId);
      el.classList.add(styles.dragging);
    }
    el.scrollLeft = state.scrollLeft - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    drag.current.pointerId = -1;
    event.currentTarget.classList.remove(styles.dragging);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const preventClick = (event: MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    drag.current.moved = false;
  };

  if (!items.length) return null;
  return <Section id="ofertas" tone="muted" className={styles.section} tabIndex={-1}>
    <Container>
      <SectionHeader eyebrow={content.eyebrow || "Folheteria Digital"} title={[content.title1 ?? "OFERTAS VIGENTES,", content.title2 ?? "DO JEITO COOPERCICA."].filter(Boolean)} description={content.description || "Confira os folhetos disponíveis e encontre os produtos em oferta de forma rápida e fácil."} />
      <div className={styles.carousel} role="region" aria-label="Folhetos disponíveis" aria-roledescription="carrossel">
        <button type="button" className={`${styles.slideArrow} ${styles.prev}`} aria-label="Folhetos anteriores" aria-controls="leaflets-track" disabled={edges.start} onClick={() => move(-1)}>‹</button>
        <div id="leaflets-track" className={styles.grid} ref={track} onPointerDown={down} onPointerMove={pointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={event => { if (!drag.current.moved) endDrag(event); }} onClickCapture={preventClick} onDragStart={event => event.preventDefault()}>
          {items.map(item => <Link className={styles.card} href={`/folheteria/${item.slug}`} key={item.id} draggable={false}>
            <div className={styles.cover}>{item.cover_url ? <img src={item.cover_url} alt="" draggable={false} /> : <div className={styles.placeholder}><span>COOPERCICA</span><strong>{item.name}</strong></div>}</div>
            <div className={styles.info}><div><strong>{item.name}</strong><small>Válido até {new Date(item.ends_at + "T12:00:00").toLocaleDateString("pt-BR")}</small></div><span aria-hidden="true">→</span></div>
          </Link>)}
        </div>
        <button type="button" className={`${styles.slideArrow} ${styles.next}`} aria-label="Próximos folhetos" aria-controls="leaflets-track" disabled={edges.end} onClick={() => move(1)}>›</button>
      </div>
      <Link href="/folheteria" className={styles.all}>{content.ctaLabel || "Ver todos os folhetos"} <span>→</span></Link>
    </Container>
  </Section>;
}
