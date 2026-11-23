import { pageMetadata, jobIsCurrent } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CareersMotion } from "@/components/careers/CareersMotion";
import { CareersStory } from "@/components/careers/CareersStory";
import { CareersBannerSlider } from "@/components/careers/CareersBannerSlider";
import { getCareersContent } from "@/lib/careers-content";
import { getActiveCareersBanners } from "@/lib/careers-banners";
import { CareersPortal } from "@/components/careers/CareersPortal";
import { getJobs } from "@/lib/jobs";
import { getSiteSetting } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Carreiras e vagas", "Conheça a história, o propósito e os valores da Coopercica. Encontre vagas abertas e venha fazer parte da nossa cooperativa.", "/vagas");
export default async function Page() {
  const [jobs, contentSetting] = await Promise.all([
    getJobs(),
    getSiteSetting<Record<string, unknown>>("careers_hero", {}),
  ]);
  return (
    <>
      <Header />
      <main>
        <CareersMotion>
          <CareersBannerSlider items={getActiveCareersBanners(contentSetting)} />
          <CareersStory content={getCareersContent(contentSetting)} />
          <CareersPortal jobs={jobs.filter(job => jobIsCurrent(job))} />
        </CareersMotion>
      </main>
      <Footer />
    </>
  );
}
