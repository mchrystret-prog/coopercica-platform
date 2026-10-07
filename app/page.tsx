import { CoopermaisBanner } from "@/components/sections/CoopermaisBanner";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
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

import { getCampaigns, getMagazines, getStores } from "@/lib/content";
import { getActiveLeaflets } from "@/lib/leaflets";
import { getSiteIdentity, getSiteSections, getSiteSetting } from "@/lib/site";

export default async function Home() {
  const [
    campaigns,
    stores,
    magazines,
    leaflets,
    identity,
    sections,
    historyImages,
    deliveryOffers,
    pharmacyOffers,
  ] = await Promise.all([
    getCampaigns(),
    getStores(),
    getMagazines(),
    getActiveLeaflets(),
    getSiteIdentity(),
    getSiteSections(),
    getSiteSetting<Record<string, string>>("history_images", {}),
    getSiteSetting<Record<string, string>>("offers_delivery", {}),
    getSiteSetting<Record<string, string>>("offers_pharmacy", {}),
  ]);
  const section = (id: string) => sections.find((s) => s.id === id);
  const visible = (id: string) => section(id)?.active !== false;

  return (
    <>
      <OnePageNavigation />
      <Header
        logo={identity.logo}
        siteName={identity.siteName}
        deliveryUrl={identity.deliveryUrl}
        hasOffers={leaflets.length > 0}
      />

      <main>
        <Hero items={campaigns} />
        <section className="shell" style={{ paddingBlock: "32px" }} aria-labelledby="brand-title">
          <h1 id="brand-title" className="ds-subtitle">Coopercica: qualidade com você desde 1969.</h1>
          <p>Uma cooperativa de consumo presente em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista. <Link href="/quem-somos">Conheça nossa história.</Link></p>
        </section>

        {visible("app-showcase") ? <AppShowcase /> : null}

        {visible("ofertas") ? (
          <Leaflets items={leaflets} content={section("ofertas")?.content} />
        ) : null}

        {visible("lojas") ? <Stores items={stores} /> : null}

        {visible("drogaria") ? (
          <Pharmacy content={section("drogaria")?.content} offers={pharmacyOffers} />
        ) : null}

        {visible("delivery") ? (
          <>
            <Delivery content={section("delivery")?.content} offers={deliveryOffers} />
            <CoopermaisBanner />
          </>
        ) : null}

        {visible("revista") ? (
          <Magazine items={magazines} content={section("revista")?.content} />
        ) : null}

        {visible("historia") ? <History images={historyImages} /> : null}
      </main>

      <Footer />
    </>
  );
}

export const metadata = pageMetadata("Supermercados em Jundiaí e região", "Coopercica desde 1969: conheça as lojas em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista, folhetos, Delivery, Drogaria e oportunidades.", "/");
