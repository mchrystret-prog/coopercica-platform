import { uploadRules } from "@/lib/cms-upload-rules";
import styles from "./BannerSafeAreaHelp.module.css";

export function BannerSafeAreaHelp({ variant }: { variant: "desktop" | "mobile" }) {
  const mobile = variant === "mobile";
  const dimensions = uploadRules[mobile ? "campaignMobile" : "campaignDesktop"].dimensions;
  if (!dimensions) return null;
  const [width, height] = dimensions;
  const side = mobile ? 240 : 360;
  const bottom = mobile ? 300 : 180;
  const top = mobile ? 80 : 100;
  const model = `/guides/banner-${variant}-respiro.svg`;
  return (
    <details className={styles.help}>
      <summary aria-label={`Mostrar áreas de respiro do banner ${variant}`} title="Áreas de respiro">
        <span aria-hidden="true" className={styles.question}>?</span>
        <span>Áreas de respiro</span>
      </summary>
      <div className={styles.panel}>
        <strong>Modelo {variant} · {width} × {height} px</strong>
        <p>Coloque textos, logos, preços e chamadas dentro da área verde. Nas faixas vermelhas, use apenas fundo ou elementos que possam ficar sob os controles.</p>
        {/* Native image preserves the model's exact proportions and supports SVG download. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.model} src={model} width={width} height={height} alt={`Guia ${variant}: área central verde, laterais e faixa inferior vermelhas reservadas para setas e player.`} />
        <ul>
          <li>Laterais: {side} px de cada lado, para respiro das setas{mobile ? "." : " e recorte em telas menores."}</li>
          <li>Topo: {top} px de respiro.</li>
          <li>Base: {bottom} px para indicadores e play/pause.</li>
        </ul>
        <p className={styles.note}>Margens recomendadas na arte original, considerando telas a partir de 320 px no mobile e 768 px no desktop. A posição dos controles varia com a tela. Remova o guia antes de exportar o banner.</p>
        <a className={styles.download} href={model} download>Baixar modelo SVG · {width} × {height} px</a>
      </div>
    </details>
  );
}
