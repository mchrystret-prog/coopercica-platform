"use client";
import { useState } from "react";
import { offerFields, offersConfig, publicHttps, type OffersChannel } from "@/lib/home-offers";
export function HomeOffersEditor({ settings, busy, onChange }: {
  settings: Record<string, Record<string, string>>; busy: boolean;
  onChange: (key: string, patch: Record<string, string>) => void;
}) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);
  async function test(channel: OffersChannel) {
    setTesting(channel);
    setMessages(current => ({ ...current, [channel]: "Consultando a configuração salva…" }));
    try {
      const response = await fetch(`/api/home-offers?channel=${channel}`, { cache: "no-store" });
      const data = await response.json();
      setMessages(current => ({ ...current, [channel]: response.ok && data.status === "ready"
        ? `${data.products.length} ofertas válidas recebidas.` : data.status === "disabled"
          ? "Integração desativada na configuração salva. Ative e salve antes de testar."
          : "Falha na consulta. Confira endpoint, host permitido, token e mapeamento dos campos." }));
    } catch { setMessages(current => ({ ...current, [channel]: "Não foi possível consultar a integração." })); }
    finally { setTesting(null); }
  }
  return <div className="cms-section-editor">
    <p>As ofertas aparecem dentro de Delivery e Drogaria na Home e usam o mesmo card da folheteria. Configure a API, salve e teste. Sem ativação da API, o preview de apresentação aparece por padrão e pode ser desativado abaixo. Os produtos reais sempre têm prioridade.</p>
    {(["delivery", "pharmacy"] as const).map(channel => {
      const key = `offers_${channel}`, value = settings[key] || {};
      const config = offersConfig(value, channel);
      const patch = (fields: Record<string, string>) => onChange(key, fields);
      return <article className="cms-section-card" key={channel}>
        <div className="cms-section-card-head"><h2>{channel === "delivery" ? "Delivery" : "Drogaria"} · ofertas via API</h2></div>
        <div className="settings-form">
          <label>Exibir carrossel<select disabled={busy} value={value.enabled || "false"} onChange={e => patch({ enabled: e.target.value })}><option value="false">Desativado</option><option value="true">Ativado</option></select></label>
          <label>Preview de apresentação<select disabled={busy} value={value.preview || "true"} onChange={e => patch({ preview: e.target.value })}><option value="true">Mostrar enquanto a API estiver desativada</option><option value="false">Não mostrar demonstração</option></select><small>Exibe cinco produtos com preços ilustrativos e aviso de preview. Os cards de demonstração não abrem páginas de compra.</small></label>
          <label>Título<input disabled={busy} maxLength={150} value={value.title ?? config.title} onChange={e => patch({ title: e.target.value })} /></label>
          <label>Endpoint HTTPS · GET JSON<input type="url" disabled={busy} value={value.endpoint || ""} onChange={e => patch({ endpoint: e.target.value })} placeholder="https://api.seu-fornecedor.com.br/ofertas" /><small>Não inclua senhas ou tokens na URL. Hosts do Delivery, Drogaria e sicomprasafe.yourintegration.top são permitidos. Para outro fornecedor, o T.I configura OFFERS_API_ALLOWED_HOSTS no servidor.</small></label>
          <label>Quantidade de produtos<input type="number" min={1} max={40} disabled={busy} value={value.limit ?? "12"} onChange={e => patch({ limit: e.target.value })} /></label>
          <label>Caminho da lista de produtos<input disabled={busy} value={value.productsPath || ""} onChange={e => patch({ productsPath: e.target.value })} placeholder="Ex.: products ou data.items" /><small>Deixe vazio se a resposta já for uma lista JSON.</small></label>
          <label>Autenticação<select disabled={busy} value={value.useToken || "false"} onChange={e => patch({ useToken: e.target.value })}><option value="false">API pública</option><option value="true">Bearer token no servidor</option></select><small>O T.I cadastra {channel === "delivery" ? "OFFERS_DELIVERY_TOKEN" : "OFFERS_PHARMACY_TOKEN"} nas variáveis do servidor. Nunca use NEXT_PUBLIC_ para esse token.</small></label>
        </div>
        <details><summary>Correspondência dos campos da API</summary><p>Use os nomes ou caminhos reais da resposta, como prices.regular. Campos opcionais podem ficar vazios. Nome e preço regular são obrigatórios. Valores numéricos devem vir em reais.</p><div className="settings-form">{Object.entries(offerFields).map(([field, label]) => <label key={field}>{label}<input disabled={busy} value={value[`field_${field}`] ?? field} onChange={e => patch({ [`field_${field}`]: e.target.value })} /></label>)}</div></details>
        <button type="button" className="button button-secondary" disabled={busy || testing !== null} onClick={() => test(channel)}>{testing === channel ? "Testando…" : "Testar configuração salva"}</button>
        {messages[channel] ? <p role="status">{messages[channel]}</p> : null}
      </article>;
    })}
  </div>;
}
export function validateOffersSettings(settings: Record<string, Record<string, string>>): string | null {
  for (const channel of ["delivery", "pharmacy"] as const) {
    const value = settings[`offers_${channel}`] || {};
    if (value.enabled !== "true") continue;
    if (!publicHttps(value.endpoint)) return `Informe um endpoint HTTPS válido para as ofertas de ${channel === "delivery" ? "Delivery" : "Drogaria"}.`;
    if (value.limit !== undefined && (!Number.isInteger(Number(value.limit)) || Number(value.limit) < 1 || Number(value.limit) > 40)) return "A quantidade de ofertas deve ser um número inteiro entre 1 e 40.";
    if (value.field_description === "" || value.field_regular_price === "") return "Mapeie os campos obrigatórios de nome e preço regular.";
  }
  return null;
}
