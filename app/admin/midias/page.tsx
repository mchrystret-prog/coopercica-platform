import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { CmsModuleWorkspace } from "@/components/admin/CmsModuleWorkspace";
import { SiteCustomization } from "@/components/admin/SiteCustomization";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  
  return <CmsModuleWorkspace listLabel="Arquivos" settingsLabel="Vídeos no site" initialTab={params.tab} settings={<SiteCustomization module="media" embedded />}><header className="admin-header"><div><span className="eyebrow">Arquivos</span><h1>Biblioteca de mídia</h1><p>Consulte imagens e documentos enviados pelos módulos do CMS.</p></div></header><MediaLibrary /></CmsModuleWorkspace>;
}
