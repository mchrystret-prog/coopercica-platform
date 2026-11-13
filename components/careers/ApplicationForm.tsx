"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { SUPABASE_URL } from "@/lib/leaflets";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./Careers.module.css";
export function ApplicationForm({
  jobId,
  title,
}: {
  jobId: string;
  title: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sent) return;
    const frame = requestAnimationFrame(() => {
      const element = confirmation.current;
      if (!element) return;
      element.focus({ preventScroll: true });
      element.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [sent]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("resume") as File;
    setError("");
    if (
      !file?.size ||
      file.type !== "application/pdf" ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Selecione um currículo em PDF, de até 5 MB.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/careers-apply`, {
        method: "POST",
        body: data,
        credentials: "omit",
      });
      const result = await r.json().catch(() => ({}));
      if (!r.ok)
        throw new Error(
          result.message || "Não foi possível enviar. Tente novamente.",
        );
      form.reset();
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar agora.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card
      as="section"
      className={styles.application}
      id="candidatura"
      aria-labelledby={sent ? "application-success-title" : "application-title"}
    >
      {!sent ? <SectionHeader
        id="application-title"
        eyebrow="Vamos nos conhecer"
        title="Candidate-se à vaga"
        description={title}
        stacked
      /> : null}
      {sent ? (
        <div ref={confirmation} className={styles.success} role="status" tabIndex={-1} aria-labelledby="application-success-title">
          <h2 id="application-success-title" className="ds-subtitle">Candidatura recebida!</h2>
          <p>
            Que bom saber que você quer fazer parte da nossa história! Obrigado por
            compartilhar sua trajetória e dar esse passo com a Coopercica.
          </p>
          <p>
            Recebemos sua candidatura para a vaga de <strong>{title}</strong>.
            Nossa equipe de RH vai conhecer seu perfil e, se você avançar para a
            próxima etapa, entrará em contato pelos dados informados.
          </p>
          <Button href="/vagas" variant="secondary">
            Explorar outras oportunidades
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className={styles.form} data-analytics-ignore>
          <input type="hidden" name="job_id" value={jobId} />
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <fieldset disabled={busy}>
            <label>
              Nome completo
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
              />
            </label>
            <label>
              E-mail
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
              />
            </label>
            <label>
              Telefone
              <input
                name="phone"
                type="tel"
                required
                minLength={8}
                maxLength={24}
                pattern="[0-9+ ()\-]{8,24}"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
              />
            </label>
            <label>
              Cidade onde você mora
              <input
                name="city"
                required
                minLength={2}
                maxLength={100}
                autoComplete="address-level2"
              />
            </label>
            <label className={styles.full}>
              Uma breve apresentação <small>(opcional)</small>
              <textarea
                name="message"
                maxLength={4000}
                rows={4}
                placeholder="Conte um pouco sobre você e sua experiência."
              />
            </label>
            <label className={styles.full}>
              Seu currículo
              <input
                name="resume"
                type="file"
                accept="application/pdf,.pdf"
                required
              />
              <small>
                PDF de até 5 MB. Evite incluir dados que não sejam necessários
                para o processo seletivo.
              </small>
            </label>
            <label className={`${styles.consent} ${styles.full}`}>
              <input type="checkbox" name="consent" value="accepted" required />
              <span>
                Autorizo o uso dos dados e do currículo enviados para avaliar
                esta candidatura e entrar em contato durante o processo
                seletivo. Consulte nossas{" "}
                <Link
                  className="ds-link"
                  href="/politicas"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  políticas e documentos
                </Link>
                .
              </span>
            </label>
            <div className={styles.full}>
              {error ? (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              ) : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Enviando candidatura…" : "Enviar candidatura"}
              </Button>
              <p className={styles.note}>
                Seus dados e currículo serão acessados somente pela equipe
                autorizada de recrutamento.
              </p>
            </div>
          </fieldset>
        </form>
      )}
    </Card>
  );
}
