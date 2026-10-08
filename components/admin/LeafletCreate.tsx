"use client";
import { FormEvent, useState } from "react";
import { LeafletAdmin } from "./LeafletAdmin";
import { uploadPublicationPdf } from "@/lib/publication-upload";
import { getCmsAccessToken } from "@/lib/cms-session";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
export function LeafletCreate({ libraryRevision }: { libraryRevision: number }) {
  const [mode, setMode] = useState("sheet");
  return <><div className="cms-custom-tabs"><button type="button" data-active={mode === "sheet"} onClick={() => setMode("sheet")}>Importar planilha</button><button type="button" data-active={mode === "pdf"} onClick={() => setMode("pdf")}>Enviar folheto PDF</button></div>{mode === "sheet" ? <LeafletAdmin libraryRevision={libraryRevision} /> : <PdfLeafletForm />}</>;
}
function PdfLeafletForm() {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, data = new FormData(form);
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) { setMessage("Entre no CMS novamente."); return; }
    setBusy(true); setMessage("");
    try {
      const starts = String(data.get("starts_at")), ends = String(data.get("ends_at")), display = String(data.get("display_from"));
      if (starts > ends || display > ends) throw new Error("Confira as datas de exibição e vigência.");
      const pdfUrl = await uploadPublicationPdf(data.get("pdf"), token, "leaflets");
      const currentToken = await getCmsAccessToken();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_create_pdf_leaflet`, { method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${currentToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_data: { name: data.get("name"), display_from: display, starts_at: starts, ends_at: ends, status: data.get("status"), pdf_url: pdfUrl } }) });
      if (!response.ok) throw new Error("Não foi possível cadastrar o folheto. Confira sua sessão e as datas.");
      form.reset(); setMessage("Folheto cadastrado. A publicação respeita o status e as datas escolhidas.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível cadastrar."); }
    finally { setBusy(false); }
  }
  return <><form onSubmit={submit}><fieldset className="settings-form" disabled={busy}><legend>Novo folheto em PDF</legend><label>Nome do folheto<input name="name" required maxLength={160} /></label><label>Exibir a partir de<input name="display_from" type="date" required /></label><label>Início da vigência<input name="starts_at" type="date" required /></label><label>Fim da vigência<input name="ends_at" type="date" required /></label><label>Status<select name="status" defaultValue="draft"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label><label>Arquivo PDF<input name="pdf" type="file" accept="application/pdf,.pdf" required /><small>Até 15 MB e 300 páginas, sem senha.</small></label><button className="button" disabled={busy}>{busy ? "Enviando…" : "Salvar folheto"}</button></fieldset></form>{message ? <p role="status">{message}</p> : null}</>;
}
