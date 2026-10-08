import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./leaflets";
import { getCmsAccessToken } from "./cms-session";
import { publicationUploadError } from "./publication-upload-error";
export async function uploadPublicationPdf(value: FormDataEntryValue | null, token: string, folder: "magazines" | "leaflets") {
  if (!(value instanceof File) || !value.size) throw new Error("Selecione o PDF.");
  if (value.size > 15 * 1024 * 1024) throw new Error("O PDF deve ter até 15 MB.");
  const bytes = await value.arrayBuffer();
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("Selecione um PDF válido.");
  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: true });
    if (pdf.getPageCount() < 1 || pdf.getPageCount() > 300) throw new Error();
  } catch { throw new Error("Use um PDF válido, sem senha, com até 300 páginas."); }
  const path = `${folder}/${crypto.randomUUID()}.pdf`;
  token = await getCmsAccessToken();
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-content/${path}`, {
    method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/pdf", "x-upsert": "false" }, body: value,
  });
  if (!response.ok) throw await publicationUploadError(response, "O PDF");
  return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
}
