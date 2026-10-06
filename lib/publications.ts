import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, getActiveLeaflets } from "@/lib/leaflets";
import { Publication, PublicationKind } from "@/types/publication";
export function validPublicationPdf(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try { const parsed = new URL(url); return parsed.origin === SUPABASE_URL && parsed.pathname.startsWith("/storage/v1/object/public/site-content/") && /\.pdf$/i.test(parsed.pathname); } catch { return false; }
}
export async function getPublications(kind?: PublicationKind): Promise<Publication[]> {
  const items: Publication[] = [];
  if (!kind || kind === "folheto") {
    const leaflets = await getActiveLeaflets();
    items.push(...leaflets.map((item) => ({ id: item.id, kind: "folheto" as const, title: item.name,
      edition: `Válido até ${new Date(item.ends_at + "T12:00:00").toLocaleDateString("pt-BR")}`, cover: item.cover_url || "",
      pdfFile: validPublicationPdf(item.pdf_url) ? item.pdf_url : null, pageCount: 0, published: true,
      startsAt: item.display_from || item.starts_at, endsAt: item.ends_at, updatedAt: item.starts_at })));
  }
  if (!kind || kind === "revista") {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/site_magazines?select=*&active=eq.true&order=published_at.desc`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, cache: "no-store" });
    if (!response.ok) throw new Error("Não foi possível carregar as revistas.");
    const rows: Array<{ id: string; title: string; edition: string; cover_url: string; pdf_url: string; published_at: string }> = await response.json();
    items.push(...rows.map((item) => ({ id: item.id, kind: "revista" as const, title: item.title, edition: item.edition,
      cover: item.cover_url || "", pdfFile: validPublicationPdf(item.pdf_url) ? item.pdf_url : null, pageCount: 0,
      published: true, startsAt: "", endsAt: "", updatedAt: item.published_at })));
  }
  return items;
}
export async function getPublication(id: string) { return (await getPublications()).find((item) => item.id === id); }
