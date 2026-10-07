"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
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
export function Stores({ items }: { items: Store[] }) {
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
  function reset() { setCity(""); setOnlyOpen(false); setOnlyPharmacy(false); }
  return <Section id="lojas" tone="muted" className={styles.section} tabIndex={-1}>
    <Container>
      <SectionHeader eyebrow="Nossas lojas" title={["Sempre perto", "de você."]} description="Encontre sua Coopercica e consulte endereço, horários e contato de cada unidade." />
      <div className={styles.filters}>
        <div className={styles.cities} role="group" aria-label="Filtrar lojas por cidade">
          {["", ...cities].map(name => <button key={name} type="button" className={styles.city} aria-pressed={city === name} onClick={() => setCity(name)}>{name || "Todas"}</button>)}
        </div>
        <div className={styles.toggles}>
          <label className={styles.toggle}><input type="checkbox" role="switch" checked={onlyOpen} onChange={event => setOnlyOpen(event.target.checked)} /><span className={styles.track} aria-hidden="true" />Abertas agora</label>
          <label className={styles.toggle}><input type="checkbox" role="switch" checked={onlyPharmacy} onChange={event => setOnlyPharmacy(event.target.checked)} /><span className={styles.track} aria-hidden="true" />Com drogaria</label>
        </div>
      </div>
      <div className={styles.resultLine}><p role="status">{visible.length} {visible.length === 1 ? "loja encontrada" : "lojas encontradas"}</p>{city || onlyOpen || onlyPharmacy ? <button type="button" onClick={reset}>Limpar filtros</button> : null}</div>
      {visible.length ? <div className={styles.grid}>
        {visible.map(store => {
          const status = statuses.get(store.slug);
          const digits = store.phone.replace(/\D/g, "");
          const phone = digits.length === 10 || digits.length === 11 ? `+55${digits}` : /^55\d{10,11}$/.test(digits) ? `+${digits}` : null;
          return <article key={store.slug} className={styles.card}>
            <span className={styles.number} aria-hidden="true">{store.storeNumber}</span>
            <div className={styles.content}>
              <div className={styles.heading}><h3><Link href={`/lojas/${store.slug}`} aria-label={`Loja ${store.storeNumber}: ${store.name}, ${store.city}`}>Loja {store.storeNumber}</Link></h3>{hasPharmacy(store) ? <span className={styles.pharmacy}>com Drogaria</span> : null}</div>
              <p className={styles.address}>{store.address}{store.neighborhood ? `, ${store.neighborhood}` : ""}<br />{store.city}</p>
              <span className={`${styles.status} ${status?.open ? styles.open : ""}`}>
                <span aria-hidden="true" className={styles.dot} />
                {status ? status.open ? `Aberta agora, fecha às ${status.closes?.replace(/:00$/, "h").replace(":", "h")}` : "Fechada agora" : "Consulte os horários abaixo"}
              </span>
              <p className={styles.hours}><DetailIcon />{store.hours || "Consulte a unidade para confirmar os horários."}</p>
              <div className={styles.actions}>
                <a className={styles.maps} href={storeMapsLink(store)} target="_blank" rel="noopener noreferrer" aria-label={`Como chegar à Loja ${store.storeNumber}`}><Icon name="pin" />Como chegar</a>
                {phone ? <a className={styles.phone} href={`tel:${phone}`} aria-label={`Ligar para a Loja ${store.storeNumber}: ${store.phone}`}><DetailIcon phone />{store.phone}</a> : store.phone ? <span className={styles.phone}><DetailIcon phone />{store.phone}</span> : null}
              </div>
            </div>
          </article>;
        })}
      </div> : <div className={styles.empty}><p>Nenhuma loja corresponde aos filtros selecionados.</p><button type="button" onClick={reset}>Ver todas as lojas</button></div>}
      <p className={styles.note}>Horário de Brasília. O funcionamento pode mudar em feriados; confirme com a unidade.</p>
    </Container>
  </Section>;
}
