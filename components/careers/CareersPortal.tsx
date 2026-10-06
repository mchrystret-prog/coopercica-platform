"use client";
import Link from "next/link";
import { useState } from "react";
import {
  employmentNames,
  workModeNames,
  filterJobs,
  type Job,
} from "@/lib/jobs";
import styles from "./Careers.module.css";
export function CareersPortal({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState(""),
    [department, setDepartment] = useState(""),
    [city, setCity] = useState("");
  const filtered = filterJobs(jobs, { search, department, city });
  return (
    <section className={`section ${styles.portal}`} id="oportunidades">
      <div className="shell">
        <div className={styles.intro}>
          <div>
            <span className="eyebrow">Seu próximo passo</span>
            <h2>Encontre seu lugar na Coopercica.</h2>
            <p>
              Explore as oportunidades e faça parte de uma história construída
              por pessoas.
            </p>
          </div>
          <div className={styles.count}>
            <strong>{jobs.length}</strong>
            <span>{jobs.length === 1 ? "vaga aberta" : "vagas abertas"}</span>
          </div>
        </div>
        <div className={styles.filters}>
          <label>
            Buscar vaga
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cargo, setor ou unidade"
            />
          </label>
          <label>
            Setor
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Todos os setores</option>
              {[...new Set(jobs.map((j) => j.department))]
                .sort((a, b) => a.localeCompare(b, "pt-BR"))
                .map((d) => (
                  <option value={d} key={d}>
                    {d}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Cidade
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Todas as cidades</option>
              {[...new Set(jobs.map((j) => j.city))]
                .sort((a, b) => a.localeCompare(b, "pt-BR"))
                .map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <div className={styles.results}>
          <p role="status">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "oportunidade encontrada"
              : "oportunidades encontradas"}
          </p>
          {search || department || city ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDepartment("");
                setCity("");
              }}
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
        {filtered.length ? (
          <div className={styles.grid}>
            {filtered.map((j) => (
              <article className={styles.jobCard} key={j.id}>
                <div className={styles.cardTop}>
                  <span className={styles.department}>{j.department}</span>
                  <span>
                    {j.openings} {j.openings === 1 ? "posição" : "posições"}
                  </span>
                </div>
                <h3>
                  <Link href={`/vagas/${j.slug}`}>{j.title}</Link>
                </h3>
                <p>{[j.city, j.unit].filter(Boolean).join(" · ")}</p>
                <div className={styles.tags}>
                  <span>{employmentNames[j.employment_type]}</span>
                  <span>{workModeNames[j.work_mode]}</span>
                </div>
                <p className={styles.summary}>{j.description}</p>
                <div className={styles.cardBottom}>
                  <small>
                    {j.closes_on
                      ? `Inscrições até ${new Date(j.closes_on + "T12:00:00Z").toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                      : "Inscrições abertas"}
                  </small>
                  <Link
                    href={`/vagas/${j.slug}`}
                    aria-label={`Ver vaga: ${j.title}`}
                  >
                    Ver oportunidade <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h3>
              {jobs.length
                ? "Não encontramos vagas com esses filtros."
                : "Novas oportunidades em breve."}
            </h3>
            <p>
              {jobs.length
                ? "Tente outro termo ou limpe os filtros para explorar todas as vagas."
                : "Volte a este portal para acompanhar as próximas vagas da Coopercica."}
            </p>
          </div>
        )}
        <div className={styles.values}>
          <span className="eyebrow">Uma cooperativa feita por pessoas</span>
          <h2>Cooperar é crescer juntos.</h2>
          <p>
            Qualidade, confiança e proximidade fazem parte da nossa história.
            Venha construir os próximos capítulos com a gente.
          </p>
          <Link href="/quem-somos">Conheça nossa história →</Link>
        </div>
      </div>
    </section>
  );
}
