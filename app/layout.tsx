import type { Metadata } from "next";
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
  description: "Coopercica: tradição, proximidade, lojas, Delivery, Drogaria e Revista.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={montserrat.variable}><body>{children}<SiteAnalytics /></body></html>;
}
