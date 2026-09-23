import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { getSiteIdentity } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

<html lang="pt-BR" className={montserrat.variable}></html>

export const metadata: Metadata = {
  title: { default: "Coopercica | Qualidade com você", template: "%s | Coopercica" },
  description: "Coopercica: tradição, proximidade, lojas, Delivery, Drogaria e Revista.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const identity=await getSiteIdentity();
  const vars={"--brand-green-900":identity.primaryColor,"--brand-green-500":identity.secondaryColor,"--brand-red-500":identity.accentColor,"--surface-page":identity.pageColor,"--text-heading":identity.primaryColor} as React.CSSProperties;
  return <html lang="pt-BR"><body style={vars}>{children}</body></html>;
}
