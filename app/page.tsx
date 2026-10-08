import { Partners } from "@/components/sections/Partners";
import { CoopermaisBanner } from "@/components/sections/CoopermaisBanner";
import { HomeVideos } from "@/components/sections/HomeVideos";
import { getHomeVideos } from "@/lib/home-videos-server";
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
    coopermaisBanner,
    homeVideos,
    homePartners,
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
    getSiteSetting<Record<string, string>>("coopermais_banner", {}),
    getSiteSetting<Record<string, string>>("home_videos", {}),
    getSiteSetting<Record<string, string>>("home_partners", {}),
  ]);
  const videoFeed = homeVideos.enabled === "false" ? null : await getHomeVideos(homeVideos);
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

        {visible("app-showcase") ? <AppShowcase /> : null}

        {visible("ofertas") ? (
          <Leaflets items={leaflets} content={section("ofertas")?.content} />
        ) : null}

        {visible("lojas") ? <Stores items={stores} compact content={section("lojas")?.content} /> : null}

        {visible("drogaria") ? (
          <Pharmacy content={section("drogaria")?.content} offers={pharmacyOffers} />
        ) : null}

        {visible("delivery") ? (
          <>
            <Delivery content={section("delivery")?.content} offers={deliveryOffers} />
            <CoopermaisBanner content={coopermaisBanner} />
          </>
        ) : null}

        {visible("revista") ? (
          <Magazine items={magazines} content={section("revista")?.content} />
        ) : null}

        {videoFeed ? <HomeVideos feed={videoFeed} /> : null}

        <Partners content={homePartners} />

        {visible("historia") ? <History images={historyImages} /> : null}
      </main>

      <Footer />
    </>
  );
}

export const metadata = pageMetadata("Supermercados em Jundiaí e região", "Coopercica desde 1969: conheça as lojas em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista, folhetos, Delivery, Drogaria e oportunidades.", "/");
