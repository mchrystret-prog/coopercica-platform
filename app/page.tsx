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

export default async function Home() {
  const [campaigns, stores, magazines, leaflets] = await Promise.all([
    getCampaigns(),
    getStores(),
    getMagazines(),
    getActiveLeaflets(),
  ]);

  return (
    <>
      <OnePageNavigation />
      <Header />

      <main>
        <Hero items={campaigns} />

        <AppShowcase />

        <Leaflets items={leaflets} />

        <Stores items={stores} />

        <Pharmacy />

        <Delivery />

        <Magazine items={magazines} />

        <History />
      </main>

      <Footer />
    </>
  );
}