import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./leaflets";
import { getCmsAccessToken } from "./cms-session";
import { publicationUploadError } from "./publication-upload-error";
import { validateCmsUpload } from "./cms-upload-validation";
export async function uploadPublicationPdf(value: FormDataEntryValue | null, token: string, folder: "magazines" | "leaflets") {
  if (!(value instanceof File) || !value.size) throw new Error("Selecione o PDF.");
  await validateCmsUpload(value, "pdf");
  const path = `${folder}/${crypto.randomUUID()}.pdf`;
  token = await getCmsAccessToken();
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-content/${path}`, {
    method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/pdf", "x-upsert": "false" }, body: value,
  });
  if (!response.ok) throw await publicationUploadError(response, "O PDF");
  return `${SUPABASE_URL}/storage/v1/object/public/site-content/${path}`;
}
