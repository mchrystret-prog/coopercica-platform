import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./leaflets";
import { getCmsAccessToken } from "./cms-session";
import { magazineEditorials, type MagazineEditorial } from "./magazine-editorial";

/** Reuse the existing RPC; update only the magazine section, never unrelated settings. */
export async function saveMagazineEditorial(id: string, editorial: MagazineEditorial) {
  const token = await getCmsAccessToken();
  const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const current = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_get_site_customization`, { method: "POST", headers, body: "{}" });
  if (!current.ok) throw new Error("Não foi possível carregar o conteúdo de Nessa edição.");
  const payload = await current.json();
  const section = payload.sections?.find((item: { id: string }) => item.id === "revista");
  if (!section?.content) throw new Error("A seção Revista não está configurada na personalização.");
  const content = { ...section.content, editionDetails: JSON.stringify({ ...magazineEditorials(section.content), [id]: editorial }) };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_save_site_customization`, {
    method: "POST", headers: { ...headers, Authorization: `Bearer ${await getCmsAccessToken()}` },
    body: JSON.stringify({ p_settings: {}, p_sections: [{ id: "revista", content }] }),
  });
  if (!response.ok || (await response.json()) !== true) throw new Error("Não foi possível salvar Nessa edição. Tente salvar novamente ou use Personalização → Revista.");
}
