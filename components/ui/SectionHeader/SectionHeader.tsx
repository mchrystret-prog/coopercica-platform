import styles from "./SectionHeader.module.css";

type Props = {
  eyebrow?: string;
  title: string | string[];
  description?: string;
  light?: boolean;
  stacked?: boolean;
  id?: string;
  className?: string;
};

export function SectionHeader({ eyebrow, title, description, light = false, stacked = false, id, className = "" }: Props) {
  const lines = Array.isArray(title) ? title : [title];
  return <div className={`${styles.header} ${stacked ? styles.stack : ""} ${light ? styles.light : ""} ${className}`.trim()}>
    <div>
      {eyebrow ? <span className={`ds-eyebrow ${styles.eyebrow}`}>{eyebrow}</span> : null}
      <h2 id={id} className={`ds-title ${styles.title}`}>{lines.map((line) => <span key={line}>{line}</span>)}</h2>
    </div>
    {description ? <p className={`ds-copy ${styles.description}`}>{description}</p> : null}
  </div>;
}
