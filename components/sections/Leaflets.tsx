import Link from "next/link";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import type { Leaflet } from "@/lib/leaflets";
import styles from "./Leaflets.module.css";

export function Leaflets({items}:{items:Leaflet[]}){
  if(!items.length) return null;
  return <Section id="ofertas" tone="muted" className={styles.section} tabIndex={-1}>
    <Container>
      <SectionHeader eyebrow="Folheteria Digital" title={["OFERTAS VIGENTES,","DO JEITO COOPERCICA."]} description="Confira os folhetos disponíveis e encontre os produtos em oferta de forma rápida e fácil." />
      <div className={styles.grid}>{items.map(item=><Link className={styles.card} href={`/folheteria/${item.slug}`} key={item.id}>
        <div className={styles.cover}>{item.cover_url?<img src={item.cover_url} alt="" />:<div className={styles.placeholder}><span>COOPERCICA</span><strong>{item.name}</strong></div>}</div>
        <div className={styles.info}><div><strong>{item.name}</strong><small>Válido até {new Date(item.ends_at+"T12:00:00").toLocaleDateString("pt-BR")}</small></div><span aria-hidden="true">→</span></div>
      </Link>)}</div>
      <Link href="/folheteria" className={styles.all}>Ver todos os folhetos <span>→</span></Link>
    </Container>
  </Section>
}
