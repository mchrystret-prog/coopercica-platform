"use client";
import Link from "next/link";
import { useState } from "react";
import {
  employmentNames,
  workModeNames,
  filterJobs,
  type Job,
} from "@/lib/jobs";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Container } from "@/components/ui/Container/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section/Section";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Careers.module.css";
export function CareersPortal({ jobs }: { jobs: Job[] }) {
  const [search, setSearch] = useState(""),
    [department, setDepartment] = useState(""),
    [city, setCity] = useState("");
  const filtered = filterJobs(jobs, { search, department, city });
  return (
    <>
      <Section id="oportunidades" aria-labelledby="opportunities-title">
        <Container>
          <SectionHeader
            id="opportunities-title"
            eyebrow="Seu próximo passo"
            title={["Encontre seu lugar", "na Coopercica."]}
            description="Explore as oportunidades e faça parte de uma história construída por pessoas."
          />
          <div className={styles.filterHeading}>
            <span className="ds-eyebrow">Oportunidades</span>
            <Badge>
              {jobs.length}{" "}
              {jobs.length === 1 ? "vaga aberta" : "vagas abertas"}
            </Badge>
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
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setCity("");
                }}
              >
                Limpar filtros
              </Button>
            ) : null}
          </div>
          {filtered.length ? (
            <div className={styles.grid}>
              {filtered.map((j) => (
                <Card className={styles.jobCard} key={j.id}>
                  <div className={styles.cardTop}>
                    <Badge className={styles.department}>{j.department}</Badge>
                    <span>
                      {j.openings} {j.openings === 1 ? "posição" : "posições"}
                    </span>
                  </div>
                  <h3 className="ds-subtitle">
                    <Link href={`/vagas/${j.slug}`}>{j.title}</Link>
                  </h3>
                  <p className={styles.location}>
                    <Icon name="pin" />
                    {[j.city, j.unit].filter(Boolean).join(" · ")}
                  </p>
                  <div className={styles.tags}>
                    <Badge variant="outline">
                      {employmentNames[j.employment_type]}
                    </Badge>
                    <Badge variant="outline">
                      {workModeNames[j.work_mode]}
                    </Badge>
                  </div>
                  <p className={styles.summary}>{j.description}</p>
                  <div className={styles.cardBottom}>
                    <small>
                      {j.closes_on
                        ? `Inscrições até ${new Date(j.closes_on + "T12:00:00Z").toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                        : "Inscrições abertas"}
                    </small>
                    <Button
                      variant="secondary"
                      href={`/vagas/${j.slug}`}
                      aria-label={`Ver vaga: ${j.title}`}
                    >
                      Ver oportunidade
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card as="div" variant="soft" className={styles.empty}>
              <h3 className="ds-subtitle">
                {jobs.length
                  ? "Não encontramos vagas com esses filtros."
                  : "Novas oportunidades em breve."}
              </h3>
              <p>
                {jobs.length
                  ? "Tente outro termo ou limpe os filtros para explorar todas as vagas."
                  : "Volte a este portal para acompanhar as próximas vagas da Coopercica."}
              </p>
            </Card>
          )}
        </Container>
      </Section>
      <Section tone="soft" aria-labelledby="cooperation-title">
        <Container>
          <SectionHeader
            id="cooperation-title"
            eyebrow="Uma cooperativa feita por pessoas"
            title={["Cooperar é", "crescer juntos."]}
            description="Qualidade, confiança e proximidade fazem parte da nossa história. Venha construir os próximos capítulos com a gente."
          />
          <Button href="/quem-somos" variant="secondary">
            Conheça nossa história
          </Button>
        </Container>
      </Section>
    </>
  );
}
