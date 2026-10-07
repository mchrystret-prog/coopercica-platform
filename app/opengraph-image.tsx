import { ImageResponse } from "next/og";
export const alt = "Coopercica — qualidade com você";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#1c4722", color: "white" }}><span style={{ fontSize: 88, fontWeight: 700 }}>Coopercica</span><span style={{ fontSize: 48, color: "#a8cf38", marginTop: 24 }}>Qualidade com você.</span><span style={{ fontSize: 27, marginTop: 64 }}>Uma história de cooperação desde 1969.</span></div>, size);
}
