"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./ProductCarousel.module.css";

export function ProductCarousel({
  title,
  headingId,
  artworkUrl,
  children,
}: {
  title: string;
  headingId: string;
  artworkUrl?: string;
  children: ReactNode;
}) {
  const products = Children.toArray(children);
  const track = useRef<HTMLUListElement>(null);
  const trackId = `${headingId}-products`;
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const start = element.scrollLeft <= 2;
      const end =
        element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
      setEdges((current) =>
        current.start === start && current.end === end
          ? current
          : { start, end },
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [products.length]);

  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const cardWidth =
      element.firstElementChild?.getBoundingClientRect().width ??
      element.clientWidth;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      event.currentTarget.scrollTo({
        left: event.key === "Home" ? 0 : event.currentTarget.scrollWidth,
        behavior: "instant",
      });
    }
  }

  return (
    <div
      className={`${styles.carousel} ${artworkUrl ? styles.withArtwork : ""}`}
      role="group"
      aria-roledescription="carrossel"
      aria-labelledby={headingId}
    >
      <div className={styles.heading}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            aria-label={`Produtos anteriores de ${title}`}
            aria-controls={trackId}
            disabled={edges.start}
            onClick={() => move(-1)}
          >
            <Icon name="chevron-left" />
          </button>
          <button
            type="button"
            aria-label={`Próximos produtos de ${title}`}
            aria-controls={trackId}
            disabled={edges.end}
            onClick={() => move(1)}
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      </div>
      <div className={styles.body}>
        {artworkUrl ? (
          <div
            className={styles.artwork}
            aria-hidden="true"
            style={{ backgroundImage: `url(${JSON.stringify(artworkUrl)})` }}
          />
        ) : null}
        <ul
          id={trackId}
          ref={track}
          className={styles.track}
          tabIndex={0}
          aria-label={`Produtos de ${title}`}
          onKeyDown={onKeyDown}
        >
          {products.map((product, index) => (
            <li
              className={styles.item}
              key={isValidElement(product) ? product.key : index}
            >
              {product}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
