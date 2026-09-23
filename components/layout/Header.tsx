"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const links = [
  { label: "Quem Somos", href: "#historia", sectionId: "historia" },
  { label: "Nossas Lojas", href: "#lojas", sectionId: "lojas" },
  { label: "Ofertas", href: "#ofertas", sectionId: "ofertas" },
  { label: "Delivery", href: "#delivery", sectionId: "delivery" },
  { label: "Drogaria", href: "#drogaria", sectionId: "drogaria" },
  { label: "Revista", href: "#revista", sectionId: "revista" },
];

export function Header({logo="/images/logo.png",siteName="Coopercica",deliveryUrl="https://www.coopercicadelivery.com.br/"}:{logo?:string;siteName?:string;deliveryUrl?:string}={}) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = ["home", ...links.map((link) => link.sectionId)];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.inner}`}>
        <a
          href={onHome ? "#home" : "/"}
          className={styles.brand}
          aria-label="Coopercica — voltar ao início"
          onClick={closeMenu}
        >
          <Image
            src={logo}
            alt={siteName}
            width={861}
            height={145}
            priority
            className={styles.logo}
          />
        </a>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <span aria-hidden="true">{open ? "Fechar" : "Menu"}</span>
        </button>

        <nav
          id="main-navigation"
          className={`${styles.nav} ${open ? styles.open : ""}`}
          aria-label="Navegação principal"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href.startsWith("#") && !onHome ? `/${link.href}` : link.href}
              onClick={closeMenu}
              className={
                (onHome && activeSection === link.sectionId) ? styles.active : undefined
              }
              aria-current={
                (onHome && activeSection === link.sectionId) ? "page" : undefined
              }
            >
              {link.label}
            </a>
          ))}

          <a
            className={styles.cta}
            href={deliveryUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            Comprar online
            <span className={styles.ctaIcon} aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
