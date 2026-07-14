"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

const links = [
  ["Quem Somos", "/quem-somos"],
  ["Nossas Lojas", "/lojas"],
  ["Delivery", "/delivery"],
  ["Drogaria", "/drogaria"],
  ["Revista", "/revista"],
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.inner}`}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Coopercica — página inicial"
        >
          <span className={styles.brandMark}>C</span>
          <span>COOPERCICA</span>
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          Menu
        </button>

        <nav
          id="main-navigation"
          className={`${styles.nav} ${open ? styles.open : ""}`}
          aria-label="Navegação principal"
        >
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}

          <a
            className={styles.cta}
            href="https://www.coopercicadelivery.com.br/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Comprar online <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
