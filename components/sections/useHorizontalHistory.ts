"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import styles from "./History.module.css";

export function useHorizontalHistory(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const drag = useRef({ id: -1, x: 0, y: 0, left: 0, moved: false });

  const goToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(itemCount - 1, index));
    track.scrollTo({
      left: next * track.clientWidth,
      // Distant year selections jump directly instead of replaying intervening chapters.
      behavior: Math.abs(next - activeRef.current) > 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [itemCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const index = Math.max(0, Math.min(itemCount - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      if (activeRef.current !== index) {
        activeRef.current = index;
        setActiveIndex(index);
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(() => {
      // Keep the selected chapter when the viewport changes, without moving the page.
      track.scrollTo({ left: activeRef.current * track.clientWidth, behavior: "instant" });
    });
    observer.observe(track);
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [itemCount]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || !event.isPrimary || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (state.id !== event.pointerId) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.moved) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { state.id = -1; return; }
      if (Math.abs(dx) <= 6) return;
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add(styles.dragging);
    }
    event.currentTarget.scrollLeft = state.left - dx;
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== event.pointerId) return;
    drag.current.id = -1;
    event.currentTarget.classList.remove(styles.dragging);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goToIndex(activeRef.current + (event.key === "ArrowRight" ? 1 : -1));
  };

  return { trackRef, activeIndex, goToIndex, trackHandlers: {
    onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => { if (!drag.current.moved) endDrag(event); },
    onKeyDown,
  } };
}
