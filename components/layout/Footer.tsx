import Image from "next/image";
import Link from "next/link";
import { getPolicies } from "@/lib/policies";
import styles from "./Footer.module.css";

export async function Footer() {
  const policies = await getPolicies();
  return (
    <footer id="footer" className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.intro}>
          <a href="#home" className={styles.brand} aria-label="Voltar ao início"><Image src="/images/logo-white.png" alt="Coopercica" width={861} height={145} className={styles.logo}/></a>
          <p>Qualidade, proximidade e cooperação há mais de cinco décadas.</p>
          <strong className={styles.signature}>Cooperar é <span>crescer juntos.</span></strong>
        </div>
        <div className={styles.column}><strong>Institucional</strong><a href="#historia">Quem Somos</a><a href="#lojas">Nossas Lojas</a></div>
        <div className={styles.column}><strong>Serviços</strong><a href="#delivery">Delivery</a><a href="#drogaria">Drogaria</a><a href="#revista">Revista</a></div>
        <div className={styles.column}><strong>Atendimento</strong><a href="mailto:faleconosco@coopercica.com.br">Fale Conosco</a><span>Jundiaí e região</span></div>
        <div className={styles.column}><Link href="/politicas" className={styles.columnTitle}>Políticas e documentos</Link>{policies.slice(0,5).map(p=><a key={p.id} href={p.file_url} target="_blank" rel="noopener noreferrer">{p.title}</a>)}</div>
      </div>
      <div className={`shell ${styles.bottom}`}><span>© 2026 Coopercica. Todos os direitos reservados.</span><span>Uma cooperativa feita por pessoas.</span></div>
    </footer>
  );
}