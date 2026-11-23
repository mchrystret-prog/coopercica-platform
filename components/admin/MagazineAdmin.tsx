"use client";
import { Button } from "@/components/ui/Button/Button";
import { UploadRequirements } from "./UploadRequirements";
import { validateCmsUpload } from "@/lib/cms-upload-validation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import { uploadPublicationPdf } from "@/lib/publication-upload";
import { getCmsAccessToken } from "@/lib/cms-session";
import { publicationUploadError } from "@/lib/publication-upload-error";
import { emptyMagazineEditorial, type MagazineEditorial } from "@/lib/magazine-editorial";
import { saveMagazineEditorial } from "@/lib/magazine-editorial-save";

async function uploadCover(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || !file.size) throw new Error("Selecione a capa.");
  await validateCmsUpload(file, "magazineCover");
  const token = await getCmsAccessToken();
  const path = `magazines/cover-${crypto.randomUUID()}.${file.name.split(".").pop()}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-content/${path}`, { method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": file.type }, body: file });
  if (!response.ok) throw await publicationUploadError(response, "A capa");
  return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
}
export function MagazineAdmin() {
  const [message, setMessage] = useState("");
  const [coverError, setCoverError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);
  const [readStatus, setReadStatus] = useState("");
  const [readError, setReadError] = useState("");
  const [editorial, setEditorial] = useState<MagazineEditorial>(emptyMagazineEditorial);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);

  async function readPdf(file: File) {
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    setReading(true); setReadError(""); setReadStatus("Lendo PDF para sugerir Nessa edição…");
    const timeout = window.setTimeout(() => active.abort(new Error("A leitura excedeu dois minutos. Preencha manualmente ou tente novamente.")), 120_000);
    try {
      await validateCmsUpload(file, "pdf");
      active.signal.throwIfAborted();
      const { readMagazinePdf } = await import("@/lib/magazine-pdf-browser");
      const result = await readMagazinePdf(file, active.signal, text => { if (controller.current === active) setReadStatus(text); });
      if (controller.current === active && !active.signal.aborted) {
        setEditorial({ headline: "", summary: result.summary, highlights: result.highlights.map(({ label, text }) => ({ label, text })) });
        setReadStatus(`Sugestão preenchida. Lidas ${result.pagesRead} de ${result.totalPages} páginas. Revise os títulos antes de publicar. Origem: ${result.highlights.map(item => `${item.label} · p. ${item.page}`).join("; ")}.`);
      }
    } catch (error) {
      if (controller.current === active) {
        const reason = active.signal.aborted ? active.signal.reason : error;
        setReadError(reason instanceof Error && reason.name !== "AbortError" ? reason.message : "Leitura cancelada. Você pode preencher manualmente."); setReadStatus("");
      }
    } finally { window.clearTimeout(timeout); if (controller.current === active) { controller.current = null; setReading(false); } }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage(""); setCoverError(""); setPdfError("");
    let id = createdId;
    let publicationCreated = Boolean(createdId);
    let failedUpload: "cover" | "pdf" = "cover";
    try {
      if (!id) {
        const data = new FormData(event.currentTarget);
        const token = await getCmsAccessToken();
        try { await validateCmsUpload(data.get("cover") as File, "magazineCover"); } catch (error) { setCoverError(error instanceof Error ? error.message : "Falha ao validar a capa."); throw error; }
        failedUpload = "pdf";
        try { await validateCmsUpload(data.get("pdf") as File, "pdf"); } catch (error) { setPdfError(error instanceof Error ? error.message : "Falha ao validar o PDF."); throw error; }
        setMessage("Enviando capa e PDF…");
        failedUpload = "cover";
        let cover: string; try { cover = await uploadCover(data.get("cover")); } catch (error) { setCoverError(error instanceof Error ? error.message : "Falha ao enviar a capa."); throw error; }
        failedUpload = "pdf";
        let pdf: string; try { pdf = await uploadPublicationPdf(data.get("pdf"), token, "magazines"); } catch (error) { setPdfError(error instanceof Error ? error.message : "Falha ao enviar o PDF."); throw error; }
        // Assign the ID before insertion so retrying editorial save never creates another edition.
        id = crypto.randomUUID();
        const response = await fetch(`${SUPABASE_URL}/rest/v1/site_magazines`, { method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${await getCmsAccessToken()}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ id, title: data.get("title"), edition: data.get("edition"), cover_url: cover, pdf_url: pdf, published_at: data.get("published_at"), active: data.get("active") === "on" }) });
        if (!response.ok) throw new Error("Não foi possível cadastrar a revista. Confira sua sessão e a permissão do perfil.");
        setCreatedId(id); publicationCreated = true;
      }
      if (createdId || editorial.summary.trim() || editorial.highlights.some(item => item.text.trim())) await saveMagazineEditorial(id, editorial);
      setSaved(true); setMessage("Revista e conteúdo de Nessa edição salvos com sucesso.");
    } catch (error) {
      const errorText = `${publicationCreated ? "A revista foi cadastrada, mas Nessa edição não foi salvo. Use Salvar Nessa edição para tentar novamente, sem reenviar os arquivos. " : ""}${error instanceof Error ? error.message : "Erro ao cadastrar."}`;
      if (failedUpload === "cover") setCoverError(errorText);
      else setPdfError(errorText);
      setMessage(errorText);
    } finally { setLoading(false); }
  }
  return <><form ref={formRef} className="settings-form" onSubmit={submit}>
    <fieldset className="settings-form form-span-full" disabled={loading || Boolean(createdId)}><legend>Dados da revista</legend>
      <label>Título<input name="title" required placeholder="Ex.: Setembro 2026" /></label><label>Edição<input name="edition" required placeholder="Ex.: Especial Primavera" /></label>
      <label>Data da edição<input name="published_at" type="date" required /></label><label><input name="active" type="checkbox" defaultChecked /> Publicada</label>
      <label>Capa da revista<input name="cover" type="file" accept="image/png,image/jpeg,image/webp" required />{coverError ? <small className="cms-upload-error" role="alert">{coverError}</small> : null}<UploadRequirements rule="magazineCover" /></label>
      <label>Arquivo PDF<input name="pdf" type="file" accept="application/pdf,.pdf" required onChange={event => { const file = event.target.files?.[0] ?? null; setSelectedPdf(file); setEditorial(emptyMagazineEditorial); setReadStatus(""); setReadError(""); controller.current?.abort(); if (file) void readPdf(file); }} />{pdfError ? <small className="cms-upload-error" role="alert">{pdfError}</small> : null}<UploadRequirements rule="pdf">A leitura automática começa ao selecionar o arquivo, antes de publicar.</UploadRequirements></label>
    </fieldset>
    <fieldset className="settings-form form-span-full" disabled={loading || reading}><legend>Nessa edição · revise antes de publicar</legend>
      <p className="form-span-full">O resumo e os destaques são sugeridos a partir do texto do PDF. Você pode corrigir ou preencher manualmente. PDFs em imagem precisam de OCR, ainda não incluído.</p>
      <label className="form-span-full">Resumo<textarea rows={4} maxLength={700} value={editorial.summary} onChange={event => { setSaved(false); setEditorial({ ...editorial, summary: event.target.value }); }} /></label>
      {editorial.highlights.map((item, index) => <div className="settings-form form-span-full" key={index}><label>Quadro<input value={item.label} maxLength={60} onChange={event => { setSaved(false); setEditorial({ ...editorial, highlights: editorial.highlights.map((row, i) => i === index ? { ...row, label: event.target.value } : row) }); }} /></label><label>Título da matéria<input value={item.text} maxLength={200} onChange={event => { setSaved(false); setEditorial({ ...editorial, highlights: editorial.highlights.map((row, i) => i === index ? { ...row, text: event.target.value } : row) }); }} /></label><Button variant="secondary" type="button" onClick={() => { setSaved(false); setEditorial({ ...editorial, highlights: editorial.highlights.filter((_, i) => i !== index) }); }}>Remover destaque {index + 1}</Button></div>)}
      <Button variant="secondary" type="button" disabled={editorial.highlights.length >= 8} onClick={() => { setSaved(false); setEditorial({ ...editorial, highlights: [...editorial.highlights, { label: "", text: "" }] }); }}>Adicionar destaque</Button>
      {!createdId && selectedPdf && <Button variant="secondary" type="button" onClick={() => { if (selectedPdf) void readPdf(selectedPdf); }}>Ler PDF novamente e substituir sugestão</Button>}
    </fieldset>
    <div className="form-span-full" role="status">{readStatus}</div>{readError && <p className="form-span-full" role="alert">{readError}</p>}
    {reading && <Button variant="ghost" type="button" onClick={() => controller.current?.abort()}>Cancelar leitura</Button>}
    <div className="form-actions"><Button variant="primary" type="submit" className="button" disabled={loading || reading || saved}>{loading ? "Salvando…" : createdId ? "Salvar Nessa edição" : "Publicar revista e Nessa edição"}</Button>{createdId && <Button variant="secondary" type="button" className="button button-secondary" disabled={loading} onClick={() => { formRef.current?.reset(); setSelectedPdf(null); setCreatedId(null); setSaved(false); setEditorial(emptyMagazineEditorial); setMessage(""); setReadStatus(""); setReadError(""); }}>Cadastrar outra edição</Button>}</div>
  </form>{message && <div className="form-status" role="status"><strong>{message}</strong>{createdId && <p><Link href="/admin/revistas?tab=settings">Editar ou reler esta edição em Revistas</Link></p>}</div>}</>;
}
