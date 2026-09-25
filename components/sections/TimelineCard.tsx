import { HistoryItem } from "@/data/history";
import styles from "./History.module.css";

interface TimelineCardProps {
  item: HistoryItem;
  index: number;
  total: number;
  active: boolean;
}

export function TimelineCard({ item, index, total, active }: TimelineCardProps) {
  return (
    <article
      data-history-slide
      id={`history-${item.id}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} de ${total}: ${item.year}`}
      aria-hidden={!active}
      className={`${styles.slide} ${styles[item.theme]}`}
    >
      <div className={styles.yearWatermark} aria-hidden="true">
        {item.year}
      </div>

      <div className={styles.media}>
        <img
          data-history-image
          src={item.image}
          alt={item.imageAlt}
          className={styles.image}
          loading={index < 2 ? "eager" : "lazy"}
          draggable={false}
        />
      </div>

      <div data-history-content className={styles.content}>
        <span className={styles.eyebrow}>{item.eyebrow}</span>
        <strong className={styles.year}>{item.year}</strong>
        <h3>{item.title}</h3>
        <p>{item.description}</p>

        <span className={styles.counter}>
          Capítulo {String(index + 1).padStart(2, "0")} de{" "}
          {String(total).padStart(2, "0")}
        </span>
      </div>
    </article>
  );
}
