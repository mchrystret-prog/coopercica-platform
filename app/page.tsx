import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Hero } from "@/components/sections/Hero";
import { History } from "@/components/sections/History";
import { AppShowcase } from "@/components/sections/AppShowcase";
import { Pharmacy } from "@/components/sections/Pharmacy";
import { Delivery } from "@/components/sections/Delivery";
import { Stores } from "@/components/sections/Stores";
import { Magazine } from "@/components/sections/Magazine";

import {
  getCampaigns,
  getMagazines,
  getStores,
} from "@/lib/content";

export default async function Home() {
  const [campaigns, stores, magazines] = await Promise.all([
    getCampaigns(),
    getStores(),
    getMagazines(),
  ]);

  return (
    <>
      <Header />

      <main>
        <Hero items={campaigns} />

        <History />

        <AppShowcase />

        <Pharmacy />

        <Delivery />

        <Stores items={stores} />

        <Magazine items={magazines} />
      </main>

      <Footer />
    </>
  );
}
