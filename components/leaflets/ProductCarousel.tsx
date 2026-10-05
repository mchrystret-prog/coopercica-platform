"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
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
  const drag = useRef({
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
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

  function startDrag(event: PointerEvent<HTMLUListElement>) {
    drag.current.moved = false;
    const element = event.currentTarget;
    if (
      event.pointerType === "touch" ||
      event.button !== 0 ||
      !event.isPrimary ||
      element.scrollWidth <= element.clientWidth + 2
    )
      return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      moved: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLUListElement>) {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) <= 6) return;
    const element = event.currentTarget;
    if (!state.moved) {
      state.moved = true;
      element.setPointerCapture(event.pointerId);
      element.classList.add(styles.dragging);
    }
    element.scrollLeft = state.scrollLeft - delta;
  }

  function endDrag(event: PointerEvent<HTMLUListElement>) {
    const state = drag.current;
    if (state.pointerId !== event.pointerId) return;
    const element = event.currentTarget;
    const offset = element.scrollLeft;
    state.pointerId = -1;
    element.classList.remove(styles.dragging);
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    if (state.moved) {
      const cardWidth =
        element.firstElementChild?.getBoundingClientRect().width ??
        element.clientWidth;
      const step =
        cardWidth + (parseFloat(getComputedStyle(element).columnGap) || 0);
      element.scrollTo({
        left: Math.round(offset / step) * step,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }

  function preventDragClick(event: MouseEvent<HTMLUListElement>) {
    if (drag.current.moved && event.detail !== 0) {
      event.preventDefault();
      event.stopPropagation();
    }
    drag.current.moved = false;
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
          className={`${styles.track} ${edges.start && edges.end ? styles.staticTrack : ""}`}
          tabIndex={0}
          aria-label={`Produtos de ${title}`}
          onKeyDown={onKeyDown}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onPointerLeave={(event) => {
            if (!drag.current.moved) endDrag(event);
          }}
          onClickCapture={preventDragClick}
          onDragStart={(event) => event.preventDefault()}
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
