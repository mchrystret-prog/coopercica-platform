"use client";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import { getLeafletAssets } from "@/lib/leaflet-assets";
import {
  assetKey,
  boxCode,
  sealCode,
  type LeafletAsset,
} from "@/lib/leaflet-presentation";
import styles from "./LeafletAssetLibrary.module.css";

export function LeafletAssetLibrary() {
  const [assets, setAssets] = useState<LeafletAsset[]>([]);
  const [editing, setEditing] = useState<LeafletAsset | null>(null);
  const [kind, setKind] = useState<"box" | "seal">("box");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    getLeafletAssets(
      sessionStorage.getItem("coopercica_admin_token") || undefined,
    )
      .then((items) => {
        if (active) {
          setAssets(items);
          setReady(true);
        }
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) {
      setMessage("Sessão expirada. Entre novamente no CMS.");
      return;
    }
    const form = event.currentTarget,
      data = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const code =
        kind === "box" ? boxCode(data.get("code")) : sealCode(data.get("code"));
      if (!code || code.length > 80)
        throw new Error("Informe um código de até 80 caracteres.");
      if (kind === "seal" && /[;,|]/.test(code))
        throw new Error(
          "O código do selo não pode conter ponto e vírgula, vírgula ou barra vertical.",
        );
      const name = String(data.get("name") || "").trim(),
        alt = String(data.get("alt") || "").trim();
      if (!name || !alt)
        throw new Error("Informe o nome e o texto alternativo.");
      const current = await getLeafletAssets(token);
      if (!editing && current.some((a) => a.kind === kind && a.code === code))
        throw new Error(
          "Esse código já está cadastrado. Use Substituir arquivo.",
        );
      const file = data.get("image");
      if (!(file instanceof File) || !file.size)
        throw new Error("Selecione a imagem.");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("A imagem excede 10 MB.");
      const extension = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      }[file.type];
      if (!extension) throw new Error("Use uma imagem PNG, JPG ou WebP.");
      const path = `presentation/${kind}/${crypto.randomUUID()}.${extension}`;
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/leaflet-assets/${path}`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": file.type,
            "x-upsert": "false",
          },
          body: file,
        },
      );
      if (!response.ok)
        throw new Error(
          `Não foi possível enviar a imagem (HTTP ${response.status}).`,
        );
      const asset: LeafletAsset = {
        kind,
        code,
        name,
        alt,
        imageUrl: `${SUPABASE_URL}/storage/v1/object/public/leaflet-assets/${path}`,
      };
      const saved = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/cms_save_site_customization`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_settings: { [assetKey(asset)]: asset },
            p_sections: [],
          }),
        },
      );
      if (!saved.ok)
        throw new Error(
          `Não foi possível cadastrar o arquivo (HTTP ${saved.status}).`,
        );
      setAssets([
        ...current.filter((a) => assetKey(a) !== assetKey(asset)),
        asset,
      ]);
      setEditing(null);
      form.reset();
      setMessage(
        "Arquivo cadastrado. Ele já pode ser usado nas próximas importações.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-card">
      <h2>Biblioteca de fundos e selos</h2>
      <p>
        Cadastre a arte uma vez e use o código na planilha. Para os selos de
        advertência, envie a arte aprovada com o texto completo.
      </p>
      <form
        key={editing ? assetKey(editing) : "new"}
        className="settings-form"
        onSubmit={save}
      >
        <label>
          Tipo
          <select
            value={kind}
            disabled={busy || !!editing}
            onChange={(event) => setKind(event.target.value as "box" | "seal")}
          >
            <option value="box">Fundo de box</option>
            <option value="seal">Selo de produto</option>
          </select>
        </label>
        <label>
          Código na planilha
          <input
            name="code"
            required
            maxLength={80}
            readOnly={!!editing}
            defaultValue={editing?.code || ""}
            placeholder={kind === "box" ? "padaria" : "+18 ou aleitamento"}
          />
          <small>
            {kind === "box"
              ? "BOX: Padaria e Box padaria apontam para o código padaria."
              : "Use +18 para bebidas alcoólicas, aleitamento para a advertência de leite ou um código próprio."}
          </small>
        </label>
        <label>
          Nome
          <input name="name" required defaultValue={editing?.name || ""} />
        </label>
        <label>
          Texto alternativo
          <input
            name="alt"
            required
            defaultValue={editing?.alt || ""}
            placeholder={
              kind === "box"
                ? "Fundo de padaria"
                : "Transcreva a advertência da arte"
            }
          />
        </label>
        <label className="form-span-full">
          Imagem
          <input
            name="image"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp"
          />
          <small>
            PNG, JPG ou WebP, até 10 MB. Use PNG ou WebP transparente para
            selos. O fundo ocupa a seção inteira.
          </small>
        </label>
        <div className="form-actions">
          <button className="button" disabled={busy || !ready}>
            {busy
              ? "Salvando..."
              : editing
                ? "Substituir arquivo"
                : "Cadastrar arquivo"}
          </button>
          {editing ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(null)}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>
      {message ? <p role="status">{message}</p> : null}
      <div className={styles.library}>
        {assets.map((asset) => (
          <article key={assetKey(asset)}>
            <Image
              unoptimized
              width={1600}
              height={1000}
              src={asset.imageUrl}
              alt={asset.alt}
            />
            <div>
              <strong>{asset.name}</strong>
              <p>
                {asset.kind === "box" ? "Fundo" : "Selo"}:{" "}
                <code>{asset.code}</code>
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(asset);
                  setKind(asset.kind);
                }}
              >
                Substituir arquivo
              </button>
            </div>
          </article>
        ))}
      </div>
      {ready && !assets.length ? <p>Nenhum fundo ou selo cadastrado.</p> : null}
    </section>
  );
}
