"use client";
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
    [editing, setEditing] = useState<SitePolicy | null>(null),
    [busy, setBusy] = useState(false),
    [msg, setMsg] = useState(""),
    [creating, setCreating] = useState(false),
    [uploadError, setUploadError] = useState("");
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
    setUploadError("");
    const form = e.currentTarget,
      fd = new FormData(form),
      file = fd.get("file") as File;
    let fileUrl = editing?.file_url || "";
    try {
      if (file?.name) {
        await validateCmsUpload(file, "pdf");
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
      setCreating(false);
      form.reset();
      await load();
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Não foi possível salvar.";
      setUploadError(errorText);
      setMsg(errorText);
    } finally {
      setBusy(false);
    }
  }
  async function clearModule() {
    if (!items.length) return;
    if (!confirm(`Zerar Políticas e Documentos? Isso apagará ${items.length} documento(s) e não pode ser desfeito.`)) return;
    if (!confirm("Confirma a exclusão de TODOS os documentos deste módulo?")) return;
    setBusy(true);
    setMsg("");
    try {
      for (const item of items) {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_delete_policy`, {
          method: "POST",
          headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ p_id: item.id }),
        });
        if (!response.ok) throw new Error("Não foi possível apagar todos os documentos. Atualize a lista e tente novamente.");
      }
      setEditing(null); setCreating(false); setMsg("Módulo zerado com sucesso."); await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Não foi possível zerar o módulo."); await load();
    } finally { setBusy(false); }
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
    <section className="admin-page cms-policy-page">
      {creating || editing ? (
        <>
          <Button variant="ghost" type="button" className="cms-back-list" onClick={() => { setEditing(null); setCreating(false); setMsg(""); }}>← Voltar para políticas e documentos</Button>
          <header className="admin-header">
            <div><span className="eyebrow">{editing ? "Editar conteúdo" : "Novo conteúdo"}</span><h1>{editing ? "Editar documento" : "Novo documento"}</h1><p>{editing ? "Altere os dados do documento e salve para atualizar o site." : "Publique políticas, termos, relatórios de transparência e outros documentos oficiais."}</p></div>
          </header>
          <section className="cms-create-section cms-policy-editor">
            <div className="cms-create-heading"><div><span className="eyebrow">{editing ? "Edição" : "Novo documento"}</span><h2>{editing ? "Editar política" : "Publicar política ou relatório"}</h2></div></div>
            <form key={editing?.id || "new"} className="settings-form" onSubmit={save}>
              <label>Título<input name="title" required defaultValue={editing?.title || ""} placeholder="Ex.: Política de Privacidade" /></label>
              <label>Ordem de exibição<input name="sort_order" type="number" min="0" defaultValue={editing?.sort_order ?? 0} /></label>
              <label className="form-span-full">Descrição curta<input name="description" defaultValue={editing?.description || ""} placeholder="Explique brevemente o conteúdo do documento" /></label>
              <label className="form-span-full">Arquivo PDF<input name="file" type="file" accept="application/pdf,.pdf" />{uploadError ? <small className="cms-upload-error" role="alert">{uploadError}</small> : null}<UploadRequirements rule="pdf">{editing ? "Envie um novo PDF somente se quiser substituir o documento atual." : ""}</UploadRequirements></label>
              <label className="cms-switch form-span-full"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} /> Exibir no site</label>
              <div className="form-actions form-span-full"><Button variant="primary" type="submit" className="button" disabled={busy}>{busy ? "Salvando..." : editing ? "Salvar alterações" : "Publicar documento"}</Button></div>
            </form>
          </section>
        </>
      ) : (
        <>
          <header className="admin-header">
            <div><span className="eyebrow">Institucional</span><h1>Políticas e documentos</h1><p>Publique políticas, termos, relatórios de transparência e outros documentos oficiais exibidos no site.</p></div>
          </header>
          <section className="cms-content-section">
            <div className="cms-content-heading">
              <div><span className="eyebrow">Conteúdo cadastrado</span><h2>Políticas e documentos</h2></div>
              <div className="cms-list-actions">
                <Button variant="primary" className="button" type="button" onClick={() => { setMsg(""); setCreating(true); }}>+ Novo</Button>
                <Button variant="secondary" className="cms-danger-outline" type="button" onClick={clearModule} disabled={!items.length || busy}>Zerar módulo</Button>
              </div>
            </div>
            {msg ? <div className="form-status" role="status"><strong>{msg}</strong></div> : null}
            {items.length ? <div className="cms-content-list">{items.map((item) => (
              <article className="cms-content-row cms-policy-list-row" key={item.id}>
                <div className="cms-content-placeholder" aria-hidden="true" />
                <div className="cms-content-info"><strong>{item.title}</strong><small>{item.active ? "Publicado" : "Oculto"} · ordem {item.sort_order}</small></div>
                <div className="cms-row-actions">
                  <a className="cms-edit-one" href={item.file_url} target="_blank" rel="noreferrer">Abrir</a>
                  <Button variant="secondary" type="button" className="cms-edit-one" onClick={() => { setCreating(false); setEditing(item); }}>Editar</Button>
                  <Button variant="secondary" type="button" className="cms-delete-one" onClick={() => remove(item.id)}>Apagar</Button>
                </div>
              </article>
            ))}</div> : <div className="cms-empty"><strong>Nenhum documento cadastrado.</strong><span>Crie o primeiro documento para começar.</span><Button variant="primary" className="button" type="button" onClick={() => { setMsg(""); setCreating(true); }}>+ Criar novo</Button></div>}
          </section>
        </>
      )}
    </section>
  );
}
}
