import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPolicies } from "@/lib/policies";
import { getSiteSetting } from "@/lib/site";
import { footerContact, socialNetworks, safeSocialUrl, contactWhatsappHref } from "@/lib/footer-contact";
import { FloatingActions } from "./FloatingActions";
import { ContactIcon } from "./ContactIcon";
import styles from "./Footer.module.css";
export async function Footer() {
    const [policies, settings] = await Promise.all([getPolicies(), getSiteSetting<Record<string, string>>("footer_contact", {})]);
    const contact = footerContact(settings);
    const whatsapp = contactWhatsappHref(contact.whatsappHref);
    return (<footer id="footer" className={styles.footer} style={{ "--contact-background": contact.backgroundColor, "--social-color": contact.socialColor } as CSSProperties}>
      {contact.enabled !== "false" ? <div className="shell"><section className={styles.contactBanner} aria-labelledby="footer-contact-title">
        <div className={styles.contactCopy}><h2 id="footer-contact-title">{contact.title}</h2><p>{contact.description}</p></div>
        <div className={styles.contactActions}>
          <Link className={styles.contactButton} href={whatsapp}><ContactIcon name="whatsapp"/>{contact.whatsappLabel}</Link>
          <a className={styles.emailButton} href={`mailto:${contact.email}`}><ContactIcon name="email"/><span>{contact.emailLabel}</span></a>
        </div>
      </section></div> : null}
      <div className={`shell ${styles.grid}`}>
        <div className={styles.intro}>
          <Link href="/#home" className={styles.brand} aria-label="Voltar ao início">
            <Image src="/images/logo-white.png" alt="Coopercica" width={861} height={145} className={styles.logo}/>
          </Link>
          <p>Qualidade, proximidade e cooperação há mais de cinco décadas.</p>
          <strong className={styles.signature}>
            Cooperar é <span>crescer juntos.</span>
          </strong>
          <nav className={styles.socialLinks} aria-label="Redes sociais da Coopercica">
            {socialNetworks.map(network => { const href = safeSocialUrl(contact[network]); return href ? <a key={network} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${network === "youtube" ? "YouTube" : network === "linkedin" ? "LinkedIn" : network === "instagram" ? "Instagram" : "Facebook"} da Coopercica (abre em nova aba)`}><ContactIcon name={network}/></a> : null; })}
          </nav>
        </div>
        <div className={styles.column}>
          <strong>Institucional</strong>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/lojas">Nossas Lojas</Link>
          <Link href="/vagas">Portal de Vagas</Link>
        </div>
        <div className={styles.column}>
          <strong>Serviços</strong>
          <Link href="/videos">Vídeos</Link>
          <Link href="/delivery">Delivery</Link>
          <Link href="/drogaria">Drogaria</Link>
          <Link href="/revista">Revista</Link>
        </div>
        <div className={styles.column}>
          <strong>Atendimento</strong>
          <a href={`mailto:${contact.email}`}>{contact.title}</a>
          <span>Jundiaí e região</span>
        </div>
        <div className={styles.column}>
          <Link href="/politicas" className={styles.columnTitle}>
            Políticas e documentos
          </Link>
          {policies.slice(0, 5).map((p) => (<a key={p.id} href={p.file_url} target="_blank" rel="noopener noreferrer">
              {p.title}
            </a>))}
        </div>
      </div>
      <div className={`shell ${styles.bottom}`}>
        <span>© 2026 Coopercica. Todos os direitos reservados.</span>
        <span>Uma cooperativa feita por pessoas.</span>
      </div>
      <FloatingActions whatsappHref={whatsapp} whatsappLabel={contact.whatsappLabel}/>
    </footer>);
}
