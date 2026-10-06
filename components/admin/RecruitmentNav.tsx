"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./RecruitmentAdmin.module.css";
export function RecruitmentNav() {
  const path = usePathname();
  return (
    <nav className={styles.tabs} aria-label="Portal de Vagas no CMS">
      <Link
        href="/admin/vagas"
        aria-current={path === "/admin/vagas" ? "page" : undefined}
      >
        Vagas
      </Link>
      <Link
        href="/admin/vagas/candidaturas"
        aria-current={path === "/admin/vagas/candidaturas" ? "page" : undefined}
      >
        Candidaturas
      </Link>
      <Link href="/vagas" target="_blank" rel="noopener noreferrer">
        Ver portal público ↗
      </Link>
    </nav>
  );
}
