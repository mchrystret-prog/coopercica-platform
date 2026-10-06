"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  recruitmentList,
  recruitmentRequest,
  jobSlug,
  employmentNames,
  workModeNames,
  type Job,
} from "@/lib/jobs";
import { RecruitmentNav } from "./RecruitmentNav";
import styles from "./RecruitmentAdmin.module.css";
const jobStatuses: Record<string, string> = {
  draft: "Rascunho",
  open: "Publicada",
  closed: "Encerrada",
};
export function JobsAdmin() {
  const [jobs, setJobs] = useState<Job[]>([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(0),
    [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Job | null>(null),
    [showForm, setShowForm] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const formSection = useRef<HTMLElement>(null);
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      await Promise.resolve();
      if (c.signal.aborted) return;
      setLoading(true);
      setError("");
      try {
        const result = await recruitmentList<Job>(
          `site_jobs?select=*&order=created_at.desc&limit=25&offset=${page * 25}${status ? `&status=eq.${status}` : ""}`,
        );
        if (!c.signal.aborted) {
          setJobs(result.items);
          setTotal(result.total);
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
  }, [page, status, revision]);
  function edit(job: Job | null) {
    setEditing(job);
    setShowForm(true);
    setMessage("");
    setTimeout(
      () =>
        formSection.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        }),
      0,
    );
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fd = new FormData(event.currentTarget);
    const id = editing?.id || crypto.randomUUID();
    const text = (key: string) => String(fd.get(key) || "").trim();
    const values = {
      id,
      slug: editing?.slug || jobSlug(text("title"), id),
      title: text("title"),
      department: text("department"),
      city: text("city"),
      unit: text("unit"),
      employment_type: text("employment_type"),
      work_mode: text("work_mode"),
      openings: Number(fd.get("openings")),
      salary: text("salary"),
      description: text("description"),
      responsibilities: text("responsibilities"),
      requirements: text("requirements"),
      benefits: text("benefits"),
      status: text("status"),
      closes_on: text("closes_on") || null,
    };
    setBusy(true);
    setError("");
    try {
      const rows = await recruitmentRequest<Job[]>(
        `/rest/v1/site_jobs${editing ? `?id=eq.${id}` : ""}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(values),
        },
      );
      if (!rows.length)
        throw new Error("A vaga não foi alterada. Verifique seu acesso.");
      setMessage(
        "Vaga salva. Publicadas aparecem no portal enquanto estiverem dentro do prazo.",
      );
      setEditing(null);
      setShowForm(false);
      setRevision((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }
  async function close(job: Job) {
    if (
      !confirm(
        `Encerrar a vaga “${job.title}”? Ela deixará de receber candidaturas.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const rows = await recruitmentRequest<Job[]>(
        `/rest/v1/site_jobs?id=eq.${job.id}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ status: "closed" }),
        },
      );
      if (!rows.length) throw new Error("A vaga não foi alterada.");
      setMessage(
        "Vaga encerrada. As candidaturas permanecem disponíveis para o RH.",
      );
      setRevision((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao encerrar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="eyebrow">Recursos Humanos</span>
          <h1>Portal de Vagas</h1>
          <p>
            Crie oportunidades, publique no site e acompanhe as candidaturas.
          </p>
        </div>
        <button className="button" disabled={busy} onClick={() => edit(null)}>
          + Nova vaga
        </button>
      </header>
      <RecruitmentNav />
      {message ? (
        <p className="form-status" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.filters}>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas as vagas</option>
            {Object.entries(jobStatuses).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button button-secondary"
          disabled={loading}
          onClick={() => setRevision((n) => n + 1)}
        >
          Atualizar
        </button>
      </div>
      {loading ? <p role="status">Carregando vagas…</p> : null}
      <div className={styles.list} aria-busy={loading}>
        {jobs.map((job) => (
          <article className={styles.row} key={job.id}>
            <div>
              <span className={styles.status}>{jobStatuses[job.status]}</span>
              <h2>{job.title}</h2>
              <p>
                {[job.department, job.city, job.unit]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p>
                {employmentNames[job.employment_type]} ·{" "}
                {workModeNames[job.work_mode]} · {job.openings} posições
                {job.closes_on
                  ? ` · Prazo ${new Date(job.closes_on + "T12:00:00Z").toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
            </div>
            <div className={styles.actions}>
              <button disabled={busy} onClick={() => edit(job)}>
                Editar
              </button>
              <Link href={`/admin/vagas/candidaturas?vaga=${job.id}`}>
                Candidaturas
              </Link>
              {job.status === "open" ? (
                <>
                  <Link
                    href={`/vagas/${job.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver no site
                  </Link>
                  <button disabled={busy} onClick={() => close(job)}>
                    Encerrar
                  </button>
                </>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && !jobs.length ? (
        <div className="cms-empty">
          Nenhuma vaga neste filtro. Crie a primeira oportunidade.
        </div>
      ) : null}
      <div className={styles.pager}>
        <span>
          {total
            ? `${page * 25 + 1}–${Math.min((page + 1) * 25, total)} de ${total} vagas`
            : "0 vagas"}
        </span>
        <button
          disabled={loading || page === 0}
          onClick={() => setPage((n) => n - 1)}
        >
          Anterior
        </button>
        <button
          disabled={loading || (page + 1) * 25 >= total}
          onClick={() => setPage((n) => n + 1)}
        >
          Próxima
        </button>
      </div>
      {showForm ? (
        <section
          className={`${styles.formSection} cms-create-section`}
          ref={formSection}
        >
          <div className={styles.formHeading}>
            <h2>{editing ? "Editar vaga" : "Nova oportunidade"}</h2>
            <button
              className="cms-edit-one"
              disabled={busy}
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            >
              Cancelar
            </button>
          </div>
          <form
            className="settings-form"
            key={editing?.id || "new"}
            onSubmit={save}
          >
            <label>
              Cargo
              <input
                name="title"
                required
                minLength={3}
                maxLength={140}
                defaultValue={editing?.title || ""}
                placeholder="Ex.: Operador(a) de loja"
              />
            </label>
            <label>
              Setor
              <input
                name="department"
                list="job-departments"
                required
                minLength={2}
                maxLength={80}
                defaultValue={editing?.department || ""}
                placeholder="Ex.: Padaria"
              />
              <datalist id="job-departments">
                {[...new Set(jobs.map((j) => j.department))].map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </label>
            <label>
              Cidade
              <input
                name="city"
                required
                minLength={2}
                maxLength={100}
                defaultValue={editing?.city || ""}
              />
            </label>
            <label>
              Unidade / local
              <input
                name="unit"
                maxLength={120}
                defaultValue={editing?.unit || ""}
                placeholder="Ex.: Loja 1"
              />
            </label>
            <label>
              Tipo de contrato
              <select
                name="employment_type"
                defaultValue={editing?.employment_type || "clt"}
              >
                {Object.entries(employmentNames).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Modelo de trabalho
              <select
                name="work_mode"
                defaultValue={editing?.work_mode || "onsite"}
              >
                {Object.entries(workModeNames).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Número de posições
              <input
                name="openings"
                type="number"
                min={1}
                max={999}
                required
                defaultValue={editing?.openings || 1}
              />
            </label>
            <label>
              Remuneração <small>(opcional)</small>
              <input
                name="salary"
                maxLength={120}
                defaultValue={editing?.salary || ""}
                placeholder="Faixa salarial ou a combinar"
              />
            </label>
            {[
              ["description", "Descrição da oportunidade", 20, true],
              ["responsibilities", "Responsabilidades", 0, false],
              ["requirements", "Requisitos", 10, true],
              ["benefits", "Benefícios", 0, false],
            ].map(([key, label, min, required]) => (
              <label className="form-span-full" key={String(key)}>
                {label}
                <textarea
                  name={String(key)}
                  required={Boolean(required)}
                  minLength={Number(min)}
                  maxLength={12000}
                  rows={5}
                  defaultValue={(editing?.[key as keyof Job] as string) || ""}
                />
              </label>
            ))}
            <label>
              Receber candidaturas até
              <input
                name="closes_on"
                type="date"
                defaultValue={editing?.closes_on || ""}
              />
              <small>
                Opcional. Após o prazo, a vaga sai automaticamente do portal.
              </small>
            </label>
            <label>
              Status
              <select name="status" defaultValue={editing?.status || "draft"}>
                {Object.entries(jobStatuses).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <small>Rascunhos e vagas encerradas não aparecem no site.</small>
            </label>
            <div className="form-actions">
              <button className="button" disabled={busy}>
                {busy ? "Salvando…" : "Salvar vaga"}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
}
