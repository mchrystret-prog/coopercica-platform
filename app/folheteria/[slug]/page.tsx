import { cache } from "react";
import { pageMetadata, breadcrumbs } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductOfferCard } from "@/components/leaflets/ProductOfferCard";
import { ProductCarousel } from "@/components/leaflets/ProductCarousel";
import { getLeaflet, getLeafletProducts } from "@/lib/leaflets";
import { getLeafletAssets } from "@/lib/leaflet-assets";
import { groupProducts } from "@/lib/leaflet-presentation";
import styles from "./page.module.css";
const findLeaflet = cache(getLeaflet);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const leaflet = await findLeaflet((await params).slug);
  if (!leaflet) return { title: "Folheto não encontrado", robots: { index: false } };
  const metadata = pageMetadata(leaflet.name, `Consulte os produtos e condições do folheto ${leaflet.name}, com validade de ${leaflet.starts_at} a ${leaflet.ends_at}.`, `/folheteria/${leaflet.slug}`);
  const now = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (leaflet.ends_at < now || (leaflet.display_from && leaflet.display_from > now)) metadata.robots = { index: false, follow: true };
  return metadata;
}

export default async function LeafletPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const leaflet = await findLeaflet(slug);
  if (!leaflet) notFound();
  const [products, assets] = await Promise.all([
    getLeafletProducts(leaflet.id),
    getLeafletAssets().catch((error) => {
      console.error("[folheteria]", error);
      return [];
    }),
  ]);
  const groups = groupProducts(products, assets);
  return (
    <>
      <Header />
      <main className={styles.main}>
        <StructuredData value={breadcrumbs([{ name: "Home", path: "/" }, { name: "Folheteria", path: "/folheteria" }, { name: leaflet.name, path: `/folheteria/${leaflet.slug}` }])} />
        {leaflet.header_url ? (
          <div className={styles.hero}>
            <img src={leaflet.header_url} alt={leaflet.name} />
          </div>
        ) : (
          <div className={styles.fallbackHero}>
            <span>FOLHETERIA DIGITAL</span>
            <p>{leaflet.name}</p>
          </div>
        )}
        <div className="shell">
          <div className={styles.meta}>
            <h1>{leaflet.name}</h1>
            {leaflet.pdf_url ? <Link className="button" href={`/folhetos/${leaflet.id}/folhear`}>Folhear PDF</Link> : null}
            <p>
              Ofertas válidas de{" "}
              {new Date(leaflet.starts_at + "T12:00:00").toLocaleDateString(
                "pt-BR",
              )}{" "}
              a{" "}
              {new Date(leaflet.ends_at + "T12:00:00").toLocaleDateString(
                "pt-BR",
              )}
              .
            </p>
          </div>
        </div>
        {groups.map((group, index) => (
          <section
            key={group.code}
            className={group.code ? styles.box : styles.offers}
            aria-labelledby={`leaflet-group-${index}`}
            style={
              group.background
                ? {
                    backgroundImage: `url(${JSON.stringify(group.background.imageUrl)})`,
                  }
                : undefined
            }
          >
            <div className="shell">
              <ProductCarousel
                title={group.title}
                headingId={`leaflet-group-${index}`}
                hideTitle
                artworkUrl={group.background?.imageUrl}
              >
                {group.products.map(({ product, presentation }) => (
                  <ProductOfferCard
                    inBox={Boolean(group.code)}
                    product={product}
                    seals={presentation.seals}
                    key={product.id}
                  />
                ))}
              </ProductCarousel>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
