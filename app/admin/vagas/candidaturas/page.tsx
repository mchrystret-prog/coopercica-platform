import { Suspense } from "react";
import { ApplicationsAdmin } from "@/components/admin/ApplicationsAdmin";
export default function Page() {
  return (
    <Suspense fallback={<p>Carregando candidaturas…</p>}>
      <ApplicationsAdmin />
    </Suspense>
  );
}
