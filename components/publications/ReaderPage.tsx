import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PdfReader } from "./PdfReader";
import { getPublication, getPublications } from "@/lib/publications";
import { PublicationKind, publicationPath } from "@/types/publication";
export async function ReaderPage({ id, kind }: { id: string; kind: PublicationKind }) {
  const item = await getPublication(id);
  if (!item || item.kind !== kind || !item.pdfFile) notFound();
  const others = (await getPublications(kind)).filter((entry) => entry.id !== id && entry.pdfFile).slice(0, 6);
  return <><Header /><main><PdfReader id={item.id} kind={kind} title={item.title} /><section className="publication-section shell"><h2>Outras publicações</h2><div className="publication-actions">{others.map((other) => <Link key={other.id} href={publicationPath(other)}>{other.title}</Link>)}<Link href={kind === "folheto" ? "/folheteria" : "/revista"}>Ver todas</Link></div></section></main><Footer /></>;
}
