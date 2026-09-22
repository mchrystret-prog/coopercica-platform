import Image from "next/image";
import type { LeafletProduct } from "@/lib/leaflets";
import styles from "./ProductOfferCard.module.css";
const money=(value:number)=>value.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
export function ProductOfferCard({product}:{product:LeafletProduct}){
  const featured=product.coopermais_price??product.regular_price;
  return <article className={styles.card}>
    <div className={styles.brand}><Image src="/images/logo.png" alt="Coopercica" width={150} height={26}/></div>
    <div className={styles.visual}>{product.image_url?<img src={product.image_url} alt={product.description}/>:<div className={styles.noImage}>Imagem em breve</div>}{product.super_offer?<span className={styles.badge}>Super Oferta</span>:null}</div>
    <div className={styles.copy}><strong>{product.description}</strong>{product.complement?<span>{product.complement}</span>:null}</div>
    <div className={styles.priceBox}>
      {product.coopermais_price!==null?<div className={styles.regular}><small>PREÇO REGULAR</small><b>{money(product.regular_price)}</b></div>:null}
      {product.coopermais_price!==null?<span className={styles.divider}/>:null}
      <div className={styles.featured}><small>{product.coopermais_price!==null?"COOPERMAIS":"OFERTA"}</small><div><sup>R$</sup><b>{money(featured)}</b>{product.unit?<em>/{product.unit}</em>:null}</div></div>
    </div>
    {(product.age_18||product.breastfeeding_warning)?<div className={styles.warnings}>{product.age_18?<span>Venda proibida para menores de 18 anos.</span>:null}{product.breastfeeding_warning?<span>Consulte as orientações de aleitamento aplicáveis.</span>:null}</div>:null}
  </article>
}
