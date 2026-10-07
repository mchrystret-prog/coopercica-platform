import Image, { getImageProps } from "next/image";
import type { CareersHeroImage } from "@/lib/careers-hero";
import type { CareersContent } from "@/lib/careers-content";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "./CareersStory.module.css";
export function CareersStory({ content, image }: { content: CareersContent; image?: CareersHeroImage }) {
  const mobile = image?.mobileSrc ? getImageProps({ src: image.mobileSrc, alt: image.alt, width: 1080, height: 810, sizes: "100vw" }).props : undefined;
  return <>
    <section className={styles.hero} aria-labelledby="careers-title">
      <Container>
        <div className={`${styles.heroGrid} ${!image ? styles.withoutImage : ""}`}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Carreiras Coopercica</span>
            <h1 id="careers-title">{content.heroTitle}</h1>
            <p>{content.heroIntro}</p>

          </div>
          {image ? <div className={styles.media}>
            <picture>
              {mobile ? <source media="(max-width: 760px)" srcSet={mobile.srcSet} sizes={mobile.sizes} /> : null}
              <Image src={image.src} alt={image.alt} fill loading="eager" fetchPriority="high" sizes="(max-width: 760px) 100vw, (max-width: 1280px) 45vw, 560px" style={{ objectPosition: image.position }} />
            </picture>
            <span className={styles.photoCaption}>Uma história feita por pessoas.</span>
          </div> : null}
            <div className={styles.actions}>
              <Button href="#oportunidades" tone="inverse">Encontre sua oportunidade</Button>
              <a className={styles.textLink} href="#nossa-cultura">Conheça o que nos move <span aria-hidden="true">↓</span></a>
            </div>
        </div>
        <div className={styles.heroFoot}><span>Qualidade com você desde 1969</span><span>Cooperar é fazer parte.</span></div>
      </Container>
    </section>
    <Section id="nossa-cultura" className={styles.manifesto} aria-labelledby="manifesto-title">
      <Container>
        <div className={styles.editorialGrid}>
          <div><span className="eyebrow">Nossa essência</span><h2 id="manifesto-title" className={styles.title}>{content.manifestoTitle}</h2><span className={styles.year}>1969 <span>O começo de uma história coletiva.</span></span></div>
          <div className={styles.manifestoCopy}>{content.manifesto.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<Button href="/quem-somos" variant="secondary">Conheça nossa história</Button></div>
        </div>
      </Container>
    </Section>
    <Section tone="soft" aria-labelledby="purpose-title">
      <Container>
        <span className="eyebrow">Nosso propósito</span>
        <h2 id="purpose-title" className={styles.title}>O trabalho ganha sentido<br />quando a gente coopera.</h2>
        <div className={styles.purposeGrid}>
          <article><span className={styles.number} aria-hidden="true">01</span><h3>Missão</h3><p>{content.mission}</p></article>
          <article><span className={styles.number} aria-hidden="true">02</span><h3>Visão</h3><p>{content.vision}</p></article>
        </div>
      </Container>
    </Section>
    <Section aria-labelledby="values-title">
      <Container>
        <div className={styles.valuesHeading}><div><span className="eyebrow">Nossos valores</span><h2 id="values-title" className={styles.title}>É assim que seguimos juntos.</h2></div><p>Princípios que orientam a nossa relação com quem trabalha, compra e coopera com a gente.</p></div>
        <div className={styles.valuesGrid}>{[
          ["Respeito", content.respect], ["Ética", content.ethics], ["Cooperação", content.cooperation],
        ].map(([title, description], index) => <article key={title}><span className={styles.valueIndex} aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </Container>
    </Section>
    <section className={styles.invitation} aria-labelledby="invitation-title"><Container><div className={styles.invitationGrid}><div><span className={styles.eyebrow}>Seu próximo passo</span><h2 id="invitation-title">Faça parte dos próximos capítulos.</h2><p>Conheça as vagas e encontre onde seu talento pode fazer a diferença na Coopercica.</p></div><Button href="#oportunidades" tone="inverse">Quero fazer parte</Button></div></Container></section>
  </>;
}
