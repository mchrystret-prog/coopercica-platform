"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import { HistoryImageEditor } from "./HistoryImageEditor";
import { VideosHeaderEditor } from "./VideosHeaderEditor";
import { CareersHeroEditor } from "./CareersHeroEditor";
import { HomeOffersEditor, validateOffersSettings } from "./HomeOffersEditor";
type Json = Record<string, string>;
type Section = {
  id: string;
  label: string;
  sort_order: number;
  active: boolean;
  content: Json;
};
type Payload = { settings: Record<string, Json>; sections: Section[] };
const labels: Record<string, string> = {
  eyebrow: "Chamada superior",
  title1: "Título · linha 1",
  title2: "Título · linha 2",
  description: "Descrição",
  ctaLabel: "Texto do botão",
  ctaHref: "Destino do botão",
  image: "Imagem da seção",
};
export function SiteCustomization() {
  const [data, setData] = useState<Payload | null>(null),
    [tab, setTab] = useState<"identity" | "sections" | "history" | "careers" | "offers" | "videos">(
      "identity",
    ),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false);
  const token = () => sessionStorage.getItem("coopercica_admin_token") || "";
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_get_site_customization`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setMsg("Não foi possível carregar a personalização."));
  }, []);
  async function upload(file: File, folder: string) {
    if (file.size > 15 * 1024 * 1024)
      throw new Error("O arquivo excede 15 MB.");
    const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/site-content/${path}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token()}`,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: file,
      },
    );
    if (!r.ok) throw new Error("Falha no upload.");
    return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
  }
  async function saveAll() {
    if (!data) return;
    const offersError = validateOffersSettings(data.settings);
    if (offersError) { setTab("offers"); setMsg(offersError); return; }
    if (
      data.settings.careers_hero?.image &&
      !data.settings.careers_hero.alt?.trim()
    ) {
      setTab("careers");
      setMsg(
        "Adicione uma descrição da foto do Portal de Vagas para acessibilidade.",
      );
      return;
    }
    if (data.settings.videos_header?.image && !data.settings.videos_header.alt?.trim()) {
      setTab("videos"); setMsg("Adicione uma descrição da arte de Vídeos para acessibilidade."); return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/cms_save_site_customization`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_settings: data.settings,
            p_sections: data.sections,
          }),
        },
      );
      if (!r.ok) throw new Error(await r.text());
      setMsg("Personalização salva e publicada no site.");
    } catch (err) {
      let detail = "Erro desconhecido ao salvar.";
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          detail =
            parsed.message || parsed.details || parsed.hint || err.message;
        } catch {
          detail = err.message;
        }
      }
      setMsg(`Não foi possível salvar: ${detail}`);
    } finally {
      setBusy(false);
    }
  }
  function setIdentity(k: string, v: string) {
    if (!data) return;
    setData({
      ...data,
      settings: {
        ...data.settings,
        identity: { ...data.settings.identity, [k]: v },
      },
    });
  }
  function setSection(id: string, patch: Partial<Section>) {
    if (!data) return;
    setData({
      ...data,
      sections: data.sections.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });
  }
  async function media(
    e: ChangeEvent<HTMLInputElement>,
    target: "logo" | "logoWhite" | string,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      if (
        (target.startsWith("history:") || target.startsWith("careers:") || target.startsWith("videos:")) &&
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw new Error("Use uma imagem JPG, PNG ou WebP.");
      const url = await upload(
        file,
        target.startsWith("videos:")
          ? "videos"
          : target.startsWith("careers:")
          ? "careers"
          : target.startsWith("history:")
            ? "history"
            : target.startsWith("section:")
              ? "sections"
              : "identity",
      );
      if (target.startsWith("videos:")) {
        const field = target.slice(7);
        setData(current => current ? { ...current, settings: { ...current.settings,
          videos_header: { ...current.settings.videos_header, [field]: url,
            alt: current.settings.videos_header?.alt || "Mais conteúdo pra você. Família reunida assistindo ao canal da Coopercica." }
        } } : current);
      } else if (target.startsWith("careers:")) {
        const field = target.slice(8);
        setData((current) =>
          current
            ? {
                ...current,
                settings: {
                  ...current.settings,
                  careers_hero: {
                    ...current.settings.careers_hero,
                    [field]: url,
                  },
                },
              }
            : current,
        );
      } else if (target.startsWith("history:")) {
        const id = target.slice(8);
        setData((current) =>
          current
            ? {
                ...current,
                settings: {
                  ...current.settings,
                  history_images: {
                    ...current.settings.history_images,
                    [id]: url,
                  },
                },
              }
            : current,
        );
      } else if (target.startsWith("section:")) {
        const id = target.split(":")[1];
        const s = data?.sections.find((x) => x.id === id);
        if (s) setSection(id, { content: { ...s.content, image: url } });
      } else setIdentity(target, url);
      setMsg("Arquivo enviado. Clique em Salvar alterações para publicar.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <div className="cms-empty">{msg || "Carregando personalização..."}</div>
    );
  const i = data.settings.identity || {};
  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">Site</span>
          <h1>Personalização</h1>
          <p>
            Edite identidade visual e conteúdo das seções sem alterar o código.
          </p>
        </div>
      </header>
      <div className="cms-custom-tabs">
        <button
          data-active={tab === "identity"}
          onClick={() => setTab("identity")}
        >
          Identidade visual
        </button>
        <button
          data-active={tab === "sections"}
          onClick={() => setTab("sections")}
        >
          Seções da Home
        </button>
        <button
          data-active={tab === "history"}
          onClick={() => setTab("history")}
        >
          Nossa História
        </button>
        <button
          data-active={tab === "careers"}
          onClick={() => setTab("careers")}
        >
          Portal de Vagas
        </button>
        <button data-active={tab === "videos"} onClick={() => setTab("videos")}>Vídeos</button>
        <button data-active={tab === "offers"} onClick={() => setTab("offers")}>Ofertas via API</button>
      </div>
      {msg ? (
        <div className="form-status">
          <strong>{msg}</strong>
        </div>
      ) : null}
      {tab === "identity" ? (
        <div className="settings-form">
          <p id="identity-colors-note" className="form-span-full">
            As cores do site público seguem os tokens oficiais do Design System.
            Os valores existentes são preservados, mas não podem ser editados
            nesta fase.
          </p>
          <label>
            Nome do site
            <input
              value={i.siteName || ""}
              onChange={(e) => setIdentity("siteName", e.target.value)}
            />
          </label>
          <label>
            Cor principal
            <input
              type="color"
              value={i.primaryColor || "#1c4722"}
              disabled
              aria-describedby="identity-colors-note"
            />
            <small>
              Usada em títulos, navegação e elementos institucionais.
            </small>
          </label>
          <label>
            Cor secundária
            <input
              type="color"
              value={i.secondaryColor || "#6ab945"}
              disabled
              aria-describedby="identity-colors-note"
            />
          </label>
          <label>
            Cor de destaque
            <input
              type="color"
              value={i.accentColor || "#ef4037"}
              disabled
              aria-describedby="identity-colors-note"
            />
          </label>
          <label>
            Cor de fundo do site
            <input
              type="color"
              value={i.pageColor || "#f6faf6"}
              disabled
              aria-describedby="identity-colors-note"
            />
          </label>
          <label>
            URL do Delivery
            <input
              value={i.deliveryUrl || ""}
              onChange={(e) => setIdentity("deliveryUrl", e.target.value)}
            />
          </label>
          <label>
            E-mail de atendimento
            <input
              type="email"
              value={i.contactEmail || ""}
              onChange={(e) => setIdentity("contactEmail", e.target.value)}
            />
          </label>
          <label className="form-span-full">
            Logo principal
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => media(e, "logo")}
            />
            <small>
              Recomendado: arquivo horizontal com fundo transparente, mínimo
              1200 px de largura. PNG, WebP ou SVG. Máximo: 15 MB.
            </small>
            {i.logo ? (
              <img
                className="cms-upload-preview"
                src={i.logo}
                alt="Logo atual"
              />
            ) : null}
          </label>
          <label className="form-span-full">
            Logo para fundos escuros
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => media(e, "logoWhite")}
            />
            <small>
              Mesmas proporções do logo principal. PNG, WebP ou SVG. Máximo: 15
              MB.
            </small>
            {i.logoWhite ? (
              <img
                className="cms-upload-preview cms-upload-preview-dark"
                src={i.logoWhite}
                alt="Logo claro atual"
              />
            ) : null}
          </label>
        </div>
      ) : tab === "videos" ? (
        <VideosHeaderEditor value={data.settings.videos_header || {}} busy={busy}
          onUpload={(e, field) => media(e, `videos:${field}`)}
          onChange={patch => {
            setData(current => current ? { ...current, settings: { ...current.settings,
              videos_header: { ...current.settings.videos_header, ...patch }
            } } : current);
            setMsg("Cabeçalho de Vídeos alterado. Salve as alterações para publicar.");
          }} />
      ) : tab === "offers" ? (
        <HomeOffersEditor settings={data.settings} busy={busy} onChange={(key, patch) => {
          setData(current => current ? { ...current, settings: { ...current.settings, [key]: { ...current.settings[key], ...patch } } } : current);
          setMsg("Configuração de ofertas alterada. Salve as alterações para publicar.");
        }} />
      ) : tab === "careers" ? (
        <CareersHeroEditor
          value={data.settings.careers_hero || {}}
          busy={busy}
          onUpload={(e, field) => media(e, `careers:${field}`)}
          onChange={(patch) => {
            setData((current) =>
              current
                ? {
                    ...current,
                    settings: {
                      ...current.settings,
                      careers_hero: {
                        ...current.settings.careers_hero,
                        ...patch,
                      },
                    },
                  }
                : current,
            );
            setMsg(
              "Portal de Vagas alterado. Salve as alterações para publicar.",
            );
          }}
        />
      ) : tab === "history" ? (
        <HistoryImageEditor
          images={data.settings.history_images || {}}
          busy={busy}
          onUpload={(e, id) => media(e, `history:${id}`)}
          onRestore={(id) => {
            const images = { ...data.settings.history_images };
            delete images[id];
            setData({
              ...data,
              settings: { ...data.settings, history_images: images },
            });
            setMsg(
              "Imagem original restaurada. Salve as alterações para publicar.",
            );
          }}
        />
      ) : (
        <div className="cms-section-editor">
          {data.sections.map((s) => (
            <article className="cms-section-card" key={s.id}>
              <div className="cms-section-card-head">
                <div>
                  <small>Seção da Home</small>
                  <h2>{s.label}</h2>
                </div>
                <label className="cms-switch">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={(e) =>
                      setSection(s.id, { active: e.target.checked })
                    }
                  />{" "}
                  Exibir
                </label>
              </div>
              <div className="settings-form">
                {Object.entries(s.content)
                  .filter(([k]) => k !== "image")
                  .map(([k, v]) => (
                    <label key={k}>
                      {labels[k] || k}
                      <input
                        value={v || ""}
                        onChange={(e) =>
                          setSection(s.id, {
                            content: { ...s.content, [k]: e.target.value },
                          })
                        }
                      />
                    </label>
                  ))}
                {"image" in s.content ? (
                  <label className="form-span-full">
                    Imagem da seção
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => media(e, `section:${s.id}`)}
                    />
                    <small>
                      Recomendado: 1600 × 1000 px, JPG/PNG/WebP. Máximo: 15 MB.
                    </small>
                    {s.content.image ? (
                      <img
                        className="cms-upload-preview"
                        src={s.content.image}
                        alt="Imagem atual"
                      />
                    ) : null}
                  </label>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="cms-save-bar">
        <div aria-live="polite">
          {msg ? (
            <span className="cms-save-message">{msg}</span>
          ) : (
            <span>Revise as alterações antes de publicar.</span>
          )}
        </div>
        <button className="button" onClick={saveAll} disabled={busy}>
          {busy ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </section>
  );
}
