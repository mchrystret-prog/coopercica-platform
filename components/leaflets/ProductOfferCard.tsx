import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { LeafletProduct } from "@/lib/leaflets";
import type { LeafletAsset } from "@/lib/leaflet-presentation";
import styles from "./ProductOfferCard.module.css";

const money = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function ProductOfferCard({
  product,
  seals = [],
  inBox = false,
}: {
  product: LeafletProduct;
  seals?: LeafletAsset[];
  inBox?: boolean;
}) {
  const ageSeal = seals.find((seal) => seal.code === "+18");
  const warningSeals = seals.filter((seal) => seal.code !== "+18");
  const hasCooper = (product.coopermais_price ?? 0) > 0;
  const hasOffer = (product.offer_all_price ?? 0) > 0;
  const featured = hasCooper
    ? product.coopermais_price!
    : hasOffer
      ? product.offer_all_price!
      : product.regular_price;
  return (
    <Card className={`${styles.card} ${inBox ? styles.boxCard : ""}`}>
      <div className={styles.brand}>
        <Image
          src="/images/logo.png"
          alt="Coopercica"
          width={150}
          height={26}
        />
      </div>
      <div
        className={`${styles.visual} ${ageSeal ? styles.visualWithAgeSeal : ""}`}
      >
        {product.image_url ? (
          <img
            className={styles.productImage}
            src={product.image_url}
            alt={product.description}
          />
        ) : (
          <div className={styles.noImage}>Imagem em breve</div>
        )}
        {ageSeal ? (
          <Image
            unoptimized
            width={48}
            height={48}
            className={styles.ageSeal}
            src={ageSeal.imageUrl}
            alt={ageSeal.alt}
          />
        ) : null}
        {product.super_offer ? (
          <Badge variant="red" className={styles.badge}>
            Super Oferta
          </Badge>
        ) : null}
        {product.buy_3_pay_2 ? (
          <Badge variant="red" className={styles.badge}>
            Leve 3 Pague 2
          </Badge>
        ) : null}
      </div>
      <div className={styles.copy}>
        <strong>{product.description}</strong>
        {product.complement ? <span>{product.complement}</span> : null}
      </div>
      <div
        className={`${styles.priceBox} ${hasCooper ? styles.cooperPriceBox : !hasOffer ? styles.singlePriceBox : ""}`}
      >
        {hasCooper ? (
          <Image
            className={styles.cooperSeal}
            src="/images/coopermais-selo.svg"
            alt="Preço exclusivo para cliente Coopermais"
            width={978}
            height={519}
          />
        ) : null}
        {hasOffer && !hasCooper ? (
          <>
            <div className={styles.regular}>
              <small>PREÇO REGULAR</small>
              <b>R$ {money(product.regular_price)}</b>
            </div>
            <span className={styles.divider} />
          </>
        ) : null}
        <div className={styles.featured}>
          {!hasCooper ? <small>{hasOffer ? "OFERTA" : "PREÇO"}</small> : null}
          <div>
            <sup>R$</sup>
            <b>{money(featured)}</b>
            {product.unit ? <em>/{product.unit}</em> : null}
          </div>
        </div>
        {hasCooper ? (
          <div className={styles.cooperRegular}>
            <small>PREÇO REGULAR</small>
            <b>R$ {money(product.regular_price)}</b>
          </div>
        ) : null}
      </div>
      {product.promo_pack ? (
        <div className={styles.warnings}>
          <span>{product.promo_pack}</span>
        </div>
      ) : null}
      {warningSeals.length ? (
        <div className={styles.seals}>
          {warningSeals.map((seal) => (
            <Image
              unoptimized
              width={800}
              height={200}
              className={styles.warningSeal}
              src={seal.imageUrl}
              alt={seal.alt}
              key={seal.code}
            />
          ))}
        </div>
      ) : null}
      {product.breastfeeding_warning &&
      !seals.some((seal) => seal.code === "aleitamento") ? (
        <div className={styles.warningFallback}>
          O Ministério da Saúde informa: o aleitamento materno evita infecções e
          alergias e é recomendado até os 2 anos de idade ou mais.
        </div>
      ) : null}
      {product.age_18 ? (
        <div className={styles.warnings}>
          <span>Venda proibida para menores de 18 anos.</span>
        </div>
      ) : null}
    </Card>
  );
}
