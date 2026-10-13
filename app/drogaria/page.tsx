import { getSiteSections, getSiteSetting } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { InternalPage } from "@/components/layout/InternalPage";
import { Pharmacy } from "@/components/sections/Pharmacy";
export default async function Page() {
    const [sections, offers] = await Promise.all([getSiteSections(), getSiteSetting<Record<string, string>>("offers_pharmacy", {})]);
    const section = sections.find(item => item.id === "drogaria");
    return <InternalPage eyebrow="Drogaria" title="Cuidado próximo, todos os dias." intro="Saúde, bem-estar e atendimento para toda a família.">{section?.active !== false ? <Pharmacy showHeading={false} content={{ ...section?.content, ...(!section?.content?.ctaHref || section.content.ctaHref === "/drogaria" ? { ctaHref: "/lojas", ctaLabel: "Consultar nossas lojas" } : {}) }} offers={offers}/> : null}</InternalPage>;
}
export const metadata = pageMetadata("Drogaria Coopercica", "Conheça a Coopercica Drogaria: medicamentos, dermocosméticos, saúde, bem-estar e atendimento farmacêutico.", "/drogaria");
