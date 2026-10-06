import Link from "next/link";
import { InternalPage } from "@/components/layout/InternalPage";
export default function NotFound() {
  return (
    <InternalPage
      eyebrow="Portal de Vagas"
      title="Esta oportunidade não está disponível."
      intro="A vaga pode ter sido encerrada. Confira as oportunidades abertas."
    >
      <section className="section">
        <div className="shell">
          <Link className="button" href="/vagas">
            Ver vagas abertas
          </Link>
        </div>
      </section>
    </InternalPage>
  );
}
