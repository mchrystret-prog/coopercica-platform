import Image from "next/image";
import type { LeafletProduct } from "@/lib/leaflets";
import styles from "./ProductOfferCard.module.css";

const money = (value: number) => value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ProductOfferCard({ product }: { product: LeafletProduct }) {
  const hasCooper = (product.coopermais_price ?? 0) > 0;
  const hasOffer = (product.offer_all_price ?? 0) > 0;
  const featured = hasCooper ? product.coopermais_price! : hasOffer ? product.offer_all_price! : product.regular_price;
  return <article className={styles.card}>
    <div className={styles.brand}><Image src="/images/logo.png" alt="Coopercica" width={150} height={26} /></div>
    <div className={styles.visual}>
      {product.image_url ? <img src={product.image_url} alt={product.description} /> : <div className={styles.noImage}>Imagem em breve</div>}
      {product.super_offer ? <span className={styles.badge}>Super Oferta</span> : null}
      {product.buy_3_pay_2 ? <span className={styles.badge}>Leve 3 Pague 2</span> : null}
    </div>
    <div className={styles.copy}><strong>{product.description}</strong>{product.complement ? <span>{product.complement}</span> : null}</div>
    <div className={`${styles.priceBox} ${hasCooper ? styles.cooperPriceBox : !hasOffer ? styles.singlePriceBox : ""}`}>
      {hasCooper ? <Image className={styles.cooperSeal} src="/images/coopermais-selo.svg" alt="Preço exclusivo para cliente Coopermais" width={978} height={519} /> : null}
      {hasOffer && !hasCooper ? <><div className={styles.regular}><small>PREÇO REGULAR</small><b>R$ {money(product.regular_price)}</b></div><span className={styles.divider} /></> : null}
      <div className={styles.featured}>
        {!hasCooper ? <small>{hasOffer ? "OFERTA" : "PREÇO"}</small> : null}
        <div><sup>R$</sup><b>{money(featured)}</b>{product.unit ? <em>/{product.unit}</em> : null}</div>
      </div>
      {hasCooper ? <div className={styles.cooperRegular}><small>PREÇO REGULAR</small><b>R$ {money(product.regular_price)}</b></div> : null}
    </div>
    {product.promo_pack ? <div className={styles.warnings}><span>{product.promo_pack}</span></div> : null}
    {product.age_18 ? <div className={styles.warnings}><span>Venda proibida para menores de 18 anos.</span></div> : null}
  </article>;
}
