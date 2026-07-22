"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { RefObject, useLayoutEffect, useRef } from "react";

interface UseHorizontalHistoryOptions {
  viewportRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<HTMLDivElement | null>;
  travelerRef: RefObject<HTMLDivElement | null>;
  itemCount: number;
  onActiveIndexChange: (index: number) => void;
}

export function useHorizontalHistory({
  viewportRef,
  trackRef,
  progressRef,
  travelerRef,
  itemCount,
  onActiveIndexChange,
}: UseHorizontalHistoryOptions) {
  const triggerRef = useRef<any>(null);
  const gsapRef = useRef<any>(null);
  const navigationTweenRef = useRef<any>(null);
  const activeIndexRef = useRef(0);

  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef.current = gsap;

      const viewport = viewportRef.current;
      const track = trackRef.current;
      const progress = progressRef.current;
      const traveler = travelerRef.current;

      if (!viewport || !track || !progress || !traveler) return;

      const media = gsap.matchMedia();

      media.add("(min-width: 901px)", () => {
        const slides = Array.from(
          track.querySelectorAll<HTMLElement>("[data-history-slide]"),
        );

        if (slides.length < 2) return;

        const segmentCount = slides.length - 1;
        const getDistance = () =>
          Math.max(1, track.scrollWidth - viewport.clientWidth);

        gsap.set(track, { x: 0 });
        gsap.set(progress, { scaleX: 0 });
        gsap.set(traveler, { left: "0%", scale: 1, rotate: 0 });

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          paused: true,
        });

        const trigger = ScrollTrigger.create({
          id: "history-horizontal-v2",
          trigger: viewport,
          animation: tween,
          start: "top 82px",
          end: () => `+=${getDistance()}`,
          pin: viewport,
          pinSpacing: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const rawProgress = self.progress;
            const exactIndex = rawProgress * segmentCount;
            const nearestIndex = Math.min(
              slides.length - 1,
              Math.max(0, Math.round(exactIndex)),
            );

            const markerProgress = nearestIndex / segmentCount;
            const isNearMarker =
              Math.abs(rawProgress - markerProgress) <= 0.018;
            const travelerProgress = isNearMarker
              ? markerProgress
              : rawProgress;

            gsap.set(progress, { scaleX: rawProgress });
            gsap.set(traveler, {
              left: `${travelerProgress * 100}%`,
              scale: isNearMarker ? 1.09 : 1,
              rotate: isNearMarker ? 0 : self.direction > 0 ? 1.4 : -1.4,
            });

            slides.forEach((slide, index) => {
              const image = slide.querySelector<HTMLElement>(
                "[data-history-image]",
              );
              const content = slide.querySelector<HTMLElement>(
                "[data-history-content]",
              );
              const distance = Math.min(1, Math.abs(exactIndex - index));
              const normalized = Math.max(0, (distance - 0.14) / 0.86);

              if (image) {
                gsap.set(image, {
                  filter: `blur(${normalized * 6}px) saturate(${1 - normalized * 0.08}) contrast(${1 - normalized * 0.035})`,
                  opacity: 1 - normalized * 0.12,
                  scale: 1 + normalized * 0.028,
                });
              }

              if (content) {
                gsap.set(content, {
                  filter: `blur(${normalized * 3}px)`,
                  opacity: 1 - normalized * 0.34,
                  y: normalized * 18,
                });
              }
            });

            if (activeIndexRef.current !== nearestIndex) {
              activeIndexRef.current = nearestIndex;
              onActiveIndexChange(nearestIndex);
            }
          },
        });

        triggerRef.current = trigger;

        const observer = new ResizeObserver(() => ScrollTrigger.refresh());
        observer.observe(viewport);
        observer.observe(track);

        const refreshAfterImages = () => ScrollTrigger.refresh();
        const images = Array.from(track.querySelectorAll("img"));
        images.forEach((image) => {
          if (!image.complete) {
            image.addEventListener("load", refreshAfterImages, { once: true });
          }
        });

        requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          observer.disconnect();
          images.forEach((image) =>
            image.removeEventListener("load", refreshAfterImages),
          );
          navigationTweenRef.current?.kill?.();
          triggerRef.current = null;
          trigger.kill(true);
          tween.kill();
          gsap.set(track, { clearProps: "transform" });
          gsap.set(slides, { clearProps: "transform" });
          gsap.set(
            track.querySelectorAll<HTMLElement>(
              "[data-history-image], [data-history-content]",
            ),
            { clearProps: "transform,filter,opacity" },
          );
        };
      });

      media.add("(max-width: 900px)", () => {
        triggerRef.current = null;
        activeIndexRef.current = 0;
        onActiveIndexChange(0);
        gsap.set(track, { clearProps: "transform" });
      });

      cleanup = () => media.revert();
    };

    void setup();

    return () => {
      cancelled = true;
      navigationTweenRef.current?.kill?.();
      triggerRef.current = null;
      cleanup?.();
    };
  }, [itemCount, onActiveIndexChange, progressRef, trackRef, travelerRef, viewportRef]);

  const goToIndex = (index: number) => {
    const trigger = triggerRef.current;
    const gsap = gsapRef.current;
    if (!trigger || !gsap) return;

    const clamped = Math.min(itemCount - 1, Math.max(0, index));
    const progress = clamped / Math.max(1, itemCount - 1);
    const destination = trigger.start + (trigger.end - trigger.start) * progress;

    navigationTweenRef.current?.kill?.();

    const state = { y: window.scrollY };
    navigationTweenRef.current = gsap.to(state, {
      y: destination,
      duration: 1.1,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => window.scrollTo(0, state.y),
      onComplete: () => {
        window.scrollTo(0, destination);
        trigger.update();
      },
    });
  };

  return { goToIndex };
}
