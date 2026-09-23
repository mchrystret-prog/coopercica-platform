import Image from "next/image";
import { pharmacy } from "@/data/pharmacy";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Pharmacy.module.css";

export function Pharmacy({content={}}:{content?:Record<string,string>}) {
  return <Section id="drogaria" className={styles.section} aria-labelledby="pharmacy-title" tabIndex={-1}>
    <Container className={styles.shell}>
      <div className={styles.content}>
        <SectionHeader id="pharmacy-title" eyebrow={content.eyebrow||pharmacy.eyebrow} title={[content.title1 ?? "Muito além", content.title2 ?? "dos medicamentos."].filter(Boolean)} description={content.description||pharmacy.description} stacked />
        <ul className={styles.highlights} aria-label="Destaques da Coopercica Drogaria">{pharmacy.highlights.map((item)=><li key={item}>{item}</li>)}</ul>
        <div className={styles.actions}><Button href={content.ctaHref||pharmacy.ctaHref}>{content.ctaLabel||pharmacy.ctaLabel}</Button></div>
      </div>
      <div className={styles.visual}><Image src={content.image||pharmacy.image} alt={pharmacy.imageAlt} fill sizes="(max-width: 1100px) 100vw, 42vw" className={styles.image} /></div>
    </Container>
  </Section>;
}
