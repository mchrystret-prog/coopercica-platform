"use client";
import { previewOffers } from "@/lib/home-offers-preview";
import { useEffect, useRef, useState } from "react";
import { productPresentation, type LeafletAsset } from "@/lib/leaflet-presentation";
import type { LeafletProduct } from "@/lib/leaflets";
import type { OffersChannel } from "@/lib/home-offers";
import { ProductCarousel } from "@/components/leaflets/ProductCarousel";
import { ProductOfferCard } from "@/components/leaflets/ProductOfferCard";
import styles from "./HomeOffers.module.css";
export function HomeOffers({ channel, title, preview = false }: { channel: OffersChannel; title: string; preview?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ status: string; products: LeafletProduct[]; seals?: LeafletAsset[] }>(() => preview ? { status: "ready", products: previewOffers(channel) } : { status: "loading", products: [] });
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      void fetch(`/api/home-offers?channel=${channel}`, { signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(setState)
        .catch(() => { if (!controller.signal.aborted) setState({ status: "error", products: [] }); });
    };
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { load(); observer.disconnect(); } }, { rootMargin: "300px" });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); controller.abort(); };
  }, [channel, preview]);
  return <div ref={root} className={styles.offers}>
    {preview ? <p className={styles.previewNote}><strong>Preview do projeto</strong> Produtos e preços ilustrativos para demonstrar o carrossel. Não são ofertas vigentes.</p> : null}
    {state.status === "ready" && state.products.length ? <>
      <ProductCarousel title={title} headingId={`${channel}-offers-title`}>
        {state.products.map(product => product.delivery_url ? <a className={styles.productLink} href={product.delivery_url} target="_blank" rel="noopener noreferrer" key={product.id} aria-label={`Ver ${product.description} ${channel === "delivery" ? "no Delivery" : "na Drogaria"}`} data-analytics-id={`offer:${channel}:${product.ean || product.id}`} data-analytics-label={product.description}><ProductOfferCard product={product} seals={productPresentation(product, state.seals || []).seals} /></a> : <ProductOfferCard key={product.id} product={product} seals={productPresentation(product, state.seals || []).seals} />)}
      </ProductCarousel>
      {!preview ? <p className={styles.note}>Preços e disponibilidade sujeitos à confirmação no {channel === "delivery" ? "Delivery" : "site da Drogaria"}.</p> : null}
    </> : state.status === "disabled" ? null : <p className={styles.status} role="status">{state.status === "loading" ? "Carregando ofertas…" : state.status === "error" ? "Não foi possível carregar as ofertas agora. Consulte o site para conferir." : "Nenhuma oferta disponível no momento."}</p>}
  </div>;
}
