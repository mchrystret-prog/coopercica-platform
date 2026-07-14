import type { ReactNode } from "react";
export function AdminTable({ children }: { children: ReactNode }) { return <div className="admin-table">{children}</div>; }
export function AdminToolbar({ title, description, action }: { title: string; description: string; action: string }) { return <header className="admin-header"><div><span className="eyebrow">Conteúdo</span><h1>{title}</h1><p>{description}</p></div><button className="button" type="button">{action}</button></header>; }
