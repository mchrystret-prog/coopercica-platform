import { getSiteSections, getSiteSetting } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { InternalPage } from "@/components/layout/InternalPage";
import { Delivery } from "@/components/sections/Delivery";
export default async function Page() {
    const [sections, offers] = await Promise.all([getSiteSections(), getSiteSetting<Record<string, string>>("offers_delivery", {})]);
    const section = sections.find(item => item.id === "delivery");
    return <InternalPage eyebrow="Delivery" title="Sua Coopercica em poucos cliques." intro="Escolha seus produtos e receba suas compras com praticidade.">{section?.active !== false ? <Delivery content={section?.content} offers={offers}/> : null}<section className="section"><div className="shell prose"><h2>Site e aplicativo</h2><p>Uma experiência simples para comprar supermercado, hortifruti, padaria, açougue e muito mais.</p></div></section></InternalPage>;
}
export const metadata = pageMetadata("Delivery de supermercado", "Compre supermercado, hortifruti, padaria e açougue pelo Delivery Coopercica. Acesse o site de compras e conheça o serviço.", "/delivery");
