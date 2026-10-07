import Link from "next/link";
import { MagazineAdmin } from "@/components/admin/MagazineAdmin";
import { ContentManager } from "@/components/admin/ContentManager";

export default function Page() {
  return <>
    <div className="form-status"><strong>Nessa edição</strong><p>Cadastre o resumo e os assuntos de cada revista para exibir ao lado da capa na Home.</p><Link className="button button-secondary" href="/admin/personalizacao?tab=magazine">Editar resumo e destaques</Link></div>
    <ContentManager kind="magazine" title="Revistas" createTitle="Nova edição" description="Gerencie as edições, capas e PDFs publicados no site."><MagazineAdmin /></ContentManager>
  </>;
}
