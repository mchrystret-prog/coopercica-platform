import { InternalPage } from "@/components/layout/InternalPage";
import { Stores } from "@/components/sections/Stores";
import { getStores } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Nossas lojas em Jundiaí e região", "Encontre endereços, telefones e horários das lojas Coopercica em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista.", "/lojas");
export default async function Page() {
  const stores = (await getStores()).filter(s => s.active);
  return <InternalPage eyebrow="Nossas Lojas" title="Tem uma Coopercica perto de você." intro="Conheça nossas unidades em Jundiaí e região."><Stores items={stores} /></InternalPage>;
}
