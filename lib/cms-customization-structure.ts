export type CustomizationTab = "identity" | "sections" | "history" | "careers" | "offers" | "videos" | "coopermais" | "partners" | "magazine" | "contact" | "sharing" | "faq";
export type CustomizationModule = "personalization" | "settings" | "magazines";
export const customizationModules: Record<CustomizationModule, { title: string; tabs: CustomizationTab[]; settings: string[]; sections: string[] }> = {
  personalization: { title: "Personalização", tabs: ["identity", "sections", "history", "careers", "videos", "coopermais", "partners", "contact", "sharing", "faq"], settings: ["identity", "history_images", "careers_hero", "home_videos", "videos_header", "coopermais_banner", "home_partners", "footer_contact", "social_sharing", "home_faq"], sections: [] },
  settings: { title: "Configurações", tabs: ["offers"], settings: ["offers_delivery", "offers_pharmacy"], sections: [] },
  magazines: { title: "Nessa edição", tabs: ["magazine"], settings: [], sections: ["revista"] },
};
export const customizationTabLabels: Record<CustomizationTab, string> = { identity: "Identidade visual", sections: "Seções da Home", history: "Nossa História", careers: "Portal de Vagas", offers: "Integrações de ofertas", videos: "Vídeos", coopermais: "Coopermais", partners: "Parceiros", magazine: "Resumo e destaques", contact: "Contatos e redes sociais", sharing: "Compartilhamento", faq: "Perguntas Frequentes" };
export const legacyCustomizationDestinations: Partial<Record<CustomizationTab, string>> = { magazine: "/admin/revistas?tab=settings" };
type Section = { id: string; label: string; sort_order: number; active: boolean; content: Record<string, string> };
type Payload = { settings: Record<string, Record<string, string>>; sections: Section[] };
export function customizationSavePayload(module: CustomizationModule, data: Payload, current: Payload = data) {
  const config = customizationModules[module];
  const settings = Object.fromEntries(Object.entries(data.settings).filter(([key]) => config.settings.includes(key)));
  const sections = data.sections.filter(section => module === "personalization" || config.sections.includes(section.id)).map(section => {
    const latest = current.sections.find(item => item.id === section.id)?.content || section.content;
    if (module === "magazines") return { id: section.id, content: { ...latest, editionDetails: section.content.editionDetails || "{}" } };
    const presentation = Object.fromEntries(Object.entries(section.content).filter(([key]) => key !== "editionDetails"));
    return { id: section.id, active: section.active, sort_order: section.sort_order, content: section.id === "revista" ? { ...latest, ...presentation } : section.content };
  });
  return { p_settings: settings, p_sections: sections };
}
