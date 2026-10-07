import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import styles from "./CoopermaisBanner.module.css";

export function CoopermaisBanner() {
  return (
    <section id="coopermais" className={styles.section} aria-label="Seja Cliente Coopermais">
      <Container>
        <div className={styles.badge}>
          <Image
            src="/coopermais/seja-coopermais.png"
            alt="Seja Cliente Coopermais. Uma família reunida convida você a fazer parte."
            width={2048}
            height={522}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className={styles.image}
          />
          <Button
            href="https://soucoopermais.com.br/"
            external
            className={styles.cta}
            data-analytics-id="cta:coopermais-banner"
            data-analytics-label="Quero ser Coopermais"
          >
            Quero ser Coopermais
          </Button>
        </div>
      </Container>
    </section>
  );
}
