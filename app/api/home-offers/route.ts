import { NextResponse } from "next/server";
import { getLeafletAssets } from "@/lib/leaflet-assets";
import { loadHomeOffers } from "@/lib/home-offers-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const channel = new URL(request.url).searchParams.get("channel");
  if (channel !== "delivery" && channel !== "pharmacy") return NextResponse.json({ error: "Canal inválido." }, { status: 400 });
  try {
    const result = await loadHomeOffers(channel);
    const seals = result.status === "ready" && result.products.some(p => p.age_18 || p.breastfeeding_warning)
      ? await getLeafletAssets().then(assets => assets.filter(a => a.kind === "seal")).catch(() => []) : [];
    return NextResponse.json({ ...result, seals }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
  } catch {
    // Do not expose endpoint query parameters, headers or provider errors.
    return NextResponse.json({ status: "error", products: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
