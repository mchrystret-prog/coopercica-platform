"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Store } from "@/data/stores";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { openingHoursFromText, storeStatus } from "@/lib/store-hours";
import { filterStoreDirectory, hasPharmacy, storeMapsLink } from "@/lib/store-directory";
import styles from "./Stores.module.css";
const clockSubscribe = (callback: () => void) => {
  const timer = setInterval(callback, 30000);
  return () => clearInterval(timer);
};
const clockSnapshot = () => Math.floor(Date.now() / 30000) * 30000;
const clockServer = () => 0;
function DetailIcon({ phone = false }: { phone?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {phone ? <path d="M7.4 3.5 10 7.8 7.8 10a15 15 0 0 0 6.2 6.2l2.2-2.2 4.3 2.6-.8 3.4a2 2 0 0 1-2 1.5C9.3 21.5 2.5 14.7 2.5 6.3a2 2 0 0 1 1.5-2Z" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
  </svg>;
}
export function Stores({ items, compact = false, content = {} }: { items: Store[]; compact?: boolean; content?: Record<string, string> }) {
  const [city, setCity] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyPharmacy, setOnlyPharmacy] = useState(false);
  const now = useSyncExternalStore(clockSubscribe, clockSnapshot, clockServer);
  const active = useMemo(() => items.filter(item => item.active !== false), [items]);
  const cities = useMemo(() => [...new Set(active.map(store => store.city))], [active]);
  const statuses = useMemo(() => new Map(active.map(store => {
    const hours = openingHoursFromText(store.hours);
    return [store.slug, now > 0 && Object.keys(hours).length ? storeStatus(hours, new Date(now)) : null];
  })), [active, now]);
  const visible = useMemo(() => filterStoreDirectory(active, { city, onlyOpen, onlyPharmacy }, store => statuses.get(store.slug)?.open === true), [active, city, onlyOpen, onlyPharmacy, statuses]);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [failedHero, setFailedHero] = useState<string | null>(null);
  const heroImage = content.image || "/images/stores/coopercica-sunset.webp";
  const resultKey = visible.map(store => store.slug).join("|");
  useEffect(() => {
    const element = rail.current;
    if (!compact || !element) return;
    element.scrollLeft = 0;
    const sync = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(sync); observer.observe(element); element.addEventListener("scroll", sync, { passive: true }); sync();
    return () => { observer.disconnect(); element.removeEventListener("scroll", sync); };
  }, [compact, resultKey]);
  function slide(direction: number) {
    const element = rail.current;
    if (!element) return;
    const card = element.querySelector("article");
    element.scrollBy({ left: direction * ((card?.getBoundingClientRect().width || element.clientWidth) + 16), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function endDrag() { if (drag.current?.moved) suppressClick.current = Date.now() + 350; drag.current = null; setDragging(false); }
  function reset() { setCity(""); setOnlyOpen(false); setOnlyPharmacy(false); }
  return <Section id="lojas" tone="muted" className={`${styles.section} ${compact ? styles.compact : ""}`} tabIndex={-1} aria-labelledby="stores-title">
    <Container>
      {compact ? <div className={styles.hero}><div className={styles.heroCopy}><SectionHeader id="stores-title" stacked light eyebrow={content.eyebrow || "Nossas lojas"} title={[content.title1 || "SEMPRE PERTO", content.title2 || "DE VOCÊ."]} description={content.description || "Encontre sua Coopercica em Jundiaí e região. Escolha uma unidade abaixo."} /></div><div className={styles.heroPhoto}><Image src={failedHero === heroImage ? "/images/stores/coopercica-sunset.webp" : heroImage} alt={failedHero !== heroImage && content.imageAlt || "Fachada de uma loja Coopercica ao pôr do sol"} width={1546} height={1017} className={styles.heroImage} unoptimized onError={() => setFailedHero(heroImage)} /></div></div> : <SectionHeader id="stores-title" eyebrow="Nossas lojas" title={["Sempre perto", "de você."]} description="Encontre sua Coopercica e consulte endereço, horários e contato de cada unidade." />}
      <div className={styles.filters}>
        <div className={styles.cities} role="group" aria-label="Filtrar lojas por cidade">
          {["", ...cities].map(name => <button key={name} type="button" className={styles.city} aria-pressed={city === name} onClick={() => setCity(name)}>{name || "Todas"}</button>)}
        </div>
        <div className={styles.toggles}>
          <label className={styles.toggle}><input type="checkbox" role="switch" checked={onlyOpen} onChange={event => setOnlyOpen(event.target.checked)} /><span className={styles.track} aria-hidden="true" />Abertas agora</label>
          <label className={styles.toggle}><input type="checkbox" role="switch" checked={onlyPharmacy} onChange={event => setOnlyPharmacy(event.target.checked)} /><span className={styles.track} aria-hidden="true" />Com drogaria</label>
        </div>
      </div>
      <div className={styles.resultLine}><p role="status">{visible.length} {visible.length === 1 ? "loja encontrada" : "lojas encontradas"}</p>{city || onlyOpen || onlyPharmacy ? <button type="button" onClick={reset}>Limpar filtros</button> : null}{compact && visible.length > 1 && <div className={styles.carouselControls}><button type="button" aria-label="Lojas anteriores" aria-controls="stores-carousel" disabled={edges.start} onClick={() => slide(-1)}><Icon name="chevron-left" /></button><button type="button" aria-label="Próximas lojas" aria-controls="stores-carousel" disabled={edges.end} onClick={() => slide(1)}><Icon name="chevron-right" /></button></div>}</div>
      {visible.length ? <div className={compact ? styles.rail : styles.grid} ref={rail} id={compact ? "stores-carousel" : undefined} data-dragging={dragging} role={compact ? "group" : undefined} aria-label={compact ? "Lojas Coopercica. Arraste para navegar." : undefined} aria-roledescription={compact ? "carrossel" : undefined} tabIndex={compact ? 0 : undefined}
        onKeyDown={event => { if (compact && event.target === event.currentTarget && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); slide(event.key === "ArrowLeft" ? -1 : 1); } }}
        onPointerDown={event => { if (!compact || event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0) return; suppressClick.current = 0; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
        onPointerMove={event => { const state = drag.current; if (!state || state.id !== event.pointerId) return; const dx = event.clientX - state.x; if (!state.moved && Math.abs(dx) > 6) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); } if (state.moved) { event.preventDefault(); event.currentTarget.scrollLeft = state.left - dx; } }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onPointerLeave={() => { if (drag.current && !drag.current.moved) endDrag(); }} onDragStart={event => { if (compact) event.preventDefault(); }} onClickCapture={event => { if (compact && event.detail !== 0 && Date.now() < suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
        {visible.map(store => {
          const status = statuses.get(store.slug);
          const digits = store.phone.replace(/\D/g, "");
          const phone = digits.length === 10 || digits.length === 11 ? `+55${digits}` : /^55\d{10,11}$/.test(digits) ? `+${digits}` : null;
          return <article key={store.slug} className={styles.card}>
            <span className={styles.number} aria-hidden="true">{store.storeNumber}</span>
            <div className={styles.content}>
              <div className={styles.heading}><h3><Link href={`/lojas/${store.slug}`} aria-label={`Loja ${store.storeNumber}: ${store.name}, ${store.city}`}>Loja {store.storeNumber}</Link></h3>{hasPharmacy(store) ? <span className={styles.pharmacy}>com Drogaria</span> : null}</div>
              {compact && <p className={styles.storeName}>{store.name}</p>}
              <p className={styles.address}>{store.address}{store.neighborhood ? `, ${store.neighborhood}` : ""}<br />{store.city}</p>
              <span className={`${styles.status} ${status?.open ? styles.open : ""}`}>
                <span aria-hidden="true" className={styles.dot} />
                {status ? status.open ? `Aberta agora, fecha às ${status.closes?.replace(/:00$/, "h").replace(":", "h")}` : "Fechada agora" : compact ? "Confira os horários em Ver loja" : "Consulte os horários abaixo"}
              </span>
              {!compact && <p className={styles.hours}><DetailIcon />{store.hours || "Consulte a unidade para confirmar os horários."}</p>}
              <div className={styles.actions}>
                <a className={styles.maps} href={storeMapsLink(store)} target="_blank" rel="noopener noreferrer" aria-label={`Como chegar à Loja ${store.storeNumber}`}><Icon name="pin" />Como chegar</a>
                {compact ? <Link className={styles.maps} href={`/lojas/${store.slug}`} aria-label={`Ver detalhes da Loja ${store.storeNumber}`}>Ver loja</Link> : phone ? <a className={styles.phone} href={`tel:${phone}`} aria-label={`Ligar para a Loja ${store.storeNumber}: ${store.phone}`}><DetailIcon phone />{store.phone}</a> : store.phone ? <span className={styles.phone}><DetailIcon phone />{store.phone}</span> : null}
              </div>
            </div>
          </article>;
        })}
      </div> : <div className={styles.empty}><p>Nenhuma loja corresponde aos filtros selecionados.</p><button type="button" onClick={reset}>Ver todas as lojas</button></div>}
      <p className={styles.note}>Horário de Brasília. O funcionamento pode mudar em feriados; confirme com a unidade.</p>
    </Container>
  </Section>;
}
