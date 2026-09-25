export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OnePageNavigation } from "@/components/layout/OnePageNavigation";

import { Hero } from "@/components/sections/Hero";
import { History } from "@/components/sections/History";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { Pharmacy } from "@/components/sections/Pharmacy";
import { Delivery } from "@/components/sections/Delivery";
import { Stores } from "@/components/sections/Stores";
import { Magazine } from "@/components/sections/Magazine";
import { Leaflets } from "@/components/sections/Leaflets";

import {
  getCampaigns,
  getMagazines,
  getStores,
} from "@/lib/content";
import { getActiveLeaflets } from "@/lib/leaflets";
import { getSiteIdentity,getSiteSections } from "@/lib/site";

export default async function Home() {
  const [campaigns, stores, magazines, leaflets,identity,sections] = await Promise.all([
    getCampaigns(),
    getStores(),
    getMagazines(),
    getActiveLeaflets(),
    getSiteIdentity(),
    getSiteSections(),
  ]);
  const section=(id:string)=>sections.find(s=>s.id===id);
  const visible=(id:string)=>section(id)?.active!==false;

  return (
    <>
      <OnePageNavigation />
      <Header logo={identity.logo} siteName={identity.siteName} deliveryUrl={identity.deliveryUrl} hasOffers={leaflets.length>0} />

      <main>
        <Hero items={campaigns} />

        {visible("app-showcase")?<AppShowcase />:null}

        {visible("ofertas")?<Leaflets items={leaflets} content={section("ofertas")?.content}/>:null}

        {visible("lojas")?<Stores items={stores} />:null}

        {visible("drogaria")?<Pharmacy content={section("drogaria")?.content}/>:null}

        {visible("delivery")?<Delivery content={section("delivery")?.content}/>:null}

        {visible("revista")?<Magazine items={magazines} content={section("revista")?.content}/>:null}

        {visible("historia")?<History />:null}
      </main>

      <Footer />
    </>
  );
}