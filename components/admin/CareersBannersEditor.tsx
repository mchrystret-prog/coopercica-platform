"use client";
import { CmsFileInput } from "./CmsFileInput";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import styles from "./CareersBannersEditor.module.css";
import type { ChangeEvent } from "react";
import { careersBannerIds, getCareersBanners } from "@/lib/careers-banners";
import { UploadRequirements } from "./UploadRequirements";

export function CareersBannersEditor({ value, busy, onChange, onUpload }: {
  value: Record<string, string>; busy: boolean; onChange: (patch: Record<string, string>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void;
}) {
  const ids = careersBannerIds(value);
  const banners = getCareersBanners(value);
  function move(index: number, offset: number) {
    const next = [...ids]; [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange({ bannerOrder: JSON.stringify(next) });
  }
  return <article className="cms-section-card">
    <div className="cms-section-card-head"><div><small>Portal de Vagas</small><h2>Banners de depoimentos</h2></div></div>
    <p>Artes de 3384 × 864 px, exibidas inteiras. Adicione até 12 banners e organize a ordem. Salve as alterações para publicar.</p>
    <p>Em Métricas → Banners, os depoimentos aparecem com o prefixo “Vagas ·”, com visualizações, cliques e CTR. O registro respeita o consentimento de cookies do visitante.</p>
    <div className="settings-form">
      <label><input type="checkbox" disabled={busy} checked={value.bannerAutoplay !== "false"} onChange={event => onChange({ bannerAutoplay: String(event.target.checked) })} /> Trocar banners automaticamente</label>
      <label>Tempo por banner (segundos)<input type="number" min={5} max={30} disabled={busy} value={value.bannerInterval || "8"} onChange={event => onChange({ bannerInterval: event.target.value })} /></label>
    </div>
    {banners.map((banner, index) => {
      const field = (name: string) => `banner_${banner.id}_${name}`;
      return <fieldset key={banner.id} disabled={busy} className="cms-section-card">
        <legend>Depoimento {index + 1}</legend>
        <div className="settings-form">
          <label>Descrição e identificação do depoimento<input maxLength={500} value={value[field("title")] || ""} onChange={event => onChange({ [field("title")]: event.target.value })} placeholder="Nome, cargo e depoimento do colaborador" /></label>
          <label>Banner desktop<CmsFileInput type="file" accept="image/jpeg,image/png,image/webp" onChange={event => onUpload(event, field("image"))} /><UploadRequirements rule="careersBannerDesktop" /></label>
          {banner.image ? <Image src={banner.image} alt={banner.title || "Prévia do depoimento"} width={3384} height={864} style={{ width: "100%", height: "auto" }} /> : null}
          <label>Banner mobile (opcional)<CmsFileInput type="file" accept="image/jpeg,image/png,image/webp" onChange={event => onUpload(event, field("mobileImage"))} /><UploadRequirements rule="careersBannerMobile">Sem versão mobile, o banner horizontal será exibido inteiro. Uma arte vertical melhora a leitura no celular.</UploadRequirements></label>
          {banner.mobileImage ? <div className={`form-span-full ${styles.mobilePreview}`}><Image src={banner.mobileImage} alt="Prévia mobile" width={1080} height={1350} style={{ maxWidth: 240, width: "100%", height: "auto" }} /><Button variant="danger" disabled={busy} onClick={() => onChange({ [field("mobileImage")]: "" })}>Remover versão mobile</Button></div> : null}
          <label>Destino ao clicar<input value={value[field("href")] ?? "#oportunidades"} onChange={event => onChange({ [field("href")]: event.target.value })} placeholder="#oportunidades ou https://..." /></label>
          <label><input type="checkbox" checked={banner.active} onChange={event => onChange({ [field("active")]: String(event.target.checked) })} /> Banner ativo</label>
        </div>
        <Button variant="secondary" type="button" disabled={busy || index === 0} onClick={() => move(index, -1)}>Mover para cima</Button>{" "}
        <Button variant="secondary" type="button" disabled={busy || index === ids.length - 1} onClick={() => move(index, 1)}>Mover para baixo</Button>{" "}
        <Button variant="danger" type="button" onClick={() => onChange({ bannerOrder: JSON.stringify(ids.filter(id => id !== banner.id)), ...Object.fromEntries(["image", "mobileImage", "title", "href", "active"].map(name => [field(name), ""])) })}>Remover banner</Button>
      </fieldset>;
    })}
    <Button variant="secondary" type="button" className="button button-secondary" disabled={busy || ids.length >= 12} onClick={() => {
      const id = crypto.randomUUID(); onChange({ bannerOrder: JSON.stringify([...ids, id]), [`banner_${id}_href`]: "#oportunidades", [`banner_${id}_active`]: "true" });
    }}>Adicionar depoimento</Button>
  </article>;
}
