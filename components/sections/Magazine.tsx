"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Magazine as MagazineType } from "@/types/content";
import { magazineEditorials, emptyMagazineEditorial } from "@/lib/magazine-editorial";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "./Magazine.module.css";

function MagazineCover({ item, featured = false }: { item: MagazineType; featured?: boolean }) {
  const [failed, setFailed] = useState(false);
  return item.cover && !failed ? <Image unoptimized src={item.cover} alt={featured ? `Capa da ${item.title}` : ""} width={360} height={480} className={styles.coverImage} draggable={false} loading={featured ? "eager" : "lazy"} onError={() => setFailed(true)} /> : <span className={styles.coverFallback}><span>REVISTA<br />COOPERCICA</span><strong>{item.edition}</strong><small>{item.title}</small></span>;
}
export function Magazine({ items, content = {} }: { items: MagazineType[]; content?: Record<string, string> }) {
  const magazines = items.filter(item => Boolean(item?.id && item?.href)).map(item => item.href === "#" ? { ...item, href: "/revista" } : item);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = magazines.find(item => item.id === selectedId) ?? magazines.find(item => item.id === content.featuredId) ?? magazines[0];
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [dragging, setDragging] = useState(false);
  const stackDrag = useRef<{ id: number; x: number; y: number; dx: number; moved: boolean } | null>(null);
  const stackSuppressClick = useRef(0);
  const [stackOffset, setStackOffset] = useState(0);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const sync = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    element.addEventListener("scroll", sync, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener("scroll", sync); };
  }, [items]);
  if (!selected) return null;
  const editorial = magazineEditorials(content)[selected.id] ?? emptyMagazineEditorial;
  const highlights = editorial.highlights.filter(item => item.text.trim());
  const selectedIndex = magazines.findIndex(item => item.id === selected.id);
  function selectAdjacent(direction: number) {
    setSelectedId(magazines[(selectedIndex + direction + magazines.length) % magazines.length].id);
  }
  function finishStackDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const state = stackDrag.current;
    if (!state || state.id !== event.pointerId) return;
    if (state.moved) {
      stackSuppressClick.current = Date.now() + 350;
      if (!cancelled && Math.abs(state.dx) > 45) selectAdjacent(state.dx < 0 ? 1 : -1);
    }
    stackDrag.current = null; setStackOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function slide(direction: number) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * .8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function endDrag() {
    if (drag.current?.moved) suppressClickUntil.current = Date.now() + 350;
    drag.current = null;
    setDragging(false);
  }
  return <Section id="revista" className={styles.section} tabIndex={-1} aria-labelledby="magazine-title"><Container>
    <div className={styles.feature}>
      <div className={styles.stack}>
        <div id="magazine-stack" className={styles.stackStage} data-multiple={magazines.length > 1} role="group" aria-roledescription="carrossel" aria-label="Capas das revistas. Arraste para trocar a edição." data-dragging={stackOffset !== 0} style={{ "--drag-offset": `${stackOffset}px` } as CSSProperties}
          onPointerDown={event => { if (magazines.length < 2 || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return; stackSuppressClick.current = 0; stackDrag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, moved: false }; }}
          onPointerMove={event => { const state = stackDrag.current; if (!state || state.id !== event.pointerId) return; const dx = event.clientX - state.x, dy = event.clientY - state.y; if (!state.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { stackDrag.current = null; return; } if (!state.moved && Math.abs(dx) > 8) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); } if (state.moved) { event.preventDefault(); state.dx = dx; setStackOffset(Math.max(-110, Math.min(110, dx))); } }}
          onPointerUp={event => finishStackDrag(event)} onPointerCancel={event => finishStackDrag(event, true)} onLostPointerCapture={event => { if (event.target === event.currentTarget) finishStackDrag(event, true); }} onPointerLeave={event => { if (event.pointerType === "mouse" && stackDrag.current && !stackDrag.current.moved) stackDrag.current = null; }} onDragStart={event => event.preventDefault()}
          onClickCapture={event => { if (event.detail !== 0 && Date.now() < stackSuppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
          {magazines.map((item, index) => {
            let offset = (index - selectedIndex + magazines.length) % magazines.length;
            if (offset > magazines.length / 2) offset -= magazines.length;
            if (Math.abs(offset) > 2) return null;
            const style = { "--stack-position": offset, zIndex: 5 - Math.abs(offset) } as CSSProperties;
            return <a key={item.id} className={styles.stackCard} data-front={offset === 0} href={item.href} style={style} aria-label={offset === 0 ? `Folhear ${item.title}` : `Destacar ${item.title}`} onClick={event => { if (offset !== 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); setSelectedId(item.id); } }} data-analytics-kind={offset === 0 ? "download" : undefined} data-analytics-id={`magazine:${item.id}`}><span className={styles.book}><MagazineCover key={item.cover} item={item} featured={offset === 0} /></span></a>;
          })}
        </div>
        {magazines.length > 1 && <div className={styles.stackNavigation}><div className={styles.controls}><button type="button" aria-label="Destacar edição anterior" aria-controls="magazine-stack magazine-summary-title" onClick={() => selectAdjacent(-1)}><Icon name="chevron-left" /></button><button type="button" aria-label="Destacar próxima edição" aria-controls="magazine-stack magazine-summary-title" onClick={() => selectAdjacent(1)}><Icon name="chevron-right" /></button></div><p>{selectedIndex + 1} / {magazines.length} · Arraste para trocar</p></div>}
      </div>
      <div className={styles.editorial}>
        <p className={styles.eyebrow}>{content.eyebrow || "Revista Coopercica"}<span aria-hidden="true"> · </span>{selected.edition}</p>
        <h2 id="magazine-title">{editorial.headline.trim() || selected.title}</h2>
        <section className={styles.editionContent} aria-labelledby="magazine-summary-title">
          <h3 id="magazine-summary-title">Nessa edição</h3>
          <p className={styles.summary}>{editorial.summary.trim() || content.description?.trim() || "Folheie esta edição para conhecer todas as matérias e novidades da Revista Coopercica."}</p>
          {highlights.length ? <ul className={styles.highlights} aria-label="Assuntos desta edição">{highlights.map((item, index) => <li key={index}>{item.label.trim() ? <span>{item.label}</span> : null}<p>{item.text}</p></li>)}</ul> : null}
        </section>
        <div className={styles.actions}><Button href={selected.href} data-analytics-kind="download" data-analytics-id={`magazine:${selected.id}`}>Folhear esta edição</Button><Button variant="secondary" href="/revista">{content.ctaLabel || "Ver acervo completo"}</Button></div>
      </div>
    </div>
    <div className={styles.archive}>
      <div className={styles.archiveHeader}><h3 id="magazine-archive-title">Todas as edições</h3>{!edges.start || !edges.end ? <div className={styles.controls}><button type="button" aria-label="Edições anteriores" aria-controls="magazine-editions" disabled={edges.start} onClick={() => slide(-1)}><Icon name="chevron-left" /></button><button type="button" aria-label="Próximas edições" aria-controls="magazine-editions" disabled={edges.end} onClick={() => slide(1)}><Icon name="chevron-right" /></button></div> : null}</div>
      <p className={styles.archiveHint}>Escolha uma edição para conhecer os destaques.</p>
      <div id="magazine-editions" ref={rail} className={styles.rail} data-dragging={dragging} role="group" aria-labelledby="magazine-archive-title" tabIndex={0}
        onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); slide(event.key === "ArrowLeft" ? -1 : 1); } }}
        onPointerDown={event => { if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0) return; suppressClickUntil.current = 0; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
        onPointerMove={event => { const state = drag.current; if (!state || state.id !== event.pointerId) return; const dx = event.clientX - state.x; if (!state.moved && Math.abs(dx) > 6) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); } if (state.moved) { event.preventDefault(); event.currentTarget.scrollLeft = state.left - dx; } }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={() => { if (drag.current && !drag.current.moved) endDrag(); }} onDragStart={event => event.preventDefault()}
        onClickCapture={event => { if (event.detail !== 0 && Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {magazines.map(item => <button type="button" key={item.id} className={styles.edition} aria-pressed={selected.id === item.id} aria-label={`Mostrar destaques de ${item.title}`} onClick={() => setSelectedId(item.id)}><span className={styles.thumbnail}><MagazineCover key={item.cover} item={item} /></span><strong>{item.title}</strong><small>{item.edition}</small></button>)}
      </div>
      <span className={styles.srOnly} role="status">Edição em destaque: {selected.title}</span>
    </div>
  </Container></Section>;
}
