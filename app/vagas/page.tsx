import type { Metadata } from "next";
import { InternalPage } from "@/components/layout/InternalPage";
import { CareersPortal } from "@/components/careers/CareersPortal";
import { getJobs } from "@/lib/jobs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portal de Vagas | Coopercica",
  description:
    "Encontre oportunidades na Coopercica, filtre por setor e envie sua candidatura.",
};
export default async function Page() {
  const jobs = await getJobs();
  return (
    <InternalPage
      eyebrow="Carreiras Coopercica"
      title="Seu talento faz parte da nossa história."
      intro="Descubra oportunidades para crescer com uma cooperativa feita por pessoas."
    >
      <CareersPortal jobs={jobs} />
    </InternalPage>
  );
}
