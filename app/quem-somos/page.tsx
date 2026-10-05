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
          <h2>Qualidade com você.</h2>
          <p>
            Há mais de cinco décadas, a Coopercica cresce ao lado da comunidade,
            oferecendo produtos de qualidade, excelência no atendimento e
            relações de confiança.
          </p>
        </div>
      </section>
    </InternalPage>
  );
}
