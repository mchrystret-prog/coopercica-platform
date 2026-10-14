import { JobsAdmin } from "@/components/admin/JobsAdmin";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  
  return <CmsModuleWorkspace listLabel="Vagas" settingsLabel="Arte do portal" initialTab={params.tab} restrictSettings settings={<SiteCustomization module="careers" embedded />}><JobsAdmin /></CmsModuleWorkspace>;
}
