import { PageHeading } from "@/components/layout/PageHeading";
import type { CareersHeroImage } from "@/lib/careers-hero";
import type { CareersContent } from "@/lib/careers-content";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "./CareersStory.module.css";
export function CareersStory({ content, image }: { content: CareersContent; image?: CareersHeroImage }) {
  return <>
    <PageHeading eyebrow="Carreiras Coopercica" title={content.heroTitle} intro={content.heroIntro}
      image={image ?? { src: "/stores/eloy-chaves.jpg", alt: "Fachada da Coopercica no Eloy Chaves" }} />
    <Container>
      <div className={styles.actions} style={{ marginTop: "var(--space-8)" }}>
        <Button href="#oportunidades">Encontre sua oportunidade</Button>
        <a className="button button-secondary" href="#nossa-cultura">Conheça o que nos move <span aria-hidden="true">↓</span></a>
      </div>
    </Container>
    <Section id="nossa-cultura" className={styles.manifesto} aria-labelledby="manifesto-title">
      <Container>
        <div className={styles.editorialGrid}>
          <div data-careers-reveal><span className="eyebrow">Nossa essência</span><h2 id="manifesto-title" className={styles.title}>{content.manifestoTitle}</h2><span className={styles.year}>1969 <span>O começo de uma história coletiva.</span></span></div>
          <div className={styles.manifestoCopy} data-careers-reveal data-careers-delay="70">{content.manifesto.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<Button href="/quem-somos">Conheça nossa história</Button></div>
        </div>
      </Container>
    </Section>
    <Section tone="soft" aria-labelledby="purpose-title">
      <Container>
        <span className="eyebrow">Nosso propósito</span>
        <h2 data-careers-reveal id="purpose-title" className={styles.title}>O trabalho ganha sentido<br />quando a gente coopera.</h2>
        <div className={styles.purposeGrid}>
          <article data-careers-reveal><span className={styles.number} aria-hidden="true">01</span><h3>Missão</h3><p>{content.mission}</p></article>
          <article data-careers-reveal data-careers-delay="70"><span className={styles.number} aria-hidden="true">02</span><h3>Visão</h3><p>{content.vision}</p></article>
        </div>
      </Container>
    </Section>
    <Section aria-labelledby="values-title">
      <Container>
        <div className={styles.valuesHeading} data-careers-reveal><div><span className="eyebrow">Nossos valores</span><h2 id="values-title" className={styles.title}>É assim que seguimos juntos.</h2></div><p>Princípios que orientam a nossa relação com quem trabalha, compra e coopera com a gente.</p></div>
        <div className={styles.valuesGrid}>{[
          ["Respeito", content.respect], ["Ética", content.ethics], ["Cooperação", content.cooperation],
        ].map(([title, description], index) => <article key={title} data-careers-reveal data-careers-delay={index * 70}><span className={styles.valueIndex} aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </Container>
    </Section>
    <section className={styles.invitation} aria-labelledby="invitation-title"><Container><div className={styles.invitationGrid} data-careers-reveal><div><span className={styles.eyebrow}>Seu próximo passo</span><h2 id="invitation-title">Faça parte dos próximos capítulos.</h2><p>Conheça as vagas e encontre onde seu talento pode fazer a diferença na Coopercica.</p></div><Button href="#oportunidades">Quero fazer parte</Button></div></Container></section>
  </>;
}
