import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.intro}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>C</span>
            <span>COOPERCICA</span>
          </div>

          <p>
            Qualidade, proximidade e cooperação há mais de cinco décadas.
          </p>

          <strong className={styles.signature}>
            Cooperar é <span>crescer juntos.</span>
          </strong>
        </div>

        <div className={styles.column}>
          <strong>Institucional</strong>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/lojas">Nossas Lojas</Link>
        </div>

        <div className={styles.column}>
          <strong>Serviços</strong>
          <Link href="/delivery">Delivery</Link>
          <Link href="/drogaria">Drogaria</Link>
          <Link href="/revista">Revista</Link>
        </div>

        <div className={styles.column}>
          <strong>Atendimento</strong>
          <a href="mailto:faleconosco@coopercica.com.br">Fale Conosco</a>
          <span>Jundiaí e região</span>
        </div>
      </div>

      <div className={`shell ${styles.bottom}`}>
        <span>© 2026 Coopercica. Todos os direitos reservados.</span>
        <span>Uma cooperativa feita por pessoas.</span>
      </div>
    </footer>
  );
}
