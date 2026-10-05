"use client";

import { useEffect, useState } from "react";
import {
  analyticsCsv,
  analyticsRange,
  analyticsRpc,
  deviceName,
  today,
  type AnalyticsFilters,
  type AnalyticsReport,
} from "@/lib/analytics-report";
import { AnalyticsHeatmap } from "./AnalyticsHeatmap";
import styles from "./AnalyticsDashboard.module.css";

const number = (value: number) => value.toLocaleString("pt-BR");
const pageName = (value: string) => (value === "/" ? "Início" : value);
function exportReport(report: AnalyticsReport, filters: AnalyticsFilters) {
  const url = URL.createObjectURL(
    new Blob([analyticsCsv(report, filters)], {
      type: "text/csv;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-coopercica-${filters.from}-${filters.to}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function AnalyticsDashboard() {
  const [filters, setFilters] = useState(() => analyticsRange(7));
  const [revision, setRevision] = useState(0);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<
    "overview" | "banners" | "interactions" | "heatmap"
  >("overview");
  const periodDays =
    (Date.parse(filters.to) - Date.parse(filters.from)) / 86400000;
  const valid =
    Number.isFinite(periodDays) && periodDays >= 0 && periodDays <= 89;
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");
      if (!valid) {
        setError(
          "Escolha um período de até 90 dias, com início anterior ao fim.",
        );
        setLoading(false);
        return;
      }
      try {
        const result = await analyticsRpc<AnalyticsReport>(
          "cms_site_analytics_report",
          {
            p_from: filters.from,
            p_to: filters.to,
            p_path: filters.path || null,
            p_device: filters.device || null,
          },
          controller.signal,
        );
        if (!controller.signal.aborted) setReport(result);
      } catch (err) {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "Falha ao carregar.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [filters.from, filters.to, filters.path, filters.device, revision, valid]);
  const change = (key: keyof AnalyticsFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const chartMax = Math.max(1, ...(report?.daily.map((x) => x.views) || []));
  return (
    <section className={`admin-page ${styles.dashboard}`}>
      <header className={styles.heading}>
        <div>
          <span className="eyebrow">Desempenho do site</span>
          <h1>Analytics</h1>
          <p>
            Entenda as visitas, as campanhas e os caminhos que as pessoas seguem
            no site.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setRevision((x) => x + 1)}
            disabled={loading}
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={() => report && exportReport(report, filters)}
            disabled={!report || loading || !!error}
          >
            Exportar CSV
          </button>
        </div>
      </header>
      <div className={styles.filters}>
        <label>
          De
          <input
            type="date"
            value={filters.from}
            max={filters.to}
            onChange={(e) => change("from", e.target.value)}
          />
        </label>
        <label>
          Até
          <input
            type="date"
            value={filters.to}
            min={filters.from}
            max={today()}
            onChange={(e) => change("to", e.target.value)}
          />
        </label>
        <label>
          Página
          <select
            value={filters.path}
            onChange={(e) => change("path", e.target.value)}
          >
            <option value="">Todas as páginas</option>
            {[
              ...new Set([
                "/",
                ...(report?.paths || []),
                ...(filters.path ? [filters.path] : []),
              ]),
            ].map((path) => (
              <option key={path} value={path}>
                {pageName(path)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dispositivo
          <select
            value={filters.device}
            onChange={(e) => change("device", e.target.value)}
          >
            <option value="">Todos</option>
            {["desktop", "mobile", "tablet"].map((value) => (
              <option key={value} value={value}>
                {deviceName(value)}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.presets}>
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() =>
                setFilters({
                  ...analyticsRange(days),
                  path: filters.path,
                  device: filters.device,
                })
              }
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>
      <p className={styles.status} role="status">
        {loading
          ? "Atualizando relatório…"
          : report?.summary.last_event
            ? `Último evento do período: ${new Date(report.summary.last_event).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
            : "Aguardando os primeiros eventos deste período."}
      </p>
      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}
      <nav className={styles.tabs} aria-label="Relatórios de analytics">
        {(
          [
            ["overview", "Visão geral"],
            ["banners", "Banners"],
            ["interactions", "Cliques e rolagem"],
            ["heatmap", "Mapa de calor"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "heatmap" && valid ? (
        <AnalyticsHeatmap
          filters={filters}
          paths={report?.paths || ["/"]}
          revision={revision}
        />
      ) : null}
      {report && !error && tab !== "heatmap" ? (
        <div aria-busy={loading} className={loading ? styles.loading : ""}>
          <div className={styles.metrics}>
            {[
              ["Visualizações de página", report.summary.views],
              ["Sessões", report.summary.sessions],
              ["Cliques no site", report.summary.clicks],
              ["Cliques em banners", report.summary.banner_clicks],
              ["PDFs abertos", report.summary.downloads],
              [
                "Tempo visível médio / página",
                `${number(report.summary.average_seconds)} s`,
              ],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <strong>
                  {typeof value === "number" ? number(value) : value}
                </strong>
              </article>
            ))}
          </div>
          {!report.summary.last_event ? (
            <div className={styles.empty}>
              <strong>A coleta começa com as visitas ao site publicado.</strong>
              <p>
                Não há histórico anterior à implantação. São contabilizadas as
                visitas que permitem analytics; acessos ao CMS e à prévia do
                mapa são excluídos.
              </p>
            </div>
          ) : null}
          {tab === "overview" ? (
            <>
              <article className={styles.panel}>
                <h2>Visualizações ao longo do período</h2>
                <div
                  className={styles.chart}
                  role="img"
                  aria-label="Visualizações diárias; valores disponíveis na tabela abaixo."
                >
                  {report.daily.map((day) => (
                    <div
                      key={day.day}
                      title={`${day.day}: ${number(day.views)} visualizações`}
                    >
                      <span
                        style={{ height: `${(day.views / chartMax) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.chartLabels}>
                  <span>{report.daily[0]?.day}</span>
                  <span>{report.daily.at(-1)?.day}</span>
                </div>
                <details>
                  <summary>Ver dados por dia</summary>
                  <div className={styles.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>Dia</th>
                          <th>Visualizações</th>
                          <th>Sessões</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.daily.map((day) => (
                          <tr key={day.day}>
                            <td>{day.day}</td>
                            <td>{number(day.views)}</td>
                            <td>{number(day.sessions)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </article>
              <article className={styles.panel}>
                <h2>Páginas mais acessadas</h2>
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Página</th>
                        <th>Visualizações</th>
                        <th>Sessões</th>
                        <th>Cliques</th>
                        <th>Tempo visível médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.pages.map((page) => (
                        <tr key={page.path}>
                          <td>{pageName(page.path)}</td>
                          <td>{number(page.views)}</td>
                          <td>{number(page.sessions)}</td>
                          <td>{number(page.clicks)}</td>
                          <td>{number(page.seconds)} s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!report.pages.length ? (
                  <p>Sem visitas neste período.</p>
                ) : null}
              </article>
              <div className={styles.columns}>
                <article className={styles.panel}>
                  <h2>Dispositivos</h2>
                  {report.devices.map((device) => (
                    <div className={styles.statRow} key={device.device}>
                      <span>{deviceName(device.device)}</span>
                      <strong>{number(device.views)} visualizações</strong>
                      <small>{number(device.sessions)} sessões</small>
                    </div>
                  ))}
                </article>
                <article className={styles.panel}>
                  <h2>Origem do tráfego</h2>
                  <p>
                    Origem, mídia e campanha são preservadas durante a sessão.
                  </p>
                  <div className={styles.tableWrap}>
                    <table>
                      <thead>
                        <tr>
                          <th>Origem / mídia</th>
                          <th>Campanha</th>
                          <th>Sessões</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.sources.map((source, i) => (
                          <tr key={i}>
                            <td>
                              {source.source || "direto"}
                              <small>
                                {source.medium}
                                {source.referrer_host
                                  ? ` · ${source.referrer_host}`
                                  : ""}
                              </small>
                            </td>
                            <td>{source.campaign || "—"}</td>
                            <td>{number(source.sessions)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              </div>
            </>
          ) : null}
          {tab === "banners" ? (
            <article className={styles.panel}>
              <h2>Desempenho dos banners</h2>
              <p>
                Uma exibição é contabilizada quando pelo menos metade do banner
                ativo fica visível por um segundo ou recebe um clique. O CTR usa
                as exibições com clique; cliques repetidos também entram no
                total.
              </p>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Banner</th>
                      <th>Exibições</th>
                      <th>Cliques</th>
                      <th>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.banners.map((banner) => (
                      <tr key={banner.target_id}>
                        <td>{banner.label || banner.target_id}</td>
                        <td>{number(banner.impressions)}</td>
                        <td>{number(banner.clicks)}</td>
                        <td>
                          {banner.ctr === null ? "—" : `${number(banner.ctr)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!report.banners.length ? (
                <p>Sem eventos de banner neste período.</p>
              ) : null}
            </article>
          ) : null}
          {tab === "interactions" ? (
            <>
              <article className={styles.panel}>
                <h2>Links e arquivos</h2>
                <p>
                  Abertura de PDF mede o clique para acessar o arquivo; não
                  confirma leitura ou download concluído.
                </p>
                <div className={styles.tableWrap}>
                  <table>
                    <thead>
                      <tr>
                        <th>Interação</th>
                        <th>Destino</th>
                        <th>Tipo</th>
                        <th>Cliques</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.links.map((link, i) => (
                        <tr key={i}>
                          <td>{link.label}</td>
                          <td>{link.destination || "—"}</td>
                          <td>
                            {link.event_type === "download"
                              ? "PDF / arquivo"
                              : "Link"}
                          </td>
                          <td>{number(link.clicks)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!report.links.length ? (
                  <p>Sem cliques em links ou arquivos neste período.</p>
                ) : null}
              </article>
              <article className={styles.panel}>
                <h2>Profundidade de rolagem</h2>
                <p>
                  Quantidade de visualizações de página que alcançaram cada
                  trecho. A primeira tela visível já conta como conteúdo
                  alcançado.
                </p>
                {report.depths.map((depth) => (
                  <div className={styles.depth} key={depth.depth}>
                    <span>{depth.depth}% da página</span>
                    <div>
                      <span
                        style={{
                          width: `${Math.min(100, (depth.views / Math.max(1, report.summary.views)) * 100)}%`,
                        }}
                      />
                    </div>
                    <strong>{number(depth.views)}</strong>
                  </div>
                ))}
              </article>
            </>
          ) : null}
          <p className={styles.note}>
            Sessões são identificadas por aba e expiram após 30 minutos sem
            eventos. Não representam pessoas únicas. Os dados são mantidos por
            90 dias; bloqueadores e recusa de analytics reduzem a contagem.
          </p>
        </div>
      ) : null}
    </section>
  );
}
