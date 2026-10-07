import Link from "next/link";
import { InternalPage } from "@/components/layout/InternalPage";
import { Stores } from "@/components/sections/Stores";
import { getStores } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Nossas lojas em Jundiaí e região", "Encontre endereços, telefones e horários das lojas Coopercica em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista.", "/lojas");
export default async function Page() {
  const stores = (await getStores()).filter(s => s.active);
  return <InternalPage eyebrow="Nossas Lojas" title="Tem uma Coopercica perto de você." intro="Conheça nossas unidades em Jundiaí e região."><Stores items={stores} /><section className="section"><div className="shell prose"><h2>Endereços e informações de cada unidade</h2><ul>{stores.map(store => <li key={store.slug}><Link href={`/lojas/${store.slug}`}>Coopercica {store.name} · {store.city}</Link><p>{store.address} · {store.neighborhood}</p></li>)}</ul></div></section></InternalPage>;
}
