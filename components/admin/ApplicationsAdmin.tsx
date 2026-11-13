"use client";
import { CmsFeedback, useCmsMessage } from "./CmsFeedback";
import { Button } from "@/components/ui/Button/Button";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { SUPABASE_URL } from "@/lib/leaflets";
import {
  recruitmentList,
  recruitmentRequest,
  applicationStatuses,
  type Application,
  type Job,
} from "@/lib/jobs";
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
      const term = query
        .replace(/[^\p{L}\p{N} @._-]/gu, "")
        .trim()
        .slice(0, 120);
      try {
        const r = await recruitmentList<Candidate>(
          `site_job_applications?select=*,site_jobs(title,department)&order=created_at.desc,id.asc&limit=25&offset=${page * 25}${job ? `&job_id=eq.${job}` : ""}${status ? `&status=eq.${status}` : ""}${term ? `&or=${encodeURIComponent(`(name.ilike.*${term}*,email.ilike.*${term}*)`)}` : ""}`,
        );
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
  }, [job, status, query, page, revision, setError]);
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
      <div className={styles.filters}>
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
        <form
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
        <article className={styles.detail}>
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
      <div className={styles.list} aria-busy={loading}>
        {candidates.map((c) => (
          <article className={styles.row} key={c.id}>
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
              <Button variant="secondary" type="button"
                disabled={busy}
                onClick={() => {
                  setSelected(c);
                  setMessage("");
                }}
              >
                Ver candidatura
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && !candidates.length ? (
        <div className="cms-empty">
          Nenhuma candidatura encontrada neste filtro.
        </div>
      ) : null}
      <div className={styles.pager}>
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
    </section>
  );
}
