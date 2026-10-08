"use client";
import { footerContactDefaults, socialNetworks } from "@/lib/footer-contact";
const labels: Record<string, string> = { title: "Título", description: "Descrição", whatsapp: "WhatsApp (código do país + DDD + número)", whatsappLabel: "Texto do botão WhatsApp", whatsappMessage: "Mensagem inicial do WhatsApp", email: "E-mail de atendimento", emailLabel: "Texto do botão de e-mail", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", linkedin: "LinkedIn" };
export function FooterContactEditor({ value, busy, onChange }: {
    value: Record<string, string>;
    busy: boolean;
    onChange: (patch: Record<string, string>) => void;
}) {
    const content = { ...footerContactDefaults, ...value };
    return <div className="cms-section-card">
    <div className="cms-section-card-head"><div><small>Todas as páginas · acima do rodapé</small><h2>Fale com a gente e redes sociais</h2></div></div>
    <p>Banner com fundo #A8CF38 e ícones das redes sociais na mesma cor, seguindo o brandbook.</p>
    <fieldset disabled={busy}><legend>Banner de atendimento</legend><div className="settings-form">
      <label>Cor de fundo do banner<input type="color" value={content.backgroundColor} onChange={e => onChange({ backgroundColor: e.target.value })}/></label>
      <label>Exibir banner<select value={content.enabled} onChange={e => onChange({ enabled: e.target.value })}><option value="true">Sim</option><option value="false">Não</option></select></label>
      {["title", "description", "whatsapp", "whatsappLabel", "whatsappMessage", "email", "emailLabel"].map(field => <label key={field}>{labels[field]}{field === "description" ? <textarea rows={3} maxLength={320} value={content[field]} onChange={e => onChange({ [field]: e.target.value })}/> : <input type={field === "email" ? "email" : field === "whatsapp" ? "tel" : "text"} maxLength={field === "whatsappMessage" ? 500 : 160} value={content[field]} onChange={e => onChange({ [field]: e.target.value })}/>}</label>)}
      <p className="form-span-full">O número 55 11 99999-9999 é apenas um exemplo. O botão do WhatsApp será ativado depois que você informar o número real. Deixe o número vazio para ocultar esse botão.</p>
    </div></fieldset>
    <fieldset disabled={busy}><legend>Redes sociais</legend><div className="settings-form"><label>Cor dos ícones<input type="color" value={content.socialColor} onChange={e => onChange({ socialColor: e.target.value })}/></label>{socialNetworks.map(network => <label key={network}>{labels[network]}<input type="url" value={content[network]} onChange={e => onChange({ [network]: e.target.value })}/><small>Deixe vazio para ocultar o ícone.</small></label>)}</div></fieldset>
    <p>Salve as alterações para publicar em todas as páginas.</p>
  </div>;
}
