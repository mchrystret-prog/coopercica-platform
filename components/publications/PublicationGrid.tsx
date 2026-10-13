import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button/Button";
import { type Publication, publicationPath } from "@/types/publication";
import styles from "./PublicationGrid.module.css";

function distinctEdition(item: Publication) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
  const edition = normalize(item.edition);
  return edition && !(` ${normalize(item.title)} `).includes(` ${edition} `) ? item.edition : null;
}

export function PublicationGrid({ items }: { items: Publication[] }) {
  if (!items.length) return <p className={styles.empty}>Novas edições estarão disponíveis em breve.</p>;
  return <div className={styles.grid}>{items.map((item) => {
    const edition = distinctEdition(item);
    const cover = item.cover ? <Image width={400} height={500} src={item.cover} alt={`Capa de ${item.title}`} loading="lazy" sizes="(max-width: 600px) calc(100vw - 80px), (max-width: 1000px) 42vw, 320px" /> : <div className={styles.placeholder} aria-hidden="true"><span>COOPERCICA</span><strong>{item.kind === "revista" ? "Revista" : "Folheto de ofertas"}</strong></div>;
    return <article key={item.id} className={styles.card}>
      {item.pdfFile ? <Link className={styles.cover} href={publicationPath(item)} aria-label={`Folhear ${item.title}`}>{cover}</Link> : <div className={styles.cover}>{cover}</div>}
      <div className={styles.info}>
        <h2>{item.title}</h2>
        {edition ? <p className={styles.edition}>{edition}</p> : null}
        {item.pdfFile ? <>
          <Button href={publicationPath(item)} className={styles.read} aria-label={`Folhear ${item.title}`}>Folhear edição</Button>
          <div className={styles.files}>
            <a href={`/api/publications/${item.id}/pdf`} target="_blank" rel="noopener noreferrer" aria-label={`Abrir PDF de ${item.title} em uma nova aba`}>Abrir PDF</a>
            <a href={`/api/publications/${item.id}/pdf?download=1`} aria-label={`Baixar PDF de ${item.title}`}>Baixar PDF</a>
          </div>
        </> : <p className={styles.pending}>PDF em breve.</p>}
      </div>
    </article>;
  })}</div>;
}
