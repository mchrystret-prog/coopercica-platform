"use client";

import { useEffect, useState } from "react";
import {
  analyticsRpc,
  deviceName,
  type AnalyticsFilters,
} from "@/lib/analytics-report";
import styles from "./AnalyticsDashboard.module.css";

type Session = {
  session_id: string;
  started_at: string;
  ended_at: string;
  entry_path: string;
  exit_path: string;
  device: string;
  source: string;
  medium: string;
  campaign: string;
  views: number;
  pages: number;
  clicks: number;
  active_seconds: number;
  max_depth: number;
  rage_clicks: number;
  non_interactive_clicks: number;
  conversions: number;
};
type SessionsReport = {
  total: number;
  sessions: Session[];
  sources: string[];
  campaigns: string[];
  summary: {
    sessions: number;
    rage_sessions: number;
    non_interactive_sessions: number;
    conversion_sessions: number;
    average_active_seconds: number;
  };
  hotspots: {
    path: string;
    target_id: string;
    label: string;
    rage_clicks: number;
    non_interactive_clicks: number;
  }[];
};
type JourneyEvent = {
  event_id: string;
  page_view_id: string;
  at: string;
  approximate_time: boolean;
  event_type: string;
  path: string;
  label: string;
  destination: string;
  value: number;
};
type Journey = { total: number; events: JourneyEvent[] };
const num = (n: number) => n.toLocaleString("pt-BR");
const clock = (at: string) =>
  new Date(at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
const eventName: Record<string, string> = {
  page_view: "Página aberta",
  banner_view: "Banner exibido",
  banner_click: "Clique no banner",
  link_click: "Clique em link",
  download: "Arquivo aberto",
  scroll_depth: "Rolagem alcançada",
  engagement: "Tempo com a página visível",
  click: "Clique",
  rage_click: "Cliques repetidos",
  non_interactive_click: "Clique em área sem ação",
};

export function AnalyticsSessions({
  filters,
  revision,
  onMap,
}: {
  filters: AnalyticsFilters;
  revision: number;
  onMap: (path: string, device: string) => void;
}) {
  const [source, setSource] = useState("");
  const [campaign, setCampaign] = useState("");
  const [signal, setSignal] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Session | null>(null);
  const [report, setReport] = useState<SessionsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");
      try {
        const result = await analyticsRpc<SessionsReport>(
          "cms_site_analytics_sessions",
          {
            p_from: filters.from,
            p_to: filters.to,
            p_path: filters.path || null,
            p_device: filters.device || null,
            p_source: source === "__direct__" ? "" : source || null,
            p_campaign: campaign || null,
            p_signal: signal || null,
            p_offset: offset,
          },
          controller.signal,
        );
        if (!controller.signal.aborted) setReport(result);
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Falha ao carregar sessões.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [
    filters.from,
    filters.to,
    filters.path,
    filters.device,
    source,
    campaign,
    signal,
    offset,
    revision,
  ]);
  const change = (set: (value: string) => void, value: string) => {
    set(value);
    setOffset(0);
    setSelected(null);
  };
  return (
    <>
      <div className={styles.filters}>
        <label>
          Origem
          <select
            value={source}
            onChange={(e) => change(setSource, e.target.value)}
          >
            <option value="">Todas as origens</option>
            <option value="__direct__">Direto / sem origem</option>
            {[
              ...new Set([
                ...(report?.sources || []),
                ...(source && source !== "__direct__" ? [source] : []),
              ]),
            ]
              .filter(Boolean)
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </label>
        <label>
          Campanha
          <select
            value={campaign}
            onChange={(e) => change(setCampaign, e.target.value)}
          >
            <option value="">Todas as campanhas</option>
            {[
              ...new Set([
                ...(report?.campaigns || []),
                ...(campaign ? [campaign] : []),
              ]),
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Comportamento
          <select
            value={signal}
            onChange={(e) => change(setSignal, e.target.value)}
          >
            <option value="">Todas as sessões</option>
            <option value="rage">Com cliques repetidos</option>
            <option value="non_interactive">
              Com cliques em áreas sem ação
            </option>
            <option value="conversion">Com CTA ou arquivo aberto</option>
          </select>
        </label>
      </div>
      {loading ? <p role="status">Carregando sessões…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {report && !error ? (
        <div aria-busy={loading} className={loading ? styles.loading : ""}>
          <div className={styles.metrics}>
            {[
              ["Sessões no filtro", report.summary.sessions],
              ["Sessões com cliques repetidos", report.summary.rage_sessions],
              [
                "Sessões com cliques em áreas sem ação",
                report.summary.non_interactive_sessions,
              ],
              [
                "Sessões com CTA ou arquivo",
                report.summary.conversion_sessions,
              ],
              [
                "Tempo visível médio / sessão",
                `${num(report.summary.average_active_seconds)} s`,
              ],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <strong>
                  {typeof value === "number" ? num(value) : value}
                </strong>
              </article>
            ))}
          </div>
          <article className={styles.panel}>
            <h2>Sessões e jornada dos visitantes</h2>
            <p>
              Abra uma sessão para acompanhar os eventos em ordem. Os números
              respeitam os filtros acima; a jornada mostra todas as páginas da
              sessão dentro do período escolhido.
            </p>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Início / dispositivo</th>
                    <th>Origem / campanha</th>
                    <th>Entrada → saída</th>
                    <th>Páginas / cliques</th>
                    <th>Tempo visível / rolagem</th>
                    <th>Sinais</th>
                    <th>Jornada</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sessions.map((s) => (
                    <tr key={s.session_id}>
                      <td>
                        {clock(s.started_at)}
                        <small>
                          {deviceName(s.device)} · {s.session_id.slice(0, 8)}
                        </small>
                      </td>
                      <td>
                        {s.source || "direto"}
                        <small>
                          {[s.medium, s.campaign].filter(Boolean).join(" · ") ||
                            "Sem campanha"}
                        </small>
                      </td>
                      <td>
                        {s.entry_path}
                        <small>→ {s.exit_path}</small>
                      </td>
                      <td>
                        {num(s.views)} visualizações
                        <small>
                          {num(s.pages)} páginas · {num(s.clicks)} cliques
                        </small>
                      </td>
                      <td>
                        {num(s.active_seconds)} s
                        <small>{s.max_depth}% alcançado</small>
                      </td>
                      <td>
                        {s.rage_clicks ? `${s.rage_clicks} repetidos` : "—"}
                        <small>
                          {s.non_interactive_clicks
                            ? `${s.non_interactive_clicks} em áreas sem ação`
                            : ""}
                          {s.conversions
                            ? ` · ${s.conversions} CTA / arquivo`
                            : ""}
                        </small>
                      </td>
                      <td>
                        <button
                          className={styles.sessionButton}
                          type="button"
                          aria-pressed={selected?.session_id === s.session_id}
                          disabled={loading}
                          onClick={() => setSelected(s)}
                        >
                          Ver jornada
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!report.total ? (
              <div className={styles.empty}>
                Nenhuma sessão encontrada para estes filtros.
              </div>
            ) : null}
            <div className={styles.pagination}>
              <span>
                {report.total
                  ? `${offset + 1}–${Math.min(offset + 25, report.total)} de ${num(report.total)}`
                  : "0 sessões"}
              </span>
              <button
                type="button"
                disabled={loading || offset === 0}
                onClick={() => {
                  setOffset((n) => Math.max(0, n - 25));
                  setSelected(null);
                }}
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={
                  loading || offset + 25 >= report.total || offset >= 100000
                }
                onClick={() => {
                  setOffset((n) => n + 25);
                  setSelected(null);
                }}
              >
                Próxima
              </button>
            </div>
          </article>
          {selected ? (
            <SessionJourney
              key={`${selected.session_id}:${revision}`}
              session={selected}
              filters={filters}
              onClose={() => setSelected(null)}
              onMap={onMap}
            />
          ) : null}
          <article className={styles.panel}>
            <h2>Áreas que merecem atenção</h2>
            <p>
              Cliques repetidos: três cliques em até dois segundos, numa região
              de 40 px. Áreas sem ação: cliques fora de links, botões e outros
              controles reconhecidos. São sinais para investigar, sem comprovar
              uma falha.
            </p>
            {report.hotspots.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Página / região</th>
                      <th>Grupos de cliques repetidos</th>
                      <th>Cliques em áreas sem ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.hotspots.map((h) => (
                      <tr key={`${h.path}:${h.target_id}`}>
                        <td>
                          {h.label || h.target_id}
                          <small>{h.path}</small>
                        </td>
                        <td>{num(h.rage_clicks)}</td>
                        <td>{num(h.non_interactive_clicks)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Sem esses sinais no período selecionado.</p>
            )}
          </article>
          <p className={styles.note}>
            Os novos sinais são coletados a partir desta atualização. Sessões
            são anônimas e identificadas por aba. CTA ou arquivo aberto indica
            um clique no site, sem confirmar compra ou leitura.
          </p>
        </div>
      ) : null}
    </>
  );
}
function SessionJourney({
  session,
  filters,
  onClose,
  onMap,
}: {
  session: Session;
  filters: AnalyticsFilters;
  onClose: () => void;
  onMap: (path: string, device: string) => void;
}) {
  const [data, setData] = useState<Journey | null>(null),
    [error, setError] = useState("");
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void analyticsRpc<Journey>(
      "cms_site_analytics_journey",
      {
        p_from: filters.from,
        p_to: filters.to,
        p_session_id: session.session_id,
      },
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Falha ao carregar jornada.",
          );
      });
    return () => controller.abort();
  }, [session.session_id, filters.from, filters.to]);
  useEffect(() => {
    if (!playing || !data || index >= data.events.length - 1) return;
    const timer = window.setInterval(
      () => setIndex((i) => Math.min(i + 1, data.events.length - 1)),
      1200,
    );
    return () => window.clearInterval(timer);
  }, [playing, data, index]);
  const events = data?.events || [],
    current = events[index],
    last = index >= events.length - 1;
  return (
    <article
      className={styles.panel}
      aria-label="Jornada da sessão selecionada"
    >
      <div className={styles.journeyHeading}>
        <div>
          <h2>Jornada · {session.session_id.slice(0, 8)}</h2>
          <p>
            {deviceName(session.device)} · {clock(session.started_at)}
          </p>
        </div>
        <button
          type="button"
          className={styles.sessionButton}
          onClick={onClose}
        >
          Fechar jornada
        </button>
      </div>
      <p>
        Reprodução dos eventos coletados, sem gravação visual da tela. Dados
        antigos usam o horário de recebimento e podem ter ordem aproximada.
      </p>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : !data ? (
        <p role="status">Carregando jornada…</p>
      ) : events.length ? (
        <>
          <div className={styles.player}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => i - 1);
              }}
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => {
                if (last) {
                  setIndex(0);
                  setPlaying(true);
                } else setPlaying((p) => !p);
              }}
            >
              {playing && !last ? "Pausar" : "Reproduzir eventos"}
            </button>
            <button
              type="button"
              disabled={last}
              onClick={() => {
                setPlaying(false);
                setIndex((i) => i + 1);
              }}
            >
              Próximo →
            </button>
            <span>
              {index + 1} / {events.length}
            </span>
          </div>
          <label className={styles.mapPosition}>
            Posição na jornada
            <input
              aria-label="Evento da jornada"
              type="range"
              min={0}
              max={events.length - 1}
              value={index}
              onChange={(e) => {
                setPlaying(false);
                setIndex(Number(e.target.value));
              }}
            />
          </label>
          <div
            className={styles.currentEvent}
            role="status"
            aria-live={playing ? "off" : "polite"}
          >
            <strong>
              {eventName[current.event_type] || current.event_type}
            </strong>
            <span>
              {current.path} · {clock(current.at)}
              {current.approximate_time ? " (aproximado)" : ""}
            </span>
            {current.label ? <span>{current.label}</span> : null}
            {current.destination ? (
              <span>Destino: {current.destination}</span>
            ) : null}
            {["engagement", "scroll_depth"].includes(current.event_type) ? (
              <span>
                {current.value}
                {current.event_type === "engagement" ? " s" : "% da página"}
              </span>
            ) : null}
            <button
              type="button"
              className={styles.sessionButton}
              onClick={() => onMap(current.path, session.device)}
            >
              Ver mapa desta página
            </button>
          </div>
          <details>
            <summary>Ver lista completa de eventos</summary>
            <ol className={styles.timeline}>
              {events.map((e, i) => (
                <li
                  key={e.event_id}
                  aria-current={i === index ? "step" : undefined}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      setIndex(i);
                    }}
                  >
                    {eventName[e.event_type] || e.event_type}
                    <small>
                      {e.path} · {clock(e.at)}
                      {e.label ? ` · ${e.label}` : ""}
                    </small>
                  </button>
                </li>
              ))}
            </ol>
          </details>
          {data.total > events.length ? (
            <p className={styles.note}>
              Mostrando os primeiros {events.length} de {num(data.total)}{" "}
              eventos.
            </p>
          ) : null}
        </>
      ) : (
        <p>Nenhum evento disponível para a sessão neste período.</p>
      )}
    </article>
  );
}
