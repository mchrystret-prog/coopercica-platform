"use client";
import { useRef, useState } from "react";
import { uploadPublicationPdf } from "@/lib/publication-upload";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
export function PublicationPdfField({ kind, id, currentUrl }: { kind: "leaflet" | "magazine"; id: string; currentUrl: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState(currentUrl);
  async function upload() {
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) { setMessage("Entre no CMS novamente."); return; }
    setBusy(true); setMessage("");
    try {
      const pdfUrl = await uploadPublicationPdf(input.current?.files?.[0] || null, token, kind === "leaflet" ? "leaflets" : "magazines");
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_set_publication_pdf`, { method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_kind: kind, p_id: id, p_url: pdfUrl }) });
      if (!response.ok) throw new Error("O PDF foi enviado, mas não foi vinculado à publicação. Tente novamente.");
      setUrl(pdfUrl); if (input.current) input.current.value = ""; setMessage("PDF salvo e disponível para folhear quando a publicação estiver no ar.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar o PDF."); }
    finally { setBusy(false); }
  }
  return <fieldset className="form-span-full" disabled={busy}><legend>PDF para folhear</legend><label>Enviar ou substituir PDF<input ref={input} type="file" accept="application/pdf,.pdf" /><small>Até 15 MB e 300 páginas, sem senha. O envio é salvo separadamente dos demais campos.</small></label><button type="button" className="button" onClick={upload}>{busy ? "Enviando…" : "Salvar PDF"}</button>{url && url !== "#" ? <a href={url} target="_blank" rel="noopener noreferrer">Abrir PDF atual</a> : null}{message ? <p role="status">{message}</p> : null}</fieldset>;
}
