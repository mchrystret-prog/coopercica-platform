import Image from "next/image";
import { HomeOffers } from "@/components/offers/HomeOffers";
import { offersConfig } from "@/lib/home-offers";
import { pharmacy } from "@/data/pharmacy";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Pharmacy.module.css";

export function Pharmacy({
  content = {},
  offers = {},
}: {
  content?: Record<string, string>;
  offers?: Record<string, string>;
}) {
  const config = offersConfig(offers, "pharmacy");
  return (
    <Section
      id="drogaria"
      className={styles.section}
      aria-labelledby="pharmacy-title"
      tabIndex={-1}
    >
      <Container className={styles.shell}>
        <div className={styles.content}>
          <SectionHeader
            id="pharmacy-title"
            eyebrow={content.eyebrow || pharmacy.eyebrow}
            title={[
              content.title1 ?? "Muito além",
              content.title2 ?? "dos medicamentos.",
            ].filter(Boolean)}
            description={content.description || pharmacy.description}
            stacked
          />
          <ul
            className={styles.highlights}
            aria-label="Destaques da Coopercica Drogaria"
          >
            {pharmacy.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.visual}>
          <Image
            src={content.image || pharmacy.image}
            alt={pharmacy.imageAlt}
            fill
            sizes="(max-width: 1100px) 100vw, 42vw"
            className={styles.image}
          />
        </div>
        <div className={styles.actions}>
          <Button
            data-analytics-id="cta:pharmacy"
            data-analytics-label="Conhecer a Drogaria"
            href={content.ctaHref || pharmacy.ctaHref}
          >
            {content.ctaLabel || pharmacy.ctaLabel}
          </Button>
        </div>
      </Container>
      {config.enabled || config.preview ? <Container><HomeOffers key={config.enabled ? "api" : "preview"} channel="pharmacy" title={config.title} preview={!config.enabled && config.preview} /></Container> : null}
    </Section>
  );
}
