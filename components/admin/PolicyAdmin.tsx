"use client";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import type { SitePolicy } from "@/lib/policies";
const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export function PolicyAdmin() {
  const [items, setItems] = useState<SitePolicy[]>([]),
    [editing, setEditing] = useState<SitePolicy | null>(null),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState("");
  const token = () => sessionStorage.getItem("coopercica_admin_token") || "";
  const load = useCallback(async () => {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/site_policies?select=*&order=sort_order.asc,title.asc`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token()}`,
        },
      },
    );
    if (r.ok) setItems(await r.json());
  }, []);
  useEffect(() => {
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
      if (file?.size) {
        if (file.type !== "application/pdf")
          throw new Error("Envie o documento em PDF.");
        if (file.size > 15 * 1024 * 1024)
          throw new Error("O PDF deve ter no máximo 15 MB.");
        const slug = slugify(String(fd.get("title")));
        const path = `policies/${slug}-${Date.now()}.pdf`;
        const up = await fetch(
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
      if (!fileUrl) throw new Error("Selecione um PDF.");
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
      setMsg(editing ? "Documento atualizado." : "Documento publicado.");
      setEditing(null);
      form.reset();
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
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
    }
  }
  return (
    <div className="cms-policy-manager">
      <section className="cms-content-section">
        <div className="cms-content-heading">
          <div>
            <span className="eyebrow">Publicados</span>
            <h2>Documentos do site</h2>
          </div>
        </div>
        {items.length ? (
          <div className="cms-content-list">
            {items.map((p) => (
              <article className="cms-policy-row" key={p.id}>
                <div>
                  <strong>{p.title}</strong>
                  <small>
                    {p.active ? "Publicado" : "Oculto"} · ordem {p.sort_order}
                  </small>
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
                  <button
                    className="cms-edit-one"
                    onClick={() => setEditing(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="cms-delete-one"
                    onClick={() => remove(p.id)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cms-empty">
            <strong>Nenhum documento cadastrado.</strong>
            <span>
              Use o formulário abaixo para publicar a primeira política.
            </span>
          </div>
        )}
      </section>
      <section className="cms-create-section">
        <div className="cms-create-heading">
          <div>
            <span className="eyebrow">
              {editing ? "Edição" : "Novo documento"}
            </span>
            <h2>
              {editing ? "Editar política" : "Publicar política ou relatório"}
            </h2>
          </div>
          {editing ? (
            <button className="cms-edit-one" onClick={() => setEditing(null)}>
              Cancelar edição
            </button>
          ) : null}
        </div>
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
            <input name="file" type="file" accept="application/pdf" />
            <small>
              {editing
                ? "Envie um novo PDF somente se quiser substituir o documento atual."
                : "PDF de até 15 MB."}
            </small>
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
            <button className="button" disabled={busy}>
              {busy
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Publicar documento"}
            </button>
          </div>
        </form>
        {msg ? <div className="form-status">{msg}</div> : null}
      </section>
    </div>
  );
}
