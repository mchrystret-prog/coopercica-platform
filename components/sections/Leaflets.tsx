"use client";
import{useRef}from"react";
import Link from "next/link";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import type { Leaflet } from "@/lib/leaflets";
import styles from "./Leaflets.module.css";

export function Leaflets({items,content={}}:{items:Leaflet[];content?:Record<string,string>}){const track=useRef<HTMLDivElement>(null);const move=(dir:number)=>{const el=track.current;if(!el)return;const card=el.querySelector<HTMLElement>("a");const gap=parseFloat(getComputedStyle(el).gap||"0");const step=(card?.getBoundingClientRect().width||el.clientWidth*.8)+gap;el.scrollBy({left:dir*step,behavior:"smooth"})};
  if(!items.length) return null;
  return <Section id="ofertas" tone="muted" className={styles.section} tabIndex={-1}>
    <Container>
      <SectionHeader eyebrow={content.eyebrow||"Folheteria Digital"} title={[content.title1 ?? "OFERTAS VIGENTES,",content.title2 ?? "DO JEITO COOPERCICA."].filter(Boolean)} description={content.description||"Confira os folhetos disponíveis e encontre os produtos em oferta de forma rápida e fácil."} />
      <div className={styles.carouselHead}><div className={styles.arrows}><button type="button" aria-label="Folhetos anteriores" onClick={()=>move(-1)}>←</button><button type="button" aria-label="Próximos folhetos" onClick={()=>move(1)}>→</button></div></div><div className={styles.grid} ref={track}>{items.map(item=><Link className={styles.card} href={`/folheteria/${item.slug}`} key={item.id}>
        <div className={styles.cover}>{item.cover_url?<img src={item.cover_url} alt="" />:<div className={styles.placeholder}><span>COOPERCICA</span><strong>{item.name}</strong></div>}</div>
        <div className={styles.info}><div><strong>{item.name}</strong><small>Válido até {new Date(item.ends_at+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><span aria-hidden="true">→</span></div>
      </Link>)}</div>
      <Link href="/folheteria" className={styles.all}>{content.ctaLabel||"Ver todos os folhetos"} <span>→</span></Link>
    </Container>
  </Section>
}
