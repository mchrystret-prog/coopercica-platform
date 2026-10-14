import { MagazineAdmin } from "@/components/admin/MagazineAdmin";
import { ContentManager } from "@/components/admin/ContentManager";
import { getMagazines } from "@/lib/content";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const magazines = await getMagazines();
  return <CmsModuleWorkspace listLabel="Edições" settingsLabel="Apresentação e destaques" initialTab={params.tab} settings={<SiteCustomization module="magazines" embedded magazines={magazines} />}><ContentManager kind="magazine" title="Revistas" createTitle="Nova edição" description="Gerencie as edições, capas e PDFs publicados no site."><MagazineAdmin /></ContentManager></CmsModuleWorkspace>;
}
