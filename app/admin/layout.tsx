import type { ReactNode } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
export const metadata = { title: "CMS", robots: { index: false, follow: false, noarchive: true } };
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
