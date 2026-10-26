import Image from "next/image";
import { getImageProps } from "next/image";
import { Header } from "./Header";
import { Footer } from "./Footer";
import type { CareersHeroImage } from "@/lib/careers-hero";
import styles from "./InternalPage.module.css";
export function InternalPage({
  eyebrow,
  title,
  intro,
  children,
  heroImage,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  heroImage?: CareersHeroImage;
}) {
  const mobile = heroImage?.mobileSrc
    ? getImageProps({
        src: heroImage.mobileSrc,
        alt: heroImage.alt,
        width: 1080,
        height: 810,
        sizes: "100vw",
      }).props
    : undefined;
  return (
    <>
      <Header />
      <main>
        <section className="internal-hero">
          <div className={`shell ${heroImage ? styles.heroGrid : ""}`}>
            <div className={heroImage ? styles.copy : undefined}>
              <span className="eyebrow light">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{intro}</p>
            </div>
            {heroImage ? (
              <div className={styles.media}>
                <picture>
                  {mobile ? (
                    <source
                      media="(max-width: 760px)"
                      srcSet={mobile.srcSet}
                      sizes={mobile.sizes}
                    />
                  ) : null}
                  <Image
                    src={heroImage.src}
                    alt={heroImage.alt}
                    fill
                    loading="eager"
                    fetchPriority="high"
                    sizes="(max-width: 760px) 100vw, (max-width: 1280px) 45vw, 560px"
                    style={{ objectPosition: heroImage.position }}
                  />
                </picture>
              </div>
            ) : null}
          </div>
        </section>
        {children}
      </main>
      <Footer />
    </>
  );
}
