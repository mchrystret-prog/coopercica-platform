import type { Metadata, Viewport } from "next";
import { siteOrigin, brandDescription, indexingEnabled, organizationGraph } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { DEFAULT_FAVICON, getSiteIdentity } from "@/lib/site";
import { MobileNavigationProvider } from "@/components/layout/MobileNavigation";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});


const baseMetadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  description: brandDescription,
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
    title: { default: identity.siteName, template: `%s | ${identity.siteName}` },
    applicationName: identity.siteName,
    icons: {
      icon: [{ url: favicon, type: "image/png" }],
      apple: [{ url: favicon, type: "image/png" }],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const identity = await getSiteIdentity();
  return <html lang="pt-BR" className={montserrat.variable}><body><StructuredData value={organizationGraph(identity.siteName)} /><MobileNavigationProvider deliveryUrl={identity.deliveryUrl}>{children}</MobileNavigationProvider><SiteAnalytics /></body></html>;
}
