import type { Metadata } from "next";
import { siteOrigin, brandDescription, indexingEnabled, organizationGraph } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { DEFAULT_FAVICON, getSiteIdentity } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});


const baseMetadata: Metadata = {
  title: { default: "Coopercica", template: "%s | Coopercica" },
  metadataBase: new URL(siteOrigin()),
  description: brandDescription,
  applicationName: "Coopercica",
  robots: !indexingEnabled() ? { index: false, follow: false, noarchive: true, nosnippet: true } : { index: true, follow: true },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const identity = await getSiteIdentity();
  const favicon = identity.favicon || DEFAULT_FAVICON;
  return {
    ...baseMetadata,
    icons: {
      icon: [{ url: favicon, type: "image/png" }],
      apple: [{ url: favicon, type: "image/png" }],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={montserrat.variable}><body><StructuredData value={organizationGraph()} />{children}<SiteAnalytics /></body></html>;
}
