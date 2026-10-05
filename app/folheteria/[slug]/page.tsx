export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductOfferCard } from "@/components/leaflets/ProductOfferCard";
import { ProductCarousel } from "@/components/leaflets/ProductCarousel";
import { getLeaflet, getLeafletProducts } from "@/lib/leaflets";
import { getLeafletAssets } from "@/lib/leaflet-assets";
import { groupProducts } from "@/lib/leaflet-presentation";
import styles from "./page.module.css";

export default async function LeafletPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const leaflet = await getLeaflet(slug);
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
        {leaflet.header_url ? (
          <div className={styles.hero}>
            <img src={leaflet.header_url} alt={leaflet.name} />
          </div>
        ) : (
          <div className={styles.fallbackHero}>
            <span>FOLHETERIA DIGITAL</span>
            <h1>{leaflet.name}</h1>
          </div>
        )}
        <div className="shell">
          <div className={styles.meta}>
            <h1>{leaflet.name}</h1>
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
            aria-labelledby={group.code ? `leaflet-box-${index}` : undefined}
            style={
              group.background
                ? {
                    backgroundImage: `url(${JSON.stringify(group.background.imageUrl)})`,
                  }
                : undefined
            }
          >
            <div className="shell">
              {group.code ? (
                <ProductCarousel
                  title={group.title}
                  headingId={`leaflet-box-${index}`}
                  artworkUrl={group.background?.imageUrl}
                >
                  {group.products.map(({ product, presentation }) => (
                    <ProductOfferCard
                      inBox
                      product={product}
                      seals={presentation.seals}
                      key={product.id}
                    />
                  ))}
                </ProductCarousel>
              ) : (
                <div className={styles.grid}>
                  {group.products.map(({ product, presentation }) => (
                    <ProductOfferCard
                      product={product}
                      seals={presentation.seals}
                      key={product.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
