import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./leaflets";
export type AnalyticsFilters = {
  from: string;
  to: string;
  path: string;
  device: string;
};
export type AnalyticsReport = {
  summary: {
    views: number;
    sessions: number;
    clicks: number;
    banner_clicks: number;
    downloads: number;
    average_seconds: number;
    last_event: string | null;
  };
  daily: { day: string; views: number; sessions: number }[];
  pages: {
    path: string;
    views: number;
    sessions: number;
    clicks: number;
    seconds: number;
  }[];
  banners: {
    target_id: string;
    label: string;
    impressions: number;
    clicks: number;
    ctr: number | null;
  }[];
  links: {
    event_type: string;
    label: string;
    destination: string;
    clicks: number;
  }[];
  devices: { device: string; views: number; sessions: number }[];
  sources: {
    source: string;
    medium: string;
    campaign: string;
    referrer_host: string;
    views: number;
    sessions: number;
  }[];
  depths: { depth: number; views: number }[];
  paths: string[];
};
export const deviceName = (value: string) =>
  ({ mobile: "Celular", tablet: "Tablet", desktop: "Desktop" })[value] || value;
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function analyticsRange(days: number): AnalyticsFilters {
  const to = today(),
    date = new Date(`${to}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days + 1);
  return { from: date.toISOString().slice(0, 10), to, path: "", device: "" };
}
export async function analyticsRpc<T>(
  name: string,
  body: object,
  signal: AbortSignal,
): Promise<T> {
  const token = sessionStorage.getItem("coopercica_admin_token");
  if (!token) throw new Error("Sua sessão expirou. Entre novamente no CMS.");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status))
      throw new Error(
        "Seu acesso ao relatório expirou ou não está autorizado.",
      );
    throw new Error(
      "Não foi possível consultar os analytics. Tente atualizar o painel.",
    );
  }
  return response.json();
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function analyticsCsv(
  report: AnalyticsReport,
  filters: AnalyticsFilters,
) {
  const rows: unknown[][] = [
    ["Analytics Coopercica", filters.from, filters.to],
    [
      "Página",
      filters.path || "Todas",
      "Dispositivo",
      deviceName(filters.device) || "Todos",
    ],
    [],
    ["Resumo", "Valor"],
    ...Object.entries(report.summary).map(([k, v]) => [k, v]),
    [],
    ["Data", "Visualizações", "Sessões"],
    ...report.daily.map((x) => [x.day, x.views, x.sessions]),
    [],
    [
      "Página",
      "Visualizações",
      "Sessões",
      "Cliques",
      "Segundos visíveis médios",
    ],
    ...report.pages.map((x) => [
      x.path,
      x.views,
      x.sessions,
      x.clicks,
      x.seconds,
    ]),
    [],
    ["Banner", "Exibições", "Cliques", "CTR (%)"],
    ...report.banners.map((x) => [x.label, x.impressions, x.clicks, x.ctr]),
    [],
    ["Interação", "Destino", "Cliques"],
    ...report.links.map((x) => [x.label, x.destination, x.clicks]),
    [],
    ["Origem", "Mídia", "Campanha", "Referência", "Sessões", "Visualizações"],
    ...report.sources.map((x) => [
      x.source,
      x.medium,
      x.campaign,
      x.referrer_host,
      x.sessions,
      x.views,
    ]),
    [],
    ["Dispositivo", "Sessões", "Visualizações"],
    ...report.devices.map((x) => [deviceName(x.device), x.sessions, x.views]),
    [],
    ["Rolagem (%)", "Páginas que atingiram"],
    ...report.depths.map((x) => [x.depth, x.views]),
  ];
  return "\ufeff" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
}
