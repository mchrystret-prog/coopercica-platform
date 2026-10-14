import { CampaignAdmin } from "@/components/admin/CampaignAdmin";
import { ContentManager } from "@/components/admin/ContentManager";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  
  return <CmsModuleWorkspace listLabel="Campanhas" settingsLabel="Banner Coopermais" initialTab={params.tab} settings={<SiteCustomization module="campaigns" embedded />}><ContentManager kind="campaign" title="Campanhas" createTitle="Nova campanha" description="Gerencie os banners da página inicial, ordem e período de exibição."><CampaignAdmin /></ContentManager></CmsModuleWorkspace>;
}
