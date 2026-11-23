"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { careersDefaults, type CareersContent } from "@/lib/careers-content";
import type { CareersBanner } from "@/lib/careers-banners";
import { UploadRequirements } from "./UploadRequirements";

type ContentField = keyof CareersContent;

export function CareersBannersEditor({
  banners,
  contentValue,
  busy,
  uploadErrors = {},
  onUpload,
  onBannersChange,
  onContentChange,
}: {
  banners: CareersBanner[];
  contentValue: Record<string, string>;
  busy: boolean;
  uploadErrors?: Record<string, string>;
  onUpload: (event: ChangeEvent<HTMLInputElement>, target: string) => void;
  onBannersChange: (banners: CareersBanner[]) => void;
  onContentChange: (patch: Record<string, string>) => void;
}) {
  function patchBanner(id: string, patch: Partial<CareersBanner>) {
    onBannersChange(banners.map((banner) => banner.id === id ? { ...banner, ...patch } : banner));
  }

  function addBanner() {
    onBannersChange([...banners, {
      id: crypto.randomUUID(),
      title: "",
      desktopImage: "",
      mobileImage: "",
      href: "",
      order: banners.reduce((max, banner) => Math.max(max, banner.order), 0) + 1,
      active: false,
    }]);
  }

  const contentFields: Array<[ContentField, string, number]> = [
    ["manifestoTitle", "Título do manifesto", 3],
    ["manifesto", "Manifesto · separe parágrafos com uma linha em branco", 8],
    ["mission", "Missão", 3],
    ["vision", "Visão", 5],
    ["respect", "Valor · Respeito", 3],
    ["ethics", "Valor · Ética", 3],
    ["cooperation", "Valor · Cooperação", 3],
  ];

  return (
    <div className="cms-section-editor">
      <article className="cms-section-card">
        <div className="cms-section-card-head">
          <div>
            <small>Portal de Vagas</small>
            <h2>Banners de destaque</h2>
          </div>
          <Button type="button" onClick={addBanner} disabled={busy}>Adicionar banner</Button>
        </div>
        <p>
          Cadastre banners exclusivos do Portal de Vagas. Eles não compartilham
          imagens nem configurações com o slider da Home. O banner desktop é
          obrigatório para publicação; a versão mobile é opcional.
        </p>
        {banners.length === 0 ? (
          <p className="cms-empty">Nenhum banner cadastrado. Adicione o primeiro para começar.</p>
        ) : banners.map((banner, index) => (
          <section className="cms-section-card" key={banner.id}>
            <div className="cms-section-card-head">
              <div>
                <small>Banner {index + 1}</small>
                <h3>{banner.title || "Novo banner"}</h3>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={banner.active}
                  disabled={busy}
                  onChange={(event) => patchBanner(banner.id, { active: event.target.checked })}
                />
                Banner ativo
              </label>
            </div>
            <div className="settings-form">
              <label>
                Texto alternativo da imagem
                <input
                  value={banner.title}
                  maxLength={300}
                  disabled={busy}
                  placeholder="Descreva o conteúdo do banner"
                  onChange={(event) => patchBanner(banner.id, { title: event.target.value })}
                />
                <small>Usado por leitores de tela e como identificação do banner no CMS.</small>
              </label>
              <label>
                Link de destino (opcional)
                <input
                  value={banner.href}
                  maxLength={2000}
                  disabled={busy}
                  placeholder="https://... ou /pagina"
                  onChange={(event) => patchBanner(banner.id, { href: event.target.value })}
                />
              </label>
              <label>
                Ordem de exibição
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={banner.order}
                  disabled={busy}
                  onChange={(event) => patchBanner(banner.id, { order: Math.max(1, Number(event.target.value) || 1) })}
                />
              </label>
              <label>
                Imagem desktop
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(event) => onUpload(event, `careers-banner:${banner.id}:desktopImage`)}
                />
                {uploadErrors[`careers-banner:${banner.id}:desktopImage`] ? <small className="cms-upload-error" role="alert">{uploadErrors[`careers-banner:${banner.id}:desktopImage`]}</small> : null}
                <UploadRequirements rule="careersBannerDesktop" />
                {banner.desktopImage ? <Image className="cms-upload-preview" src={banner.desktopImage} alt={banner.title || "Prévia do banner desktop"} width={1692} height={432} style={{ width: "100%", height: "auto", objectFit: "contain" }} /> : null}
                {banner.desktopImage ? <Button type="button" variant="secondary" disabled={busy} onClick={() => patchBanner(banner.id, { desktopImage: "" })}>Remover imagem desktop</Button> : null}
              </label>
              <label>
                Imagem mobile (opcional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={(event) => onUpload(event, `careers-banner:${banner.id}:mobileImage`)}
                />
                {uploadErrors[`careers-banner:${banner.id}:mobileImage`] ? <small className="cms-upload-error" role="alert">{uploadErrors[`careers-banner:${banner.id}:mobileImage`]}</small> : null}
                <UploadRequirements rule="careersBannerMobile">Sem uma versão mobile, o celular exibirá a imagem desktop.</UploadRequirements>
                {banner.mobileImage ? <Image className="cms-upload-preview" src={banner.mobileImage} alt={banner.title || "Prévia do banner mobile"} width={360} height={360} style={{ width: "min(100%, 360px)", height: "auto", objectFit: "contain" }} /> : null}
                {banner.mobileImage ? <Button type="button" variant="secondary" disabled={busy} onClick={() => patchBanner(banner.id, { mobileImage: "" })}>Remover imagem mobile</Button> : null}
              </label>
            </div>
            <Button type="button" variant="secondary" disabled={busy} onClick={() => onBannersChange(banners.filter((item) => item.id !== banner.id))}>Remover banner</Button>
          </section>
        ))}
        <p>Os banners ativos são exibidos em ordem crescente. A reprodução automática pode ser pausada no próprio slider.</p>
      </article>

      <article className="cms-section-card">
        <div className="cms-section-card-head">
          <div><small>Carreiras Coopercica</small><h2>Manifesto e cultura</h2></div>
        </div>
        <p>Conteúdo institucional exibido abaixo dos banners. Campos vazios usam o texto padrão. Salve as alterações para publicar.</p>
        <div className="settings-form">
          {contentFields.map(([field, label, rows]) => (
            <label key={field}>
              {label}
              <textarea
                disabled={busy}
                rows={rows}
                maxLength={5000}
                value={contentValue[field] ?? careersDefaults[field]}
                onChange={(event) => onContentChange({ [field]: event.target.value })}
              />
            </label>
          ))}
        </div>
      </article>
    </div>
  );
}
