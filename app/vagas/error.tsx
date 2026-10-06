"use client";
import { InternalPage } from "@/components/layout/InternalPage";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import styles from "@/components/careers/Careers.module.css";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <InternalPage
      eyebrow="Portal de Vagas"
      title="Não foi possível carregar as oportunidades."
      intro="Tente novamente em instantes."
    >
      <Section>
        <Container className={styles.actions}>
          <Button onClick={reset}>Tentar novamente</Button>
          <Button href="/" variant="secondary">
            Voltar ao início
          </Button>
        </Container>
      </Section>
    </InternalPage>
  );
}
