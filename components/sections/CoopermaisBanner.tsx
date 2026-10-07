"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { getCoopermaisBanner } from "@/lib/coopermais-banner";
import styles from "./CoopermaisBanner.module.css";
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const motionSnapshot = () => window.matchMedia(motionQuery).matches;
const serverSnapshot = () => true;
function BannerMedia({ media }: { media: ReturnType<typeof getCoopermaisBanner> }) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(subscribe, motionSnapshot, serverSnapshot);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const stopped = paused || reducedMotion;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (stopped) element.pause();
    else void element.play().catch(() => setPaused(true));
    return () => element.pause();
  }, [stopped, failed]);
  return <>
    {media.video && !failed ? <video ref={video} className={styles.image} src={media.video} poster={media.image} width={2880} height={432} muted loop playsInline preload="metadata" aria-label={media.alt} onError={() => setFailed(true)} /> : <Image src={media.image} alt={media.alt} width={2880} height={432} sizes="(max-width: 1280px) 100vw, 1280px" className={styles.image} />}
    <div className={styles.actions}>
      {media.video && !failed ? <button type="button" className={styles.pause} disabled={reducedMotion} onClick={() => setPaused(value => !value)}>{reducedMotion ? "Animação pausada" : stopped ? "Reproduzir vídeo" : "Pausar vídeo"}</button> : null}
      <Button href={media.ctaHref} external className={styles.cta} data-analytics-id="cta:coopermais-banner" data-analytics-label={media.ctaLabel}>{media.ctaLabel}</Button>
    </div>
  </>;
}
export function CoopermaisBanner({ content = {} }: { content?: Record<string, string> }) {
  const media = getCoopermaisBanner(content);
  return <section id="coopermais" className={styles.section} aria-label="Seja Cliente Coopermais"><Container><div className={styles.badge}><BannerMedia key={`${media.video}:${media.image}`} media={media} /></div></Container></section>;
}
