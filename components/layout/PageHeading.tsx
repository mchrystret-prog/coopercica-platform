import Image, { getImageProps } from "next/image";
import styles from "./PageHeading.module.css";

export type PageHeadingImage = {
  src: string;
  mobileSrc?: string;
  alt: string;
  position?: "center" | "top" | "bottom";
};

export function PageHeading({ eyebrow, title, intro, image, artwork = false }: {
  eyebrow?: string;
  title: string;
  intro: string;
  image: PageHeadingImage;
  artwork?: boolean;
}) {
  const mobile = image.mobileSrc ? getImageProps({
    src: image.mobileSrc, alt: image.alt, width: 1080, height: 810, sizes: "100vw",
  }).props : undefined;
  return <>
    <div className={`${styles.banner} ${artwork ? styles.artwork : styles.photo}`}>
      <picture>
        {mobile ? <source media="(max-width: 760px)" srcSet={mobile.srcSet} sizes={mobile.sizes} width={1080} height={810} /> : null}
        <Image src={image.src} alt={image.alt} width={2048} height={522}
          sizes="100vw" loading="eager" fetchPriority="high" className={styles.image}
          style={{ objectPosition: image.position ?? "center" }} />
      </picture>
    </div>
    <div className={`shell ${styles.intro}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h1 className="ds-title">{title}</h1>
      <p>{intro}</p>
    </div>
  </>;
}
