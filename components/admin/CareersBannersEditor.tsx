"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { careersDefaults, type CareersContent } from "@/lib/careers-content";
import type { CareersBanner } from "@/lib/careers-banners";
import type { CareersTestimonial } from "@/lib/careers-testimonials";
import { CareersTestimonialsEditor } from "./CareersTestimonialsEditor";
import { UploadRequirements } from "./UploadRequirements";

type ContentField = keyof CareersContent;
type CareersEditorTab = "banners" | "testimonials" | "culture";

export function CareersBannersEditor({
  banners,
  contentValue,
  testimonials,
  busy,
  uploadErrors = {},
  onUpload,
  onBannersChange,
  onContentChange,
  onTestimonialsChange,
  onTestimonialUpload,
}: {
  banners: CareersBanner[];
  contentValue: Record<string, string>;
  testimonials: CareersTestimonial[];
  busy: boolean;
  uploadErrors?: Record<string, string>;
  onUpload: (event: ChangeEvent<HTMLInputElement>, target: string) => void;
  onBannersChange: (banners: CareersBanner[]) => void;
  onContentChange: (patch: Record<string, string>) => void;
  onTestimonialsChange: (items: CareersTestimonial[]) => void;
  onTestimonialUpload: (event: ChangeEvent<HTMLInputElement>, testimonialId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<CareersEditorTab>("banners");

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

  const tabs: Array<{ id: CareersEditorTab; label: string; description: string }> = [
    { id: "banners", label: "Banners", description: "Imagens de destaque que aparecem no topo do Portal de Vagas." },
    { id: "testimonials", label: "Depoimentos", description: "Histórias e fotos dos colaboradores exibidas no carrossel." },
    { id: "culture", label: "Manifesto e cultura", description: "Textos institucionais, missão, visão e valores da Coopercica." },
  ];

  return (
    <div className="cms-section-editor">
      <article className="cms-section-card">
        <div className="cms-section-card-head">
          <div>
            <small>Personalização · Portal de Vagas</small>
            <h2>Conteúdo do Portal de Vagas</h2>
            <p>Escolha uma área para editar. As alterações das três abas são reunidas no botão Salvar alterações, no rodapé.</p>
          </div>
        </div>

        <nav className="cms-custom-tabs" role="tablist" aria-label="Áreas do Portal de Vagas">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`careers-panel-${tab.id}`}
              data-active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="cms-tab-count">
                {tab.id === "banners" ? banners.length : tab.id === "testimonials" ? testimonials.length : " "}
              </span>
            </Button>
          ))}
        </nav>
        <p className="cms-tab-description">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
      </article>

      {activeTab === "banners" ? (
        <div id="careers-panel-banners" role="tabpanel" aria-label="Banners do Portal de Vagas">
          <article className="cms-section-card">
            <div className="cms-section-card-head">
              <div>
                <small>Topo do portal</small>
                <h2>Banners de destaque</h2>
              </div>
              <Button type="button" onClick={addBanner} disabled={busy}>Adicionar banner</Button>
            </div>
            <p>
              Os banners do Portal de Vagas são independentes do slider da Home.
              A imagem desktop é obrigatória para publicação; a versão mobile é opcional.
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
                    <small>Descrição para leitores de tela e identificação do banner no CMS.</small>
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
                    {banner.desktopImage ? <Image className="cms-upload-preview" src={banner.desktopImage} alt={banner.title || "Prévia do banner desktop"} width={1692} height={432} style={{ width: "100%", height: "auto", objectFit: "contain" }} /> : <small>Nenhuma imagem desktop enviada.</small>}
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
                    {banner.mobileImage ? <Image className="cms-upload-preview" src={banner.mobileImage} alt={banner.title || "Prévia do banner mobile"} width={360} height={360} style={{ width: "min(100%, 360px)", height: "auto", objectFit: "contain" }} /> : <small>Nenhuma imagem mobile enviada.</small>}
                    {banner.mobileImage ? <Button type="button" variant="secondary" disabled={busy} onClick={() => patchBanner(banner.id, { mobileImage: "" })}>Remover imagem mobile</Button> : null}
                  </label>
                </div>
                <Button type="button" variant="secondary" disabled={busy} onClick={() => onBannersChange(banners.filter((item) => item.id !== banner.id))}>Remover banner</Button>
              </section>
            ))}
            <p>Os banners ativos são exibidos em ordem crescente. A reprodução automática pode ser pausada no próprio slider.</p>
          </article>
        </div>
      ) : null}

      {activeTab === "testimonials" ? (
        <div id="careers-panel-testimonials" role="tabpanel" aria-label="Depoimentos dos colaboradores">
          <CareersTestimonialsEditor
            testimonials={testimonials}
            busy={busy}
            onChange={onTestimonialsChange}
            onUpload={onTestimonialUpload}
            uploadErrors={uploadErrors}
          />
        </div>
      ) : null}

      {activeTab === "culture" ? (
        <div id="careers-panel-culture" role="tabpanel" aria-label="Manifesto e cultura">
          <article className="cms-section-card">
            <div className="cms-section-card-head">
              <div>
                <small>Identidade Coopercica</small>
                <h2>Manifesto e cultura</h2>
              </div>
            </div>
            <p>Edite os textos institucionais exibidos no Portal de Vagas. Campos vazios utilizam o conteúdo padrão do site.</p>
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
      ) : null}
    </div>
  );
}
