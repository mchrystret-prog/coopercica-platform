import type { Magazine as MagazineType } from "@/types/content";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Magazine.module.css";

export function Magazine({ items }: { items: MagazineType[] }) {
  return <Section id="revista" className={styles.section} tabIndex={-1}>
    <Container>
      <div className={styles.top}>
        <SectionHeader className={styles.header} eyebrow="Revista Coopercica" title={["Conteúdo para", "viver melhor."]} stacked />
        <Button href="/revista" variant="secondary">Ver todas as edições</Button>
      </div>
      <div className={styles.grid}>{items.map((item)=><a className={styles.card} href={item.href} key={item.id}><div className={styles.cover}>{item.edition}</div><span className={styles.edition}>{item.edition}</span><h3>{item.title}</h3></a>)}</div>
    </Container>
  </Section>;
}
