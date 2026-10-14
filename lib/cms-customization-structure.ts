export type CustomizationTab = "identity" | "sections" | "history" | "careers" | "offers" | "videos" | "coopermais" | "partners" | "magazine" | "contact" | "sharing" | "faq";
export type CustomizationModule = "personalization" | "settings" | "magazines" | "careers" | "campaigns" | "media" | "stores" | "leaflets";
export const customizationModules: Record<CustomizationModule, { title: string; tabs: CustomizationTab[]; settings: string[]; sections: string[] }> = {
  personalization: { title: "Personalização", tabs: ["sections", "history", "partners", "faq"], settings: ["history_images", "home_partners", "home_faq"], sections: ["app-showcase", "delivery", "drogaria", "historia"] },
  settings: { title: "Configurações", tabs: ["identity", "contact", "sharing", "offers"], settings: ["identity", "footer_contact", "social_sharing", "offers_delivery", "offers_pharmacy"], sections: [] },
  magazines: { title: "Apresentação das revistas", tabs: ["sections", "magazine"], settings: [], sections: ["revista"] },
  careers: { title: "Apresentação do Portal de Vagas", tabs: ["careers"], settings: ["careers_hero"], sections: [] },
  campaigns: { title: "Banner Coopermais", tabs: ["coopermais"], settings: ["coopermais_banner"], sections: [] },
  media: { title: "Vídeos no site", tabs: ["videos"], settings: ["home_videos", "videos_header"], sections: [] },
  stores: { title: "Apresentação de Nossas Lojas", tabs: ["sections"], settings: [], sections: ["lojas"] },
  leaflets: { title: "Apresentação da Folheteria", tabs: ["sections"], settings: [], sections: ["ofertas"] },
};
export const customizationTabLabels: Record<CustomizationTab, string> = { identity: "Identidade visual", sections: "Seções da Home", history: "Nossa História", careers: "Arte do portal", offers: "Integrações de ofertas", videos: "Vídeos", coopermais: "Coopermais", partners: "Parceiros", magazine: "Resumo e destaques", contact: "Contatos e redes sociais", sharing: "Compartilhamento", faq: "Perguntas Frequentes" };
export const sectionDestinations: Record<string, { href: string; label: string }> = { lojas: { href: "/admin/lojas?tab=settings", label: "Lojas" }, revista: { href: "/admin/revistas?tab=settings", label: "Revistas" }, ofertas: { href: "/admin/folheteria?tab=settings", label: "Folheteria" } };
export const legacyCustomizationDestinations: Partial<Record<CustomizationTab, string>> = { identity: "/admin/configuracoes", contact: "/admin/configuracoes?tab=contact", sharing: "/admin/configuracoes?tab=sharing", offers: "/admin/configuracoes?tab=offers", magazine: "/admin/revistas?tab=settings", careers: "/admin/vagas?tab=settings", videos: "/admin/midias?tab=settings", coopermais: "/admin/campanhas?tab=settings" };
type Section = { id: string; label: string; sort_order: number; active: boolean; content: Record<string, string> };
export function customizationSavePayload(module: CustomizationModule, data: { settings: Record<string, Record<string, string>>; sections: Section[] }) {
  const config = customizationModules[module];
  const settings = Object.fromEntries(Object.entries(data.settings).filter(([key]) => config.settings.includes(key)));
  const sections = module === "personalization"
    ? data.sections.map(section => ({ id: section.id, sort_order: section.sort_order, active: section.active, ...(sectionDestinations[section.id] ? {} : { content: section.content }) }))
    : data.sections.filter(section => config.sections.includes(section.id)).map(section => ({ id: section.id, content: section.content }));
  return { p_settings: settings, p_sections: sections };
}
