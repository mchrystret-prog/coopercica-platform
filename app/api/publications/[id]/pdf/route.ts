import { getPublication } from "@/lib/publications";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const item = await getPublication((await params).id);
  if (!item?.pdfFile) return new Response("PDF não encontrado.", { status: 404 });
  const url = new URL(item.pdfFile);
  if (new URL(request.url).searchParams.get("download") === "1") url.searchParams.set("download", `${item.kind}-${item.id}.pdf`);
  return new Response(null, { status: 302, headers: { Location: url.href, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}
