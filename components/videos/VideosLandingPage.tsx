import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSetting } from "@/lib/site";
import { getVideosHeader } from "@/lib/videos-header";
import { PageHeading } from "@/components/layout/PageHeading";
export async function VideosLandingPage({ title, intro, children }: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const hero = getVideosHeader(await getSiteSetting("videos_header", {}));
  return <>
    <Header />
    <main>
      <PageHeading title={title} intro={intro} artwork
        image={{ src: hero.image, mobileSrc: hero.mobileImage, alt: hero.alt }} />
      {children}
    </main>
    <Footer />
  </>;
}
