import { pageMetadata } from "@/lib/seo";
import { InternalPage } from "@/components/layout/InternalPage";
import { getActiveLeaflets } from "@/lib/leaflets";
import { Leaflets } from "@/components/sections/Leaflets";
export const dynamic = "force-dynamic";

export default async function FolheteriaPage() {
  const items = await getActiveLeaflets();
  return <InternalPage eyebrow="Folheteria Digital" title="Ofertas vigentes, do jeito Coopercica." intro="Consulte os folhetos disponíveis e as condições de cada oferta.">
    <Leaflets items={items} showHeading={false} showAllLink={false} />
    {!items.length ? <section className="section"><div className="shell"><h2>Nenhum folheto vigente</h2><p>Novas ofertas serão publicadas aqui em breve.</p></div></section> : null}
  </InternalPage>;
}
export const metadata = pageMetadata("Folheteria e ofertas vigentes", "Consulte os folhetos vigentes da Coopercica, produtos, preços e ofertas Coopermais. Confira as condições de cada folheto.", "/folheteria");
