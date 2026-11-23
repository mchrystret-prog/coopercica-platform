import type { CareersContent } from "@/lib/careers-content";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "./CareersStory.module.css";
import type { CareersTestimonial } from "@/lib/careers-testimonials";

export function CareersStory({ content, testimonials }: { content: CareersContent; testimonials: CareersTestimonial[] }) {
  return <>
    <Section id="nossa-cultura" className={styles.manifesto} aria-labelledby="manifesto-title">
      <Container>
        <div className={styles.editorialGrid}>
          <div data-careers-reveal><span className="eyebrow">Nossa essência</span><h2 id="manifesto-title" className={styles.title}>{content.manifestoTitle}</h2><div className={styles.historyYears}>
            <div className={styles.yearRange} aria-label="De 1969 a 2026">
              <span>1969</span>
              <svg className={styles.yearLoop} viewBox="0 0 48 24" fill="none" aria-hidden="true" focusable="false">
                <path className={styles.loopTrack} d="M24 12C19 3 12 3 8 6C1 11 5 21 12 20C17 20 20 16 24 12C28 8 31 4 36 4C43 3 47 13 40 18C36 21 29 21 24 12Z"/>
                <path className={styles.loopTrail} pathLength="100" d="M24 12C19 3 12 3 8 6C1 11 5 21 12 20C17 20 20 16 24 12C28 8 31 4 36 4C43 3 47 13 40 18C36 21 29 21 24 12Z"/>
              </svg>
              <span>2026</span>
            </div>
            <p>O começo de uma história coletiva. E seguimos escrevendo novos capítulos.</p>
          </div></div>
          <div className={styles.manifestoCopy} data-careers-reveal data-careers-delay="70">{content.manifesto.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<Button href="/quem-somos">Conheça nossa história</Button></div>
        </div>
      </Container>
    </Section>
    <Section tone="soft" aria-labelledby="purpose-title">
      <Container>
        <span className="eyebrow">Nosso propósito</span>
        <h2 data-careers-reveal id="purpose-title" className={styles.title}>O trabalho ganha sentido<br />quando a gente coopera.</h2>
        <div className={styles.purposeGrid} data-careers-stack>
          <article data-careers-reveal><span className={styles.number} aria-hidden="true">01</span><h3>Missão</h3><p>{content.mission}</p></article>
          <article data-careers-reveal data-careers-delay="70"><span className={styles.number} aria-hidden="true">02</span><h3>Visão</h3><p>{content.vision}</p></article>
        </div>
      </Container>
    </Section>
    <Section aria-labelledby="values-title">
      <Container>
        <div className={styles.valuesHeading} data-careers-reveal><div><span className="eyebrow">Nossos valores</span><h2 id="values-title" className={styles.title}>É assim que seguimos juntos.</h2></div><p>Princípios que orientam a nossa relação com quem trabalha, compra e coopera com a gente.</p></div>
        <div className={styles.valuesGrid} data-careers-stack>{[
          ["Respeito", content.respect], ["Ética", content.ethics], ["Cooperação", content.cooperation],
        ].map(([title, description], index) => <article key={title} data-careers-reveal data-careers-delay={index * 70}><span className={styles.valueIndex} aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </Container>
    </Section>
    <section className={styles.invitation} aria-labelledby="invitation-title">
      <Container>
        <div className={styles.invitationHeading} data-careers-reveal>
          <div>
            <span className={styles.eyebrow}>Seu próximo passo</span>
            <h2 id="invitation-title">Faça parte dos próximos capítulos.</h2>
            <p>Conheça as vagas e encontre onde seu talento pode fazer a diferença na Coopercica.</p>
          </div>
          <span className={styles.testimonialLabel}>Quem faz parte conta</span>
        </div>
        {testimonials.length > 0 ? (
          <div className={styles.testimonialsGrid} data-careers-stack>
            {testimonials.map((item, index) => (
              <article className={styles.testimonialCard} key={item.id} data-careers-reveal data-careers-delay={Math.min(index, 3) * 70}>
                <span className={styles.quoteMark} aria-hidden="true">“</span>
                <blockquote>{item.quote}</blockquote>
                <div className={styles.testimonialPerson}>
                  <strong>{item.name}</strong>
                  <span>{[item.role, item.tenure].filter(Boolean).join(" · ")}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  </>;
}
