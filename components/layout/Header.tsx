"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";
import Image from "next/image";

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
        <Image
          src="/images/logo.png"
          alt="Coopercica"
          width={861}
          height={145}
          priority
          className={styles.logo}
        />
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
        <a
          className={styles.cta}
          href="https://www.coopercicadelivery.com.br/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprar online
          <span aria-hidden="true">↗</span>
        </a>

        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>

    </div>
  </header>
);
}