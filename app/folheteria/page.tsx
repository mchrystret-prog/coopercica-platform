import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";

import { InternalPage } from "@/components/layout/InternalPage";import { getActiveLeaflets } from "@/lib/leaflets";import { Leaflets } from "@/components/sections/Leaflets";
export default async function FolheteriaPage(){const items=await getActiveLeaflets();return <InternalPage eyebrow="Ofertas" title="Folheteria Coopercica" intro="Consulte os folhetos vigentes e as condições de cada oferta."><div><Leaflets items={items}/>{!items.length?<section className="section"><div className="shell"><h2>Nenhum folheto vigente</h2><p>Novas ofertas serão publicadas aqui em breve.</p></div></section>:null}</div></InternalPage>}
export const metadata = pageMetadata("Folheteria e ofertas vigentes", "Consulte os folhetos vigentes da Coopercica, produtos, preços e ofertas Coopermais. Confira as condições de cada folheto.", "/folheteria");
