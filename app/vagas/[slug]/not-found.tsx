import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { InternalPage } from "@/components/layout/InternalPage";
export default function NotFound() {
  return (
    <InternalPage
      eyebrow="Portal de Vagas"
      title="Esta oportunidade não está disponível."
      intro="A vaga pode ter sido encerrada. Confira as oportunidades abertas."
    >
      <Section>
        <Container>
          <Button href="/vagas">Ver vagas abertas</Button>
        </Container>
      </Section>
    </InternalPage>
  );
}
