"use client";
import { CmsFeedback, useCmsMessage } from "./CmsFeedback";
import { Button } from "@/components/ui/Button/Button";
import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { SUPABASE_URL } from "@/lib/leaflets";
import {
  recruitmentList,
  recruitmentRequest,
  applicationStatuses,
  type Application,
  type Job,
} from "@/lib/jobs";
import { applicationFilterQuery, loadApplicationReport, applicationWorkbook } from "@/lib/application-report";
import { RecruitmentNav } from "./RecruitmentNav";
import styles from "./RecruitmentAdmin.module.css";
type Candidate = Application & {
  site_jobs: { title: string; department: string } | null;
};
export function ApplicationsAdmin() {
  const params = useSearchParams();
  const initialJob = params.get("vaga") || "";
  return <ApplicationsPanel key={initialJob} initialJob={initialJob} />;
}
function ApplicationsPanel({ initialJob }: { initialJob: string }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let active = true;
    void recruitmentRequest<boolean>("/rest/v1/rpc/cms_is_admin", { method: "POST", body: "{}" })
      .then(value => { if (active) setIsAdmin(value === true); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, []);
  const [job, setJob] = useState(
      /^[a-f0-9-]{36}$/i.test(initialJob) ? initialJob : "",
    ),
    [status, setStatus] = useState(""),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<Pick<Job, "id" | "title">[]>([]),
    [candidates, setCandidates] = useState<Candidate[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<Candidate | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError, errorKind] = useCmsMessage(""),
    [message, setMessage, messageKind] = useCmsMessage(""),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      try {
        let offset = 0;
        const all: Pick<Job, "id" | "title">[] = [];
        while (true) {
          const r = await recruitmentList<Pick<Job, "id" | "title">>(
            `site_jobs?select=id,title&order=title.asc,id.asc&limit=200&offset=${offset}`,
          );
          if (c.signal.aborted) return;
          all.push(...r.items);
          offset += r.items.length;
          if (!r.items.length || offset >= r.total) break;
        }
        setJobs(all);
      } catch (err) {
        if (!c.signal.aborted)
          setError(
            err instanceof Error ? err.message : "Falha ao carregar vagas.",
          );
      }
    }
    void load();
    return () => c.abort();
  }, [setError]);
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      await Promise.resolve();
      if (c.signal.aborted) return;
      setLoading(true);
      setError("");
      try {
        const filter = applicationFilterQuery({ job, status, query, start, end });
        const r = await recruitmentList<Candidate>(
          `site_job_applications?select=*,site_jobs(title,department)&order=created_at.desc,id.asc&limit=25&offset=${view === "kanban" ? 0 : page * 25}&${filter}`,
        );
        if (view === "kanban") {
          while (r.items.length < r.total) {
            if (c.signal.aborted) return;
            const batch = await recruitmentList<Candidate>(
              `site_job_applications?select=*,site_jobs(title,department)&order=created_at.desc,id.asc&limit=200&offset=${r.items.length}&${filter}`,
            );
            if (!batch.items.length) break;
            r.items.push(...batch.items);
          }
        }
        if (!c.signal.aborted) {
          setCandidates(r.items);
          setTotal(r.total);
        }
      } catch (err) {
        if (!c.signal.aborted)
          setError(err instanceof Error ? err.message : "Falha ao carregar.");
      } finally {
        if (!c.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => c.abort();
  }, [job, status, query, start, end, page, revision, view, setError]);
  async function exportReport() {
    if (exporting) return;
    setExporting(true);
    setError("");
    setMessage("");
    try {
      const filters = { job, status, query, start, end };
      const rows = await loadApplicationReport(filters);
      if (!rows.length) { setMessage("Nenhuma candidatura encontrada para exportar.", "info"); return; }
      const xlsx = await import("xlsx");
      xlsx.writeFile(applicationWorkbook(xlsx, rows, filters), `candidaturas-${start || "inicio"}-${end || "hoje"}.xlsx`, { compression: true });
      setMessage(`Relatório gerado com ${rows.length} candidaturas.`, "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o relatório.");
    } finally { setExporting(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    const fd = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const rows = await recruitmentRequest<Application[]>(
        `/rest/v1/site_job_applications?id=eq.${selected.id}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            status: fd.get("status"),
            internal_notes: String(fd.get("internal_notes") || ""),
          }),
        },
      );
      if (!rows.length)
        throw new Error(
          "A candidatura não foi alterada. Verifique seu acesso.",
        );
      setSelected({ ...selected, ...rows[0] });
      setMessage(
        "Etapa e observações salvas. Nenhuma mensagem foi enviada ao candidato.", "success",
      );
      setRevision((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(candidate: Candidate) {
    if (!isAdmin || busy) return;
    if (!window.confirm(`Remover a candidatura de ${candidate.name}? Os dados e as anotações desta candidatura serão removidos. Esta ação não pode ser desfeita.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const removed = await recruitmentRequest<{ id: string }[]>(
        `/rest/v1/site_job_applications?id=eq.${candidate.id}&select=id`,
        { method: "DELETE", headers: { Prefer: "return=representation" } },
      );
      if (!removed.some(row => row.id === candidate.id))
        throw new Error("Não foi possível remover. Verifique se a candidatura ainda existe e se você tem acesso de administrador.");
      if (selected?.id === candidate.id) setSelected(null);
      setCandidates(current => current.filter(row => row.id !== candidate.id));
      if (view === "list" && candidates.length === 1 && page > 0) setPage(current => current - 1);
      else setRevision(current => current + 1);
      setMessage("Candidatura removida.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover a candidatura. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const signed = await recruitmentRequest<{ signedURL: string }>(
        `/storage/v1/object/sign/job-resumes/${selected.resume_path}`,
        { method: "POST", body: JSON.stringify({ expiresIn: 60 }) },
      );
      const signedPath = signed.signedURL.startsWith("/object/")
        ? `/storage/v1${signed.signedURL}`
        : signed.signedURL;
      const url = new URL(signedPath, `${SUPABASE_URL}/storage/v1/`);
      if (url.origin !== new URL(SUPABASE_URL).origin)
        throw new Error("Destino do currículo inválido.");
      const response = await fetch(url, { credentials: "omit" });
      if (!response.ok) throw new Error("Não foi possível abrir o currículo.");
      const objectUrl = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `curriculo-${selected.id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao abrir currículo.",
      );
    } finally {
      setBusy(false);
    }
  }
  const change = (set: (value: string) => void, value: string) => {
    set(value);
    setPage(0);
    setSelected(null);
  };
  async function moveCandidate(candidate: Candidate, nextStatus: string) {
    if (busy || candidate.status === nextStatus) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const rows = await recruitmentRequest<Application[]>(`/rest/v1/site_job_applications?id=eq.${candidate.id}`, {
        method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: nextStatus }),
      });
      if (!rows.length) throw new Error("Não foi possível atualizar a etapa da candidatura.");
      setCandidates(current => current.map(item => item.id === candidate.id ? { ...item, ...rows[0] } : item));
      setSelected(current => current?.id === candidate.id ? { ...current, ...rows[0] } : current);
      setMessage(`Candidatura de ${candidate.name} movida para ${applicationStatuses[nextStatus] || nextStatus}.`, "success");
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível atualizar a etapa."); }
    finally { setBusy(false); setDraggingId(null); }
  }
  const renderCandidate = (c: Candidate) => (
          <article className={`${styles.row} ${view === "kanban" ? styles.kanbanCard : ""} ${draggingId === c.id ? styles.dragging : ""} recruitment-kanban-card`} key={c.id}
            draggable={view === "kanban" && !busy}
            onDragStart={(event: DragEvent<HTMLElement>) => { setDraggingId(c.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", c.id); }}
            onDragEnd={() => setDraggingId(null)}
          >
            <div>
              <span className={styles.status} data-status={c.status}>
                {applicationStatuses[c.status]}
              </span>
              <h2>{c.name}</h2>
              <p>
                {c.site_jobs?.title || "Vaga"} · {c.city}
              </p>
              <p>
                {c.email} ·{" "}
                {new Date(c.created_at).toLocaleDateString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" className="candidate-action" type="button"
                disabled={busy}
                onClick={() => {
                  setSelected(c);
                  requestAnimationFrame(() => document.getElementById("candidate-details")?.scrollIntoView({ block: "start" }));
                  setMessage("");
                }}
              >
                Ver candidatura
              </Button>
              {isAdmin ? <Button variant="secondary" className="button-danger" type="button" disabled={busy} onClick={() => void remove(c)}>
                Remover candidatura
              </Button> : null}
            </div>
          </article>
  );
  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">Recursos Humanos</span>
          <h1>Candidaturas</h1>
          <p>
            Acompanhe os candidatos e organize as etapas do processo seletivo.
          </p>
        </div>
      </header>
      <RecruitmentNav />
      <div className={styles.viewToggle} role="group" aria-label="Visualização das candidaturas">
        <Button variant={view === "list" ? "primary" : "secondary"} aria-pressed={view === "list"} onClick={() => { setView("list"); setPage(0); }}>Lista</Button>
        <Button variant={view === "kanban" ? "primary" : "secondary"} aria-pressed={view === "kanban"} onClick={() => { setView("kanban"); setPage(0); }}>Kanban</Button>
      </div>
      {view === "kanban" ? <p className={styles.fieldHint}>Cada cartão representa uma candidatura. Abra os detalhes para alterar a etapa e clique em “Salvar acompanhamento” para atualizar o quadro.</p> : null}
      <div className={`${styles.filters} ${styles.applicationFilters}`}>
        <label>
          Vaga
          <select value={job} onChange={(e) => change(setJob, e.target.value)}>
            <option value="">Todas as vagas</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Etapa
          <select
            value={status}
            onChange={(e) => change(setStatus, e.target.value)}
          >
            <option value="">Todas as etapas</option>
            {Object.entries(applicationStatuses).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <form className={styles.candidateSearch}
          onSubmit={(e) => {
            e.preventDefault();
            change(setQuery, search);
          }}
        >
          <label>
            Buscar candidato
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={120}
              placeholder="Nome ou e-mail"
            />
          </label>
          <Button variant="secondary" type="submit" className="cms-edit-one">Buscar</Button>
        </form>
        <Button variant="secondary" type="button"
          className="button button-secondary"
          disabled={loading}
          onClick={() => setRevision((n) => n + 1)}
        >
          Atualizar
        </Button>
      </div>
      <section aria-labelledby="application-report-title">
        <h2 id="application-report-title">Relatório de candidaturas</h2>
        <p className={styles.fieldHint}>Filtre pela data de envio (horário de São Paulo). O Excel inclui todas as páginas e respeita a vaga, a etapa e a busca aplicadas acima. Deixe as datas em branco para consultar todo o período.</p>
        <div className={styles.filters}>
          <label>Data inicial<input type="date" value={start} max={end || undefined} onChange={e => change(setStart, e.target.value)} /></label>
          <label>Data final<input type="date" value={end} min={start || undefined} onChange={e => change(setEnd, e.target.value)} /></label>
          <Button variant="primary" type="button" disabled={exporting || loading || busy || !!(start && end && start > end)} onClick={() => void exportReport()}>
            {exporting ? "Gerando relatório…" : "Baixar relatório XLSX"}
          </Button>
        </div>
        {exporting ? <p role="status">Buscando todas as candidaturas dos filtros selecionados…</p> : null}
      </section>
      {error ? (
        <p className={styles.error} role="alert">
          <CmsFeedback message={error} kind={errorKind} />
        </p>
      ) : null}
      {message ? (
        <p className="form-status" role="status">
          <CmsFeedback message={message} kind={messageKind} />
        </p>
      ) : null}
      {loading ? <p role="status">Carregando candidaturas…</p> : null}
      {selected ? (
        <article id="candidate-details" className={styles.detail}>
          <div className={styles.detailHeading}>
            <div>
              <span className={styles.status} data-status={selected.status}>
                {applicationStatuses[selected.status]}
              </span>
              <h2>{selected.name}</h2>
              <p>{selected.site_jobs?.title}</p>
            </div>
            <Button variant="secondary" type="button"
              className="cms-edit-one"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Fechar detalhes
            </Button>
          </div>
          <dl>
            <div>
              <dt>E-mail</dt>
              <dd>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{selected.phone}</dd>
            </div>
            <div>
              <dt>Cidade</dt>
              <dd>{selected.city}</dd>
            </div>
            <div>
              <dt>Enviada em</dt>
              <dd>
                {new Date(selected.created_at).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </dd>
            </div>
            <div>
              <dt>Apresentação</dt>
              <dd>{selected.message || "Não informada"}</dd>
            </div>
          </dl>
          <Button variant="secondary" type="button"
            className="button button-secondary"
            disabled={busy}
            onClick={download}
          >
            {busy ? "Aguarde…" : "Baixar currículo PDF"}
          </Button>
          <form
            className={styles.noteForm}
            key={`${selected.id}:${selected.updated_at || selected.status}`}
            onSubmit={save}
          >
            <label>
              Etapa
              <select
                className={styles.notes}
                name="status"
                defaultValue={selected.status}
              >
                {Object.entries(applicationStatuses).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Observações internas
              <textarea
                className={styles.notes}
                name="internal_notes"
                aria-describedby="internal-notes-help"
                rows={5}
                maxLength={12000}
                defaultValue={selected.internal_notes}
                placeholder="Ex.: entrevista realizada, disponibilidade confirmada e próximo contato combinado."
              />
            </label>
            <p id="internal-notes-help" className={styles.notesHelp}>
              Use as anotações internas para registrar o andamento da seleção, pontos da entrevista e próximos passos. Elas ficam vinculadas a esta candidatura e são acessíveis somente ao RH e administradores. O candidato não vê essas anotações e não recebe mensagem ao salvar. Para gravar a etapa e o texto, clique em “Salvar acompanhamento”.
            </p>
            <div>
              <Button variant="primary" type="submit" className="button" disabled={busy}>
                {busy ? "Salvando…" : "Salvar acompanhamento"}
              </Button>
            </div>
          </form>
        </article>
      ) : null}
      {!loading && view === "kanban" ? <div className={`${styles.kanban} recruitment-kanban`} aria-label="Candidaturas por etapa">
        {Object.entries(applicationStatuses).map(([stage, label]) => <section className={`${styles.kanbanColumn} recruitment-kanban-column`} key={stage} aria-label={label}
          onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
          onDrop={(event) => { event.preventDefault(); const candidateId = event.dataTransfer.getData("text/plain"); const candidate = candidates.find(item => item.id === candidateId); if (candidate) void moveCandidate(candidate, stage); else setDraggingId(null); }}
        >
          <h2><span className={styles.status} data-status={stage}>{label}</span><span>{candidates.filter(candidate => candidate.status === stage).length}</span></h2>
          {candidates.filter(candidate => candidate.status === stage).map(renderCandidate)}
          {!candidates.some(candidate => candidate.status === stage) ? <p className={styles.columnEmpty}>Nenhuma candidatura nesta etapa.</p> : null}
        </section>)}
      </div> : <div className={styles.list} aria-busy={loading}>{!loading ? candidates.map(renderCandidate) : null}</div>}
      {!loading && !error && !candidates.length ? (
        <div className="cms-empty">
          Nenhuma candidatura encontrada neste filtro.
        </div>
      ) : null}
      <div className={styles.pager} hidden={view === "kanban"}>
        <span>
          {total
            ? `${page * 25 + 1}–${Math.min((page + 1) * 25, total)} de ${total} candidaturas`
            : "0 candidaturas"}
        </span>
        <Button variant="secondary" type="button"
          disabled={loading || page === 0}
          onClick={() => {
            setPage((n) => n - 1);
            setSelected(null);
          }}
        >
          Anterior
        </Button>
        <Button variant="secondary" type="button"
          disabled={loading || (page + 1) * 25 >= total}
          onClick={() => {
            setPage((n) => n + 1);
            setSelected(null);
          }}
        >
          Próxima
        </Button>
      </div>
      <style jsx global>{`
        .admin-page .recruitment-kanban { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(280px,1fr); align-items:start; gap:16px; max-width:100%; margin:24px 0; padding:0 0 12px; overflow-x:auto; overscroll-behavior-x:contain; }
        .admin-page .recruitment-kanban-column { display:grid; align-content:start; gap:12px; min-width:0; min-height:220px; padding:14px; border:1px solid var(--border-soft); border-radius:18px; background:var(--surface-soft); }
        .admin-page .recruitment-kanban-column > h2 { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:0 0 2px; font-size:15px; }
        .admin-page .recruitment-kanban-column > h2 > span:last-child { display:inline-grid; min-width:28px; height:28px; place-items:center; padding:0 7px; border-radius:999px; background:#fff; color:var(--text-heading); font-size:12px; font-weight:800; }
        .admin-page .recruitment-kanban-card { display:grid; gap:12px; align-items:stretch; padding:16px; border:1px solid var(--border-soft); border-radius:14px; background:var(--surface-card); box-shadow:0 5px 16px rgb(28 71 34 / 5%); cursor:grab; }
        .admin-page .recruitment-kanban-card:active { cursor:grabbing; }
        .admin-page .recruitment-kanban-card h2 { font-size:16px; line-height:1.3; overflow-wrap:anywhere; }
        .admin-page .recruitment-kanban-card p { overflow-wrap:anywhere; }
        .admin-page .recruitment-kanban-card .actions { display:grid; grid-template-columns:1fr; }
        .admin-page .recruitment-kanban-card .actions > * { width:100%; }
        .admin-page .recruitment-kanban-column .columnEmpty { margin:0; padding:18px 10px; border:1px dashed var(--border-strong); border-radius:12px; color:var(--text-muted); font-size:13px; text-align:center; }
        .admin-page .actions .candidate-action { min-height:50px!important; padding:0 22px!important; border-radius:999px!important; border:1px solid var(--brand-green-900)!important; background:transparent!important; color:var(--text-heading)!important; font-weight:800!important; }
        .admin-page .actions .candidate-action:hover:not(:disabled) { border-color:var(--brand-green-900)!important; background:var(--brand-green-900)!important; color:#fff!important; transform:translateY(-2px); box-shadow:0 14px 30px rgb(28 71 34 / 14%); }
        .admin-page .actions .button-danger { min-height:50px!important; padding:0 22px!important; border-radius:999px!important; border:1px solid var(--brand-red-500)!important; background:transparent!important; color:var(--brand-red-500)!important; font-weight:800!important; }
        .admin-page .actions .button-danger:hover:not(:disabled) { border-color:var(--brand-red-500)!important; background:var(--brand-red-500)!important; color:#fff!important; transform:translateY(-2px); box-shadow:0 14px 30px rgb(239 64 55 / 18%); }
        .admin-shell .button-danger, .admin-shell .cms-danger-outline, .admin-shell .cms-delete-one { border:1px solid var(--brand-red-500)!important; background:transparent!important; color:var(--brand-red-500)!important; }
        .admin-shell .button-danger:hover:not(:disabled), .admin-shell .cms-danger-outline:hover:not(:disabled), .admin-shell .cms-delete-one:hover:not(:disabled) { border-color:var(--brand-red-500)!important; background:var(--brand-red-500)!important; color:#fff!important; box-shadow:0 10px 24px rgb(239 64 55 / 18%); }
        @media(max-width:800px) { .admin-page .recruitment-kanban { grid-auto-columns:minmax(260px,84vw); } .admin-page .recruitment-kanban-card { padding:14px; } }
      `}</style>
    </section>
  );
}
