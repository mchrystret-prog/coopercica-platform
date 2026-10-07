"use client";
import { useEffect, useRef, useState } from "react";
import { partnerRows, validPartnerLink, type Partner } from "@/lib/home-partners";
import styles from "./Partners.module.css";
function PartnerIcon({ kind }: { kind: Partner["icon"] }) {
  return <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {kind === "bag" ? <><path d="M14 22h36l4 34H10l4-34Z" /><path d="M23 24v-9a9 9 0 0 1 18 0v9M23 36c4 7 14 7 18 0" /></> : kind === "education" ? <><path d="m4 23 28-13 28 13-28 13L4 23ZM16 30v16c10 9 22 9 32 0V30M58 25v23" /></> : <><path d="m5 27 13-12 12 6 12-6 17 14-12 21-10 4-23-14L5 27Z" /><path d="m30 21-9 10 5 6 13-9 14 14M28 42l10 8" /></>}
  </svg>;
}
export function Partners({ content }: { content: Record<string, string> }) {
  const items = partnerRows(content).filter(item => item.enabled && item.title.trim() && validPartnerLink(item.href));
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const sync = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    element.addEventListener("scroll", sync, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener("scroll", sync); };
  }, [content.items, content.enabled, items.length]);
  if (content.enabled === "false" || !items.length) return null;
  function slide(direction: number) {
    const element = rail.current;
    if (!element) return;
    const card = element.firstElementChild;
    const distance = card ? card.getBoundingClientRect().width + 24 : element.clientWidth;
    element.scrollBy({ left: direction * distance, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function endDrag() {
    if (drag.current?.moved) suppressClickUntil.current = Date.now() + 350;
    drag.current = null;
    setDragging(false);
  }
  return <section className={styles.section} id="parceiros" aria-labelledby="partners-heading">
    <div className={`shell ${styles.inner}`}>
      <div className={styles.heading}><h2 id="partners-heading">{content.title?.trim() || "Parceiros"}</h2>
        <div className={styles.controls}><button type="button" aria-label="Parceiros anteriores" aria-controls="partners-rail" disabled={edges.start} onClick={() => slide(-1)}>←</button><button type="button" aria-label="Próximos parceiros" aria-controls="partners-rail" disabled={edges.end} onClick={() => slide(1)}>→</button></div>
      </div>
      <div id="partners-rail" ref={rail} className={styles.rail} data-dragging={dragging} role="group" aria-label="Parcerias da Coopercica" tabIndex={0}
        onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); slide(event.key === "ArrowLeft" ? -1 : 1); } }}
        onPointerDown={event => { if (event.pointerType !== "mouse" || event.button !== 0) return; suppressClickUntil.current = 0; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
        onPointerMove={event => {
          const state = drag.current;
          if (!state || event.pointerId !== state.id) return;
          const distance = event.clientX - state.x;
          if (Math.abs(distance) > 6 && !state.moved) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }
          if (state.moved) { event.preventDefault(); event.currentTarget.scrollLeft = state.left - distance; }
        }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
        onPointerLeave={() => { if (drag.current && !drag.current.moved) endDrag(); }}
        onDragStart={event => event.preventDefault()}
        onClickCapture={event => { if (Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {items.map((item, index) => <a className={styles.card} data-theme={item.theme} key={`${item.href}-${index}`} href={item.href} data-analytics-id={`partner:${index}`} data-analytics-label={item.title} draggable={false}>
          <div className={styles.copy}><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}<span className={styles.cta}>Saiba mais <span aria-hidden="true">↗</span></span></div>
          <span className={styles.art}><PartnerIcon kind={item.icon} /></span>
        </a>)}
      </div>
    </div>
  </section>;
}
