import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { careersDefaults } from "@/lib/careers-content";
import { InternalPage } from "@/components/layout/InternalPage";
import { History } from "@/components/sections/History";
import { getSiteSetting } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function Page() {
  const images = await getSiteSetting<Record<string, string>>(
    "history_images",
    {},
  );
  return (
    <InternalPage
      eyebrow="Quem Somos"
      title="Uma história construída por pessoas."
      intro="Cooperar é acreditar que crescer faz mais sentido quando crescemos juntos."
    >
      <History images={images} />
      <section className="section">
        <div className="shell prose">
          <h2>O que é a Coopercica?</h2>
          <p>A Coopercica é uma cooperativa de consumo fundada em 14 de abril de 1969 por 62 funcionários da antiga CICA. Atua em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista.</p>
          <h2>Qualidade com você.</h2>
          <p>
            Há mais de cinco décadas, a Coopercica cresce ao lado da comunidade,
            oferecendo produtos de qualidade, excelência no atendimento e
            relações de confiança.
          </p>
          <h2>Missão</h2><p>{careersDefaults.mission}</p>
          <h2>Visão</h2><p>{careersDefaults.vision}</p>
          <h2>Valores</h2>
          <h3>Respeito</h3><p>{careersDefaults.respect}</p>
          <h3>Ética</h3><p>{careersDefaults.ethics}</p>
          <h3>Cooperação</h3><p>{careersDefaults.cooperation}</p>
          <h2>Como conhecer as lojas e as oportunidades?</h2>
          <p>Consulte <Link href="/lojas">endereços e horários das lojas</Link>, veja os <Link href="/folheteria">folhetos vigentes</Link> ou acesse o <Link href="/vagas">portal de carreiras</Link> para se candidatar às oportunidades disponíveis.</p>
        </div>
      </section>
    </InternalPage>
  );
}

export const metadata = pageMetadata("Nossa história e propósito", "Conheça a Coopercica, cooperativa de consumo fundada em 1969, sua história, Missão, Visão e Valores.", "/quem-somos");
