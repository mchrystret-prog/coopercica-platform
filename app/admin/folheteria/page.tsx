import { LeafletWorkspace } from "@/components/admin/LeafletWorkspace";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  
  return <CmsModuleWorkspace listLabel="Folheteria" settingsLabel="Apresentação no site" initialTab={params.tab} settings={<SiteCustomization module="leaflets" embedded />}><LeafletWorkspace /></CmsModuleWorkspace>;
}
