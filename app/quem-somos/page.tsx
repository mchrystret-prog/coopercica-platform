import { pageMetadata } from "@/lib/seo";
import { InternalPage } from "@/components/layout/InternalPage";
import { History } from "@/components/sections/History";
import { getSiteSetting } from "@/lib/site";
import { Container } from "@/components/ui/Container/Container";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { aboutHistoryItems, aboutServices } from "@/data/about";
import styles from "./About.module.css";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Nossa história e o cooperativismo", "Conheça a origem da Coopercica em 1969, o cooperativismo de consumo e nossa atuação em Jundiaí e região.", "/quem-somos");

export default async function Page() {
  const images = await getSiteSetting<Record<string, string>>("history_images", {});
  return <InternalPage eyebrow="Quem somos" title="Qualidade com você desde 1969." intro="Somos uma cooperativa de consumo que nasceu da união de pessoas e continua crescendo junto às comunidades de Jundiaí e região.">
    <Section aria-labelledby="cooperativismo-title"><Container>
      <SectionHeader id="cooperativismo-title" eyebrow="Cooperativismo de consumo" title={["Uma cooperativa", "feita por pessoas."]} stacked />
      <div className={styles.introduction}>
        <div className={styles.copy}>
          <p>A Coopercica nasceu em 14 de abril de 1969, quando 62 funcionários da antiga CICA se uniram para criar a Cooperativa de Consumo dos Empregados da CICA. O objetivo era facilitar o acesso a produtos de primeira necessidade, com qualidade e preços justos.</p>
          <p>Essa é a essência do cooperativismo de consumo: reunir pessoas que, por meio da ajuda mútua, buscam atender às necessidades dos associados. A cooperativa adquire alimentos, produtos de limpeza, artigos de uso pessoal e utilidades para abastecer o dia a dia de quem faz parte dela.</p>
        </div>
        <aside className={`${styles.participation} ${styles.copy}`} aria-labelledby="cooperado-title">
          <h3 id="cooperado-title">Aqui, o cooperado faz parte.</h3>
          <p>Ao se associar e subscrever cotas de participação, o cooperado passa a integrar a sociedade e a colaborar com os resultados da cooperativa. Sua participação também acontece nas sugestões de marcas, produtos e serviços, ajudando a construir o dia a dia da Coopercica.</p>
        </aside>
      </div>
    </Container></Section>
    <div className={styles.historyHeading}><Container><SectionHeader id="about-history-title" eyebrow="Nossa trajetória" title="Uma história de cooperação." description="Da união dos primeiros associados à presença em quatro cidades da região." stacked /></Container></div>
    <History images={images} chapters={aboutHistoryItems} showHeading={false} />
    <Section aria-labelledby="about-services-title"><Container>
      <SectionHeader id="about-services-title" eyebrow="A Coopercica hoje" title="Perto de você, de diferentes formas." stacked />
      <div className={styles.services}>{aboutServices.map(service => <Card key={service.href} variant="outline" className={styles.card}><h3>{service.title}</h3><p>{service.description}</p><Button href={service.href} variant="secondary">{service.cta}</Button></Card>)}</div>
    </Container></Section>
  </InternalPage>;
}
