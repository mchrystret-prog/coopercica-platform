"use client";

import { useEffect, useRef, useState } from "react";
import { safePath } from "@/supabase/functions/_shared/analytics";
import {
  analyticsRpc,
  deviceName,
  type AnalyticsFilters,
} from "@/lib/analytics-report";
import styles from "./AnalyticsDashboard.module.css";

type Heatmap = {
  total: number;
  viewport_width: number;
  document_height: number;
  points: { x: number; y: number; count: number }[];
};
export function AnalyticsHeatmap({
  filters,
  paths,
  revision,
}: {
  filters: AnalyticsFilters;
  paths: string[];
  revision: number;
}) {
  const [selectedPath, setSelectedPath] = useState("/");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const path = filters.path || selectedPath,
    device = filters.device || selectedDevice;
  const [data, setData] = useState<Heatmap | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");
      try {
        const result = await analyticsRpc<Heatmap>(
          "cms_site_analytics_heatmap",
          {
            p_from: filters.from,
            p_to: filters.to,
            p_path: path,
            p_device: device,
          },
          controller.signal,
        );
        if (!controller.signal.aborted) setData(result);
      } catch (err) {
        if (!controller.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Falha ao carregar o mapa.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [filters.from, filters.to, path, device, revision]);
  return (
    <article className={styles.panel}>
      <h2>Mapa de calor de cliques</h2>
      <p>
        As regiões mais quentes concentram mais cliques. Compare uma página e um
        dispositivo por vez.
      </p>
      <div className={styles.filters}>
        <label>
          Página do mapa
          <select
            value={path}
            disabled={!!filters.path}
            onChange={(e) => setSelectedPath(e.target.value)}
          >
            {[...new Set(["/", ...paths, path])]
              .filter((p) => safePath(p))
              .map((p) => (
                <option value={p} key={p}>
                  {p === "/" ? "Início" : p}
                </option>
              ))}
          </select>
        </label>
        <label>
          Dispositivo do mapa
          <select
            value={device}
            disabled={!!filters.device}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            {["desktop", "mobile", "tablet"].map((d) => (
              <option value={d} key={d}>
                {deviceName(d)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status">Carregando mapa…</p>
      ) : error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : data?.total ? (
        <>
          <p>
            {data.total.toLocaleString("pt-BR")} cliques posicionados no
            período.
          </p>
          <div className={styles.legend}>
            <span>Menor concentração</span>
            <i aria-hidden="true" />
            <span>Maior concentração</span>
          </div>
          <HeatmapPreview key={`${path}:${device}`} path={path} data={data} />
          <p className={styles.note}>
            Sobreposição aproximada sobre a página atual. Mudanças em banners,
            produtos, alturas e elementos dinâmicos podem deslocar as posições
            históricas. Cliques de teclado, menus fixos, formulários e modais
            não entram nas coordenadas do mapa.
          </p>
        </>
      ) : (
        <div className={styles.empty}>
          Ainda não há cliques posicionados para esta página e dispositivo. O
          mapa aparecerá conforme os visitantes permitirem a coleta.
        </div>
      )}
    </article>
  );
}
function HeatmapPreview({ path, data }: { path: string; data: Heatmap }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [height, setHeight] = useState(data.document_height);
  const [ready, setReady] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [position, setPosition] = useState(0);
  const width = Math.max(240, Math.min(4096, data.viewport_width));
  const viewportHeight = 900;
  const scale = Math.min(1, containerWidth / width);
  const offset = (Math.max(0, height - viewportHeight) * position) / 100;
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) =>
      setContainerWidth(entries[0].contentRect.width),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.scrollTo({
      top: offset,
      behavior: "instant",
    });
  }, [offset, ready]);
  const onLoad = () => {
    try {
      const doc = frame.current?.contentDocument;
      if (!doc) return;
      const style = doc.createElement("style");
      style.textContent =
        "[data-analytics-ignore]{display:none!important}*{animation:none!important;transition:none!important;scroll-behavior:auto!important}";
      doc.head.appendChild(style);
      void doc.fonts.ready.then(() => {
        setHeight(
          Math.min(50000, Math.max(900, doc.documentElement.scrollHeight)),
        );
        setReady(true);
      });
    } catch {
      setReady(false);
    }
  };
  const maximum = Math.max(1, ...data.points.map((p) => p.count));
  if (!safePath(path)) return null;
  return (
    <>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={overlay}
          onChange={(e) => setOverlay(e.target.checked)}
        />{" "}
        Mostrar calor sobre a prévia
      </label>
      <label className={styles.mapPosition}>
        Trecho da página: {Math.round(position)}%
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </label>
      <div ref={container} className={styles.heatScroll}>
        <div
          className={styles.heatCanvas}
          style={{ width: width * scale, height: viewportHeight * scale }}
        >
          <iframe
            ref={frame}
            onLoad={onLoad}
            title={`Prévia da página ${path} para o mapa de calor`}
            src={`${path}?analytics_preview=1`}
            tabIndex={-1}
            aria-hidden="true"
            className={styles.preview}
            style={{
              width,
              height: viewportHeight,
              transform: `scale(${scale})`,
            }}
          />
          {overlay ? (
            <div
              className={styles.heatOverlay}
              role="img"
              aria-label={`Mapa agregado de ${data.total} cliques. Vermelho indica as maiores concentrações.`}
            >
              {data.points
                .filter(
                  (p) =>
                    p.y * height >= offset - 50 &&
                    p.y * height <= offset + viewportHeight + 50,
                )
                .map((point, i) => (
                  <span
                    key={i}
                    title={`${point.count} cliques nesta região`}
                    style={{
                      left: `${point.x * 100}%`,
                      top: (point.y * height - offset) * scale,
                      opacity: 0.3 + 0.65 * Math.sqrt(point.count / maximum),
                    }}
                  />
                ))}
            </div>
          ) : null}
        </div>
      </div>
      {!ready ? (
        <p className={styles.note}>Carregando a prévia atual da página.</p>
      ) : null}
    </>
  );
}
