import { StoreAdmin } from "@/components/admin/StoreAdmin";
import { ContentManager } from "@/components/admin/ContentManager";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  
  return <CmsModuleWorkspace listLabel="Unidades" settingsLabel="Apresentação no site" initialTab={params.tab} settings={<SiteCustomization module="stores" embedded />}><ContentManager kind="store" title="Lojas" createTitle="Nova loja" description="Gerencie as unidades, dados de contato, serviços e fotos."><StoreAdmin /></ContentManager></CmsModuleWorkspace>;
}
