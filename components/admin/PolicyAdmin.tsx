"use client";
import { cmsUploadFetch, reportCmsUploadError } from "@/lib/cms-upload-feedback";
import { CmsFileInput } from "./CmsFileInput";
import { CmsFeedback, useCmsMessage } from "./CmsFeedback";
import { Button } from "@/components/ui/Button/Button";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import type { SitePolicy } from "@/lib/policies";
import { validateCmsUpload } from "@/lib/cms-upload-validation";
import { UploadRequirements } from "./UploadRequirements";
const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export function PolicyAdmin() {
  const [items, setItems] = useState<SitePolicy[]>([]),
    [mode, setMode] = useState<"list" | "create" | "edit">("list"),
    [loading, setLoading] = useState(true),
    [editing, setEditing] = useState<SitePolicy | null>(null),
    [busy, setBusy] = useState(false),
    [msg, setMsg, msgKind] = useCmsMessage("");
  const token = () => sessionStorage.getItem("coopercica_admin_token") || "";
  const load = useCallback(async () => {
    try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/site_policies?select=*&order=sort_order.asc,title.asc`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token()}`,
        },
      },
    );
    if (!r.ok) throw new Error("Não foi possível carregar os documentos. Tente novamente.");
    setItems(await r.json());
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Não foi possível carregar os documentos.");
    } finally { setLoading(false); }
  }, [setMsg]);
  useEffect(() => {
    // The loader updates state after the network request completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const form = e.currentTarget,
      fd = new FormData(form),
      file = fd.get("file") as File;
    let fileUrl = editing?.file_url || "";
    try {
      if (file?.name) {
        await validateCmsUpload(file, "pdf");
        const slug = slugify(String(fd.get("title")));
        const path = `policies/${slug}-${Date.now()}.pdf`;
        const up = await cmsUploadFetch(
          `${SUPABASE_URL}/storage/v1/object/site-content/${path}`,
          {
            method: "POST",
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${token()}`,
              "Content-Type": "application/pdf",
              "x-upsert": "false",
            },
            body: file,
          },
        );
        if (!up.ok) throw new Error("Não foi possível enviar o PDF.");
        fileUrl = `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
      }
      if (!fileUrl) { reportCmsUploadError(form.elements.namedItem("file") as HTMLInputElement, "Selecione um PDF antes de publicar."); throw new Error("Selecione um PDF antes de publicar."); }
      const title = String(fd.get("title"));
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_save_policy`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_id: editing?.id || null,
          p_title: title,
          p_slug: slugify(title),
          p_description: String(fd.get("description") || ""),
          p_file_url: fileUrl,
          p_sort_order: Number(fd.get("sort_order") || 0),
          p_active: fd.get("active") === "on",
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setMsg(editing ? "Documento atualizado." : "Documento publicado.", "success");
      setEditing(null);
      form.reset();
      setMode("list");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {try {
    if (!confirm("Excluir este documento do site?")) return;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_delete_policy`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_id: id }),
    });
    if (r.ok) {
      if (editing?.id === id) setEditing(null);
      await load();
      setMsg("Documento excluído.", "success");
    } else { setMsg("Não foi possível excluir o documento. Tente novamente."); }
  } catch (cause) { setMsg(cause instanceof Error ? cause.message : "Não foi possível concluir a exclusão. Tente novamente."); }}
  return (
    <section className="admin-page cms-policy-manager">
      {mode !== "list" && <Button variant="ghost" className="cms-back-list" type="button" disabled={busy} onClick={() => { setMode("list"); setEditing(null); setMsg(""); }}>← Voltar para políticas e documentos</Button>}
      <header className="admin-header"><div>
        <span className="eyebrow">{mode === "list" ? "Institucional" : mode === "edit" ? "Editar conteúdo" : "Novo conteúdo"}</span>
        <h1>{mode === "list" ? "Políticas e documentos" : mode === "edit" ? "Editar documento" : "Novo documento"}</h1>
        <p>{mode === "edit" ? "Altere os dados do documento e salve para atualizar o site." : "Gerencie políticas, termos, relatórios de transparência e outros documentos oficiais exibidos no site."}</p>
      </div></header>
      {msg ? <div className="form-status" role="status"><CmsFeedback message={msg} kind={msgKind} /></div> : null}
      {mode === "list" ? (
      <section className="cms-content-section">
        <div className="cms-content-heading">
          <div>
            <span className="eyebrow">Conteúdo cadastrado</span>
            <h2>Documentos do site</h2>
          </div>
          <div className="cms-list-actions"><Button variant="primary" className="button" type="button" onClick={() => { setEditing(null); setMode("create"); setMsg(""); }}>+ Novo documento</Button></div>
        </div>
        {loading ? <div className="cms-empty" role="status">Carregando documentos...</div> : items.length ? (
          <div className="cms-content-list">
            {items.map((p) => (
              <article className="cms-content-row" key={p.id}>
                <div className="cms-content-placeholder" aria-hidden="true">PDF</div>
                <div className="cms-content-info">
                  <strong>{p.title}</strong>
                  <small>
                    Ordem {p.sort_order}
                  </small>
                  <span className="badge">{p.active ? "Publicado" : "Oculto"}</span>
                </div>
                <div className="cms-row-actions">
                  <a
                    className="cms-edit-one"
                    href={p.file_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir
                  </a>
                  <Button variant="secondary" type="button"
                    className="cms-edit-one"
                    onClick={() => { setEditing(p); setMode("edit"); setMsg(""); }}
                  >
                    Editar
                  </Button>
                  <Button variant="danger" type="button"
                    className="cms-delete-one"
                    onClick={() => remove(p.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cms-empty">
            <strong>Nenhum documento cadastrado.</strong>
            <span>
              Crie o primeiro documento para começar.
            </span>
            <Button variant="primary" type="button" onClick={() => { setEditing(null); setMode("create"); setMsg(""); }}>+ Criar documento</Button>
          </div>
        )}
      </section>
      ) : (
        <form
          key={editing?.id || "new"}
          className="settings-form"
          onSubmit={save}
        >
          <label>
            Título
            <input
              name="title"
              required
              defaultValue={editing?.title || ""}
              placeholder="Ex.: Política de Privacidade"
            />
          </label>
          <label>
            Ordem de exibição
            <input
              name="sort_order"
              type="number"
              min="0"
              defaultValue={editing?.sort_order ?? 0}
            />
          </label>
          <label className="form-span-full">
            Descrição curta
            <input
              name="description"
              defaultValue={editing?.description || ""}
              placeholder="Explique brevemente o conteúdo do documento"
            />
          </label>
          <label className="form-span-full">
            Arquivo PDF
            <CmsFileInput name="file" type="file" accept="application/pdf,.pdf" />
            <UploadRequirements rule="pdf">
              {editing
                ? "Envie um novo PDF somente se quiser substituir o documento atual."
                : ""}
            </UploadRequirements>
          </label>
          <label className="cms-switch form-span-full">
            <input
              name="active"
              type="checkbox"
              defaultChecked={editing?.active ?? true}
            />{" "}
            Exibir no site
          </label>
          <div className="form-actions">
            <Button variant="secondary" type="button" disabled={busy} onClick={() => { setMode("list"); setEditing(null); setMsg(""); }}>Cancelar</Button>
            <Button variant="primary" type="submit" className="button" disabled={busy}>
              {busy
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Publicar documento"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
