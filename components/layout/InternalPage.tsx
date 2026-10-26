import { Header } from "./Header";
import { Footer } from "./Footer";
import { PageHeading, type PageHeadingImage } from "./PageHeading";

export function InternalPage({ eyebrow, title, intro, children, heroImage }: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  heroImage?: PageHeadingImage;
}) {
  return <>
    <Header />
    <main>
      <PageHeading eyebrow={eyebrow} title={title} intro={intro}
        image={heroImage ?? { src: "/stores/eloy-chaves.jpg", alt: "Fachada da Coopercica no Eloy Chaves" }} />
      {children}
    </main>
    <Footer />
  </>;
}
