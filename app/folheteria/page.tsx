import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";import { Footer } from "@/components/layout/Footer";import { getActiveLeaflets } from "@/lib/leaflets";import { Leaflets } from "@/components/sections/Leaflets";
export default async function FolheteriaPage(){const items=await getActiveLeaflets();return <><Header/><main><div className="shell" style={{ paddingTop: "48px" }}><h1 className="ds-subtitle">Folheteria Coopercica</h1><p>Consulte os folhetos vigentes e as condições de cada oferta.</p></div><div><Leaflets items={items}/>{!items.length?<section className="section"><div className="shell"><h2>Nenhum folheto vigente</h2><p>Novas ofertas serão publicadas aqui em breve.</p></div></section>:null}</div></main><Footer/></>}
export const metadata = pageMetadata("Folheteria e ofertas vigentes", "Consulte os folhetos vigentes da Coopercica, produtos, preços e ofertas Coopermais. Confira as condições de cada folheto.", "/folheteria");
