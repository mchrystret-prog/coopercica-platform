import { ImageResponse } from "next/og";
import { getSiteSetting } from "@/lib/site";
import { socialImage } from "@/lib/social-sharing";
export const dynamic = "force-dynamic";
export const alt = "Coopercica — qualidade com você";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const settings = await getSiteSetting<Record<string, string>>("social_sharing", {});
  const image = socialImage(settings);
  if (image) {
    try {
      const response = await fetch(image, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      const type = response.headers.get("content-type")?.split(";")[0];
      if (response.ok && type && ["image/png", "image/jpeg", "image/webp"].includes(type)) {
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength <= 2 * 1024 * 1024) {
          const source = `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
          const generated = new ImageResponse(<img src={source} width={1200} height={630} alt="" />, size);
          return new Response(await generated.arrayBuffer(), { headers: { "Content-Type": contentType, "Cache-Control": "no-store" } });
        }
      }
    } catch { /* Keep the branded fallback if the uploaded image is unavailable. */ }
  }
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#1c4722", color: "white" }}><span style={{ fontSize: 88, fontWeight: 700 }}>Coopercica</span><span style={{ fontSize: 48, color: "#a8cf38", marginTop: 24 }}>Qualidade com você.</span><span style={{ fontSize: 27, marginTop: 64 }}>Uma história de cooperação desde 1969.</span></div>, { ...size, headers: { "Cache-Control": "no-store" } });
}
