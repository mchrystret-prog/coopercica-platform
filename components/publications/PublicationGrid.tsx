import Image from "next/image";
import { Publication, publicationPath } from "@/types/publication";
export function PublicationGrid({ items }: { items: Publication[] }) {
  return <div className="publication-grid">{items.map((item) => <article key={item.id}>
    {item.cover ? <Image width={400} height={550} src={item.cover} alt={`Capa: ${item.title}`} loading="lazy" /> : <div className="publication-cover" aria-hidden="true"><span>COOPERCICA</span><strong>{item.kind === "folheto" ? "Folheto de ofertas" : "Revista"}</strong><span>{item.edition}</span></div>}
    <div><h2>{item.title}</h2><p>{item.edition}</p>{item.pdfFile ? <div className="publication-actions"><a className="button" href={publicationPath(item)}>Folhear</a><a href={`/api/publications/${item.id}/pdf`} target="_blank" rel="noopener noreferrer">Abrir PDF</a><a href={`/api/publications/${item.id}/pdf?download=1`}>Baixar PDF</a></div> : <p>PDF em breve.</p>}</div>
  </article>)}</div>;
}
