import Image from "next/image";
import { HomeOffers } from "@/components/offers/HomeOffers";
import { offersConfig } from "@/lib/home-offers";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Delivery.module.css";

export function Delivery({
  content = {},
  offers = {},
}: {
  content?: Record<string, string>;
  offers?: Record<string, string>;
}) {
  const config = offersConfig(offers, "delivery");
  return (
    <Section id="delivery" tone="soft" className={styles.section} tabIndex={-1}>
      <Container className={styles.layout}>
        <div className={styles.content}>
          <SectionHeader
            eyebrow={content.eyebrow || "Delivery"}
            stacked
            title={[
              content.title1 ?? "A MESMA CONFIANÇA,",
              content.title2 ?? "AGORA A UM CLIQUE DE VOCÊ.",
            ].filter(Boolean)}
            description={
              content.description ||
              "Faça suas compras pelo site ou aplicativo e receba tudo em casa com a qualidade que você já conhece."
            }
            className={styles.heading}
          />

          <ul className={styles.benefits}>
            <li>Entrega em domicílio</li>
            <li>Site e aplicativo</li>
            <li>Retirada nas lojas</li>
            <li>Qualidade Coopercica</li>
          </ul>
        </div>

        <div className={styles.visual}>
          <Image
            src={content.image || "/delivery/delivery-hero.jpg"}
            alt="Entrega Coopercica"
            fill
            className={styles.image}
            sizes="(max-width:900px) 100vw, 50vw"
          />
        </div>
        <div className={styles.actions}>
          <Button
            data-analytics-id="cta:delivery"
            data-analytics-label="Comprar no Delivery"
            href={content.ctaHref || "https://www.coopercicadelivery.com.br/"}
            external
          >
            {content.ctaLabel || "Comprar no Delivery"}
          </Button>
        </div>
      </Container>
      {config.enabled ? <Container><HomeOffers channel="delivery" title={config.title} /></Container> : null}
    </Section>
  );
}
