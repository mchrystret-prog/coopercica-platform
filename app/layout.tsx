import type { Metadata } from "next";
import { siteOrigin, brandDescription, isPreview, organizationGraph } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});


export const metadata: Metadata = {
  title: { default: "Coopercica | Qualidade com você", template: "%s | Coopercica" },
  metadataBase: new URL(siteOrigin()),
  description: brandDescription,
  applicationName: "Coopercica",
  robots: isPreview() ? { index: false, follow: false } : { index: true, follow: true },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={montserrat.variable}><body><StructuredData value={organizationGraph()} />{children}<SiteAnalytics /></body></html>;
}
