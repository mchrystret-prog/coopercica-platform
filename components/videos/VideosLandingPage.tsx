import Image, { getImageProps } from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSetting } from "@/lib/site";
import { getVideosHeader } from "@/lib/videos-header";
import styles from "./VideosLandingPage.module.css";
export async function VideosLandingPage({ title, intro, children }: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  const hero = getVideosHeader(await getSiteSetting("videos_header", {}));
  const mobile = hero.mobileImage ? getImageProps({ src: hero.mobileImage, alt: hero.alt,
    width: 1080, height: 810, sizes: "100vw" }).props : undefined;
  return <>
    <Header />
    <main>
      <div className={styles.banner}>
        <picture>
          {mobile ? <source media="(max-width: 760px)" srcSet={mobile.srcSet} sizes={mobile.sizes} width={1080} height={810} /> : null}
          <Image src={hero.image} alt={hero.alt} width={2048} height={522}
            sizes="100vw" loading="eager" fetchPriority="high" className={styles.image} />
        </picture>
      </div>
      <div className={`shell ${styles.intro}`}>
        <h1 className="ds-title">{title}</h1>
        <p>{intro}</p>
      </div>
      {children}
    </main>
    <Footer />
  </>;
}
