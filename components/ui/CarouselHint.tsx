import styles from "./CarouselHint.module.css";

export function CarouselHint({ id }: { id: string }) {
  return (
    <p id={id} className={styles.hint}>
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className={styles.touch}>Deslize para os lados</span>
      <span className={styles.mouse}>Clique e arraste para os lados</span>
    </p>
  );
}
