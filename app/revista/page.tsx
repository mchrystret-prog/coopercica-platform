import { pageMetadata } from "@/lib/seo";
import { InternalPage } from "@/components/layout/InternalPage";
import { PublicationGrid } from "@/components/publications/PublicationGrid";
import { getPublications } from "@/lib/publications";
export const dynamic = "force-dynamic";
export default async function Page() { return <InternalPage eyebrow="Revista" title="Histórias, receitas e inspiração." intro="Folheie as edições da Revista Coopercica."><section className="publication-section shell"><PublicationGrid items={await getPublications("revista")} /></section></InternalPage>; }

export const metadata = pageMetadata("Revista Coopercica", "Folheie as edições da Revista Coopercica com histórias, receitas e inspiração para o dia a dia.", "/revista");
