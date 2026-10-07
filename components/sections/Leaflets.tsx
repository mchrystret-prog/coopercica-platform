"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import type { Leaflet } from "@/lib/leaflets";
import styles from "./Leaflets.module.css";

function LeafletCover({ item, featured = false }: { item: Leaflet; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  return item.cover_url && !failed ? <Image unoptimized src={item.cover_url} alt={featured ? `Capa do folheto ${item.name}` : ""} width={360} height={480} className={styles.image} draggable={false} onError={() => setFailed(true)} /> : <span className={styles.placeholder}><span>COOPERCICA</span><strong>{item.name}</strong></span>;
}

export function Leaflets({ items, content = {} }: { items: Leaflet[]; content?: Record<string, string> }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find(item => item.id === selectedId) ?? items[0];
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const sync = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    element.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => { observer.disconnect(); element.removeEventListener("scroll", sync); };
  }, [items]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const card = element.querySelector("button");
    const step = (card?.getBoundingClientRect().width ?? element.clientWidth) + (parseFloat(getComputedStyle(element).gap) || 0);
    element.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function endDrag() {
    if (drag.current?.moved) suppressClickUntil.current = Date.now() + 350;
    drag.current = null;
    setDragging(false);
  }

  if (!selected) return null;
  return <Section id="ofertas" tone="muted" className={styles.section} tabIndex={-1} aria-labelledby="leaflets-title"><Container>
    <div className={styles.layout}>
      <div className={styles.editorial}>
        <SectionHeader id="leaflets-title" stacked className={styles.heading} eyebrow={content.eyebrow || "Folheteria Digital"} title={[content.title1 ?? "OFERTAS VIGENTES,", content.title2 ?? "DO JEITO COOPERCICA."].filter(Boolean)} description={content.description || "Confira os folhetos disponíveis e encontre os produtos em oferta de forma rápida e fácil."} />
        <div className={styles.details} id="leaflet-featured-details">
          <h3>{selected.name}</h3>
          <p>Válido até <time dateTime={selected.ends_at}>{new Date(selected.ends_at + "T12:00:00").toLocaleDateString("pt-BR")}</time>{selected.pdf_url ? " · PDF disponível" : ""}</p>
        </div>
        <div className={styles.actions}><Button href={`/folheteria/${selected.slug}`} data-analytics-id={`leaflet:${selected.id}`} data-analytics-label={`Folheto: ${selected.name}`}>Ver ofertas deste folheto</Button><Button href="/folheteria" variant="secondary">{content.ctaLabel || "Ver todos os folhetos"}</Button></div>
      </div>
      <div className={styles.showcase} data-multiple={items.length > 1}>
        <Link className={styles.featuredCover} href={`/folheteria/${selected.slug}`} aria-label={`Ver ofertas de ${selected.name}`} data-analytics-id={`leaflet:${selected.id}`} data-analytics-label={`Folheto: ${selected.name}`}>
          <span className={styles.book}><LeafletCover key={`${selected.id}:${selected.cover_url}`} item={selected} featured /></span>
        </Link>
        {items.length > 1 && <div className={styles.carousel} role="region" aria-labelledby="leaflets-carousel-title" aria-roledescription="carrossel">
          <div className={styles.carouselHeader}><h3 id="leaflets-carousel-title">Folhetos vigentes</h3><div className={styles.controls}>
            <button type="button" className={styles.slideArrow} aria-label="Folhetos anteriores" aria-controls="leaflets-track" disabled={edges.start} onClick={() => move(-1)}><Icon name="chevron-left" /></button>
            <button type="button" className={styles.slideArrow} aria-label="Próximos folhetos" aria-controls="leaflets-track" disabled={edges.end} onClick={() => move(1)}><Icon name="chevron-right" /></button>
          </div></div>
          <p className={styles.hint}>Escolha o folheto em destaque.</p>
          <div id="leaflets-track" className={styles.grid} ref={track} data-dragging={dragging} tabIndex={0}
            onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); } }}
            onPointerDown={event => { if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0) return; suppressClickUntil.current = 0; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
            onPointerMove={event => { const state = drag.current; if (!state || state.id !== event.pointerId) return; const dx = event.clientX - state.x; if (!state.moved && Math.abs(dx) > 6) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); } if (state.moved) { event.preventDefault(); event.currentTarget.scrollLeft = state.left - dx; } }}
            onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={() => { if (drag.current && !drag.current.moved) endDrag(); }} onDragStart={event => event.preventDefault()}
            onClickCapture={event => { if (event.detail !== 0 && Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
            {items.map(item => <button type="button" className={styles.card} key={item.id} aria-pressed={selected.id === item.id} aria-controls="leaflet-featured-details" aria-label={`Destacar folheto ${item.name}`} onClick={() => setSelectedId(item.id)}>
              <span className={styles.cover}><LeafletCover key={item.cover_url} item={item} /></span>
              <strong>{item.name}</strong><small>Até {new Date(item.ends_at + "T12:00:00").toLocaleDateString("pt-BR")}</small>
            </button>)}
          </div>
        </div>}
      </div>
    </div>
    <span className={styles.srOnly} role="status" aria-live="polite">Folheto em destaque: {selected.name}</span>
  </Container></Section>;
}
