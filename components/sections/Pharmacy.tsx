"use client";

import Link from "next/link";
import { pharmacy } from "@/data/pharmacy";
import styles from "./Pharmacy.module.css";

export function Pharmacy() {
  return (
    <section
      className={styles.section}
      aria-labelledby="pharmacy-title"
    >
      <div className={styles.shell}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            {pharmacy.eyebrow}
          </span>

          <h2 id="pharmacy-title">
            {pharmacy.title}
          </h2>

          <p className={styles.description}>
            {pharmacy.description}
          </p>

          <ul
            className={styles.highlights}
            aria-label="Destaques da Coopercica Drogaria"
          >
            {pharmacy.highlights.map((item) => (
              <li key={item}>
                {item}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link
              href={pharmacy.ctaHref}
              className="button"
            >
              {pharmacy.ctaLabel}
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div
            className={styles.image}
            role="img"
            aria-label={pharmacy.imageAlt}
            style={{
              backgroundImage: `
                linear-gradient(
                  180deg,
                  rgba(13,36,17,.02),
                  rgba(13,36,17,.18)
                ),
                url(${pharmacy.image})
              `,
            }}
          />
        </div>
      </div>
    </section>
  );
}