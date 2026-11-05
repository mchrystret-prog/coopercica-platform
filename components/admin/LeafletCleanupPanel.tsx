"use client";

import { useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";

type Simulation = {
  mode: string; graceDays: number; eligibleFiles: number; eligibleBytes: number;
  deletedFiles: number; reclaimedBytes: number; failed: number;
};
type Run = { id: number; started_at: string; mode: string; candidates: number;
  deleted: number; bytes_reclaimed: number; errors: number };
const mb = (bytes: number) => (bytes / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " MB";

export function LeafletCleanupPanel() {
  const [report, setReport] = useState<Simulation | null>(null);
  const [history, setHistory] = useState<Run[]>([]);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  async function refreshHistory() {
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) return;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leaflet_cleanup_runs?select=id,started_at,mode,candidates,deleted,bytes_reclaimed,errors&order=started_at.desc&limit=15`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (r.ok) setHistory(await r.json());
  }
  useEffect(() => { void refreshHistory(); }, []);

  async function simulate() {
    setWorking(true);
    setMessage("");
    try {
      const token = sessionStorage.getItem("coopercica_admin_token");
      if (!token) throw new Error("Sua sessão expirou. Entre novamente no CMS.");
      const r = await fetch(`${SUPABASE_URL}/functions/v1/leaflet-storage-cleanup`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "dry_run" }),
      });
      if (!r.ok) throw new Error(`Não foi possível executar a simulação (HTTP ${r.status}).`);
      setReport(await r.json());
      await refreshHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao consultar a limpeza.");
    } finally { setWorking(false); }
  }

  return (
    <section className="content-section">
      <div className="content-section-heading">
        <div>
          <h2>Limpeza segura de imagens</h2>
          <p>O sistema remove apenas imagens de produtos de folhetos vencidos há mais de 7 dias,
             sem vínculos com outras edições ou itens da biblioteca.</p>
        </div>
      </div>
      <div className="data-card" style={{ padding: 24 }}>
        <p><strong>Agendamento:</strong> diariamente às 06h (Brasília). Até 20 arquivos por execução.</p>
        <p>As informações de preços e produtos são preservadas. Fundos, selos, capas e arquivos
           sem vínculo identificado ficam fora da limpeza automática.</p>
        <button type="button" className="button button-primary" onClick={simulate} disabled={working}>
          {working ? "Analisando…" : "Simular limpeza agora"}
        </button>
        {message ? <p role="alert">{message}</p> : null}
        {report ? <div role="status">
          <p><strong>{report.eligibleFiles} arquivos elegíveis</strong> · {mb(report.eligibleBytes)} potencialmente recuperáveis.</p>
          <p>Nenhum arquivo foi excluído por esta simulação.</p>
        </div> : null}
      </div>
      <div className="content-section-heading"><h3>Histórico das execuções</h3></div>
      <div className="data-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Data</th><th>Tipo</th><th>Elegíveis</th><th>Excluídos</th><th>Espaço recuperado</th><th>Erros</th></tr></thead>
            <tbody>
              {history.length ? history.map(run => <tr key={run.id}>
                <td>{new Date(run.started_at).toLocaleString("pt-BR")}</td>
                <td>{run.mode === "dry_run" ? "Simulação" : "Automática"}</td>
                <td>{run.candidates}</td><td>{run.deleted}</td>
                <td>{mb(run.bytes_reclaimed)}</td><td>{run.errors}</td>
              </tr>) : <tr><td colSpan={6}>Nenhuma execução registrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
