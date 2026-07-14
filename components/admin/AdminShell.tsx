import Link from "next/link";
import type { ReactNode } from "react";

const items = [
  ["/admin", "Visão geral"],
  ["/admin/campanhas", "Campanhas"],
  ["/admin/revistas", "Revistas"],
  ["/admin/lojas", "Lojas"],
  ["/admin/analytics", "Analytics"],
  ["/admin/configuracoes", "Configurações"],
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside>
        <Link className="admin-brand" href="/">Coopercica</Link>
        <span className="admin-kicker">Painel de Marketing</span>
        <nav>{items.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
        <Link className="admin-back" href="/">← Voltar ao site</Link>
      </aside>
      <main>{children}</main>
    </div>
  );
}
