export const footerContactDefaults: Record<string, string> = {
    enabled: "true",
    backgroundColor: "#a8cf38",
    socialColor: "#a8cf38",
    title: "Fale com a gente",
    description: "Tem alguma dúvida, sugestão ou algo para compartilhar? Estamos aqui para ouvir você.",
    whatsapp: "5511999999999",
    whatsappHref: "/",
    whatsappLabel: "Chamar no WhatsApp",
    whatsappMessage: "Olá! Gostaria de falar com a Coopercica.",
    email: "faleconosco@coopercica.com.br",
    emailLabel: "Enviar e-mail",
    instagram: "https://www.instagram.com/ficaadica_coopercica/",
    facebook: "https://www.facebook.com/coopercica",
    youtube: "https://www.youtube.com/coopercicajundiai",
    linkedin: "https://www.linkedin.com/company/coopercica",
};
export const socialNetworks = ["instagram", "facebook", "youtube", "linkedin"] as const;
export type SocialNetwork = typeof socialNetworks[number];
export function safeSocialUrl(value: string): string | null {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
    }
    catch {
        return null;
    }
}
export function whatsappUrl(number: string, message: string): string | null {
    const digits = number.replace(/\D/g, "");
    if (!/^\d{10,15}$/.test(digits) || digits === footerContactDefaults.whatsapp)
        return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function validateFooterContact(value: Record<string, string>): string | null {
    const content = { ...footerContactDefaults, ...value };
    for (const field of ["backgroundColor", "socialColor"]) {
        if (!/^#[0-9a-f]{6}$/i.test(content[field])) return "Informe uma cor hexadecimal válida para o banner e os ícones.";
    }
    if (!content.title.trim())
        return "Informe o título de Fale com a gente.";
    if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(content.email))
        return "Informe um e-mail de atendimento válido.";
    if (content.whatsapp && !/^[+\d\s().-]+$/.test(content.whatsapp))
        return "Informe apenas o número do WhatsApp, com código do país e DDD.";
    if (content.whatsapp && !/^\d{10,15}$/.test(content.whatsapp.replace(/\D/g, "")))
        return "Informe o WhatsApp com código do país e DDD.";
    if (content.whatsappHref && contactWhatsappHref(content.whatsappHref) !== content.whatsappHref && !safeSocialUrl(content.whatsappHref)) return "Informe um destino válido para o botão WhatsApp: caminho do site ou link HTTPS.";
    for (const network of socialNetworks) {
        if (content[network] && !safeSocialUrl(content[network]))
            return `Informe um link HTTPS válido para ${network}.`;
    }
    return null;
}
export function footerContact(value: Record<string, string>) {
    const content = { ...footerContactDefaults, ...value };
    if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(content.email))
        content.email = footerContactDefaults.email;
    for (const field of ["backgroundColor", "socialColor"]) {
        if (!/^#[0-9a-f]{6}$/i.test(content[field])) content[field] = footerContactDefaults[field];
    }
    return content;
}

export function contactWhatsappHref(value: string): string {
    if (value.startsWith("/") && !value.startsWith("//") && !/[\\\s]/.test(value)) return value;
    return safeSocialUrl(value) || "/";
}
