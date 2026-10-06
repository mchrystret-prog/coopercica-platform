import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Container } from "@/components/ui/Container/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section/Section";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InternalPage } from "@/components/layout/InternalPage";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { getJob, employmentNames, workModeNames } from "@/lib/jobs";
import styles from "@/components/careers/Careers.module.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  return {
    title: job
      ? `${job.title} | Vagas Coopercica`
      : "Vaga indisponível | Coopercica",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();
  return (
    <InternalPage
      eyebrow={job.department}
      title={job.title}
      intro={[
        job.city,
        job.unit,
        employmentNames[job.employment_type],
        workModeNames[job.work_mode],
      ]
        .filter(Boolean)
        .join(" · ")}
    >
      <Section>
        <Container>
          <Button
            variant="ghost"
            className={styles.back}
            href="/vagas"
            icon={<Icon name="chevron-left" />}
          >
            Todas as oportunidades
          </Button>
          <div className={styles.detailLayout}>
            <div className={styles.detail}>
              {[
                ["Sobre a oportunidade", job.description],
                ["Responsabilidades", job.responsibilities],
                ["O que buscamos", job.requirements],
                ["Benefícios", job.benefits],
              ]
                .filter(([, value]) => value)
                .map(([heading, value]) => (
                  <section key={heading}>
                    <h2 className="ds-subtitle">{heading}</h2>
                    <div className={styles.text}>{value}</div>
                  </section>
                ))}
              <ApplicationForm jobId={job.id} title={job.title} />
            </div>
            <aside className={styles.aside} aria-label="Resumo da vaga">
              <Card as="div" variant="soft">
                <dl>
                  {[
                    ["Setor", job.department],
                    ["Local", [job.city, job.unit].filter(Boolean).join(" · ")],
                    ["Contrato", employmentNames[job.employment_type]],
                    ["Modelo", workModeNames[job.work_mode]],
                    ["Posições", String(job.openings)],
                    [
                      "Remuneração",
                      job.salary || "Informada durante o processo",
                    ],
                    [
                      "Inscrições",
                      job.closes_on
                        ? `Até ${new Date(job.closes_on + "T12:00:00Z").toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                        : "Abertas",
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <Button href="#candidatura" icon={<Icon name="arrow-right" />}>
                  Quero me candidatar
                </Button>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </InternalPage>
  );
}
