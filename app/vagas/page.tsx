import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CareersStory } from "@/components/careers/CareersStory";
import { getCareersContent } from "@/lib/careers-content";
import { CareersPortal } from "@/components/careers/CareersPortal";
import { getJobs } from "@/lib/jobs";
import { getSiteSetting } from "@/lib/site";
import { getCareersHeroImage } from "@/lib/careers-hero";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portal de Vagas | Coopercica",
  description:
    "Conheça a história, o propósito e os valores da Coopercica. Encontre sua oportunidade e venha fazer parte.",
};
export default async function Page() {
  const [jobs, hero] = await Promise.all([
    getJobs(),
    getSiteSetting<Record<string, unknown>>("careers_hero", {}),
  ]);
  return (
    <>
      <Header />
      <main>
        <CareersStory content={getCareersContent(hero)} image={getCareersHeroImage(hero)} />
        <CareersPortal jobs={jobs} />
      </main>
      <Footer />
    </>
  );
}
