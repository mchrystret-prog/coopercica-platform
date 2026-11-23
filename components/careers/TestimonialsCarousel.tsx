"use client";

import { useEffect, useRef, useState } from "react";
import type { CareersTestimonial } from "@/lib/careers-testimonials";
import styles from "./TestimonialsCarousel.module.css";

export function TestimonialsCarousel({ testimonials }: { testimonials: CareersTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const move = (direction: "next" | "previous") => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-testimonial-card]");
    if (!card) return;
    const distance = card.getBoundingClientRect().width + 20;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    if (direction === "next" && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === "previous" && track.scrollLeft <= 8) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (paused || testimonials.length < 2) return;
    const timer = window.setInterval(() => move("next"), 6000);
    return () => window.clearInterval(timer);
  }, [paused, testimonials.length]);

  return (
    <div className={styles.carousel} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
    }}>
      <div className={styles.track} ref={trackRef} aria-label="Depoimentos dos colaboradores">
        {testimonials.map((item) => (
          <article className={styles.card} key={item.id} data-testimonial-card>
            <span className={styles.quoteMark} aria-hidden="true">“</span>
            <blockquote>{item.quote}</blockquote>
            <div className={styles.person}>
              <strong>{item.name}</strong>
              <span>{[item.role, item.tenure].filter(Boolean).join(" · ")}</span>
            </div>
          </article>
        ))}
      </div>
      {testimonials.length > 1 ? (
        <div className={styles.controls}>
          <span>Conheça algumas histórias de quem faz parte da Coopercica.</span>
          <div className={styles.buttons}>
            <button type="button" aria-label="Depoimento anterior" onClick={() => move("previous")}>←</button>
            <button type="button" aria-label="Próximo depoimento" onClick={() => move("next")}>→</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
