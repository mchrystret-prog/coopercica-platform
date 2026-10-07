import type { Metadata } from "next";
import type { Store } from "../data/stores";
import type { Job } from "./jobs";
import { openingHoursFromText } from "./store-hours";
export const brandDescription = "Coopercica: cooperativa de consumo desde 1969, com lojas em Jundiaí, Itupeva, Campo Limpo Paulista e Várzea Paulista. Conheça ofertas, Delivery, Drogaria e vagas.";
export function siteOrigin(value = process.env.SITE_URL || "https://coopercica-platform.vercel.app") {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("SITE_URL deve ser a origem HTTPS pública do site, sem caminho ou credenciais.");
  return url.origin;
}
export const absoluteUrl = (path: string) => new URL(path, `${siteOrigin()}/`).href;
export const isPreview = () => process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title, description, alternates: { canonical: absoluteUrl(path) },
    robots: isPreview() ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { type: "website", locale: "pt_BR", siteName: "Coopercica", title: `${title} | Coopercica`, description, url: absoluteUrl(path), images: [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "Coopercica — qualidade com você" }] },
    twitter: { card: "summary_large_image", title: `${title} | Coopercica`, description, images: [absoluteUrl("/opengraph-image")] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"); }
export function organizationGraph() {
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "Coopercica", legalName: "Cooperativa de Consumo Coopercica", url: siteOrigin(), logo: absoluteUrl("/images/logo.png"), foundingDate: "1969-04-14", description: brandDescription, areaServed: ["Jundiaí", "Itupeva", "Campo Limpo Paulista", "Várzea Paulista"].map(name => ({ "@type": "City", name })) },
    { "@type": "WebSite", "@id": absoluteUrl("/#website"), url: siteOrigin(), name: "Coopercica", inLanguage: "pt-BR", publisher: { "@id": absoluteUrl("/#organization") } },
  ] };
}
export function breadcrumbs(items: Array<{ name: string; path: string }>) { return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) }; }
export function storeSchema(store: Store) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return { "@context": "https://schema.org", "@type": "GroceryStore", "@id": absoluteUrl(`/lojas/${store.slug}#store`), name: `Coopercica ${store.name}`, url: absoluteUrl(`/lojas/${store.slug}`), parentOrganization: { "@id": absoluteUrl("/#organization") },
    address: { "@type": "PostalAddress", streetAddress: store.address, addressLocality: store.city, addressRegion: "SP", addressCountry: "BR" },
    ...(store.phone ? { telephone: store.phone } : {}), ...(store.image ? { image: absoluteUrl(store.image) } : {}),
    openingHoursSpecification: Object.entries(openingHoursFromText(store.hours)).flatMap(([day, intervals]) => intervals.map(interval => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${days[Number(day)]}`, ...interval }))),
  };
}
export function jobIsCurrent(job: Job, now = Date.now()) {
  if (job.status !== "open") return false;
  if (!job.closes_on) return true;
  const expiry = Date.parse(`${job.closes_on}T23:59:59.999-03:00`);
  return Number.isFinite(expiry) && expiry >= now;
}
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export function jobSchema(job: Job, now = Date.now()) {
  const cities = ["Jundiaí", "Itupeva", "Campo Limpo Paulista", "Várzea Paulista"];
  // CMS has no remote eligibility country field. Never infer that restriction.
  if (!jobIsCurrent(job, now) || job.work_mode === "remote" || !cities.includes(job.city) || !job.description || !Number.isFinite(Date.parse(job.created_at))) return null;
  const employment: Record<string, string> = { temporary: "TEMPORARY", apprentice: "OTHER", internship: "INTERN" };
  return { "@context": "https://schema.org", "@type": "JobPosting", "@id": absoluteUrl(`/vagas/${job.slug}#job`), url: absoluteUrl(`/vagas/${job.slug}`), title: job.title,
    description: [["Sobre a oportunidade", job.description], ["Responsabilidades", job.responsibilities], ["O que buscamos", job.requirements], ["Benefícios", job.benefits]].filter(([, text]) => text).map(([heading, text]) => `<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`).join(""),
    datePosted: job.created_at, ...(job.closes_on ? { validThrough: `${job.closes_on}T23:59:59-03:00` } : {}),
    hiringOrganization: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: "Coopercica", sameAs: siteOrigin(), logo: absoluteUrl("/images/logo.png") },
    identifier: { "@type": "PropertyValue", name: "Coopercica", value: job.id },
    jobLocation: { "@type": "Place", ...(job.unit ? { name: job.unit } : {}), address: { "@type": "PostalAddress", addressLocality: job.city, addressRegion: "SP", addressCountry: "BR" } },
    ...(employment[job.employment_type] ? { employmentType: employment[job.employment_type] } : {}), totalJobOpenings: job.openings,
  };
}
