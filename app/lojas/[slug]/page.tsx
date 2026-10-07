import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { InternalPage } from "@/components/layout/InternalPage";
import { getStores } from "@/lib/content";
import { pageMetadata, storeSchema, breadcrumbs } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/Button/Button";
const findStore = cache(async (slug: string) => (await getStores()).find(s => s.active && s.slug === slug));
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const store = await findStore((await params).slug);
  if (!store) return { title: "Loja não encontrada", robots: { index: false } };
  return pageMetadata(`${store.name} em ${store.city}`, `Conheça a Coopercica ${store.name}, em ${store.city}: endereço, telefone, horários e serviços da unidade.`, `/lojas/${store.slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const store = await findStore((await params).slug);
  if (!store) notFound();
  const maps = [store.mapsUrl, store.maps].find(url => /^https:\/\//.test(url));
  return <InternalPage eyebrow={`Loja ${store.storeNumber} · ${store.city}`} title={`Coopercica ${store.name}`} intro={`Conheça nossa unidade em ${store.neighborhood}, ${store.city}.`}>
    <StructuredData value={storeSchema(store)} /><StructuredData value={breadcrumbs([{ name: "Home", path: "/" }, { name: "Lojas", path: "/lojas" }, { name: store.name, path: `/lojas/${store.slug}` }])} />
    <section className="section"><div className="shell prose"><nav aria-label="Navegação da página"><Link href="/lojas">Todas as lojas</Link></nav><h2>Endereço e contato</h2><p>{store.address}<br />{store.neighborhood} · {store.city} · SP</p>{store.phone ? <p><a href={`tel:+55${store.phone.replace(/\D/g, "")}`}>{store.phone}</a></p> : null}<h2>Horário de funcionamento</h2><p>{store.hours}</p>{maps ? <Button href={maps} external>Como chegar</Button> : null}{store.services.length ? <><h2>Serviços da unidade</h2><ul>{store.services.map(service => <li key={service}>{service}</li>)}</ul></> : null}<p><Link href="/folheteria">Consulte os folhetos vigentes</Link></p></div></section>
  </InternalPage>;
}
