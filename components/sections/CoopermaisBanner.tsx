"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
const screenQuery = "(max-width: 767px)";
const subscribeScreen = (callback: () => void) => {
  const query = window.matchMedia(screenQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const screenSnapshot = () => window.matchMedia(screenQuery).matches;
const screenServerSnapshot = (): boolean | null => null;
function BannerMedia({ media }: { media: Pick<ReturnType<typeof getCoopermaisBanner>, "video" | "image" | "alt" | "ctaHref" | "ctaLabel"> & { width: number; height: number } }) {
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
  const pauseLabel = reducedMotion ? "Animação pausada" : stopped ? "Reproduzir vídeo" : "Pausar vídeo";
  return <>
    <a className={styles.link} href={media.ctaHref} target="_blank" rel="noopener noreferrer" aria-label={`${media.ctaLabel} (abre em nova aba)`} data-analytics-id="cta:coopermais-banner" data-analytics-label={media.ctaLabel}>
    {media.video && !failed ? <video ref={video} className={styles.image} src={media.video} poster={media.image} width={media.width} height={media.height} autoPlay={!stopped} muted loop playsInline controls={false} disablePictureInPicture disableRemotePlayback preload="metadata" aria-label={media.alt} onError={() => setFailed(true)} /> : <Image src={media.image} alt={media.alt} width={media.width} height={media.height} sizes="(max-width: 1280px) 100vw, 1280px" className={styles.image} />}
    </a>
    {media.video && !failed ? <button type="button" className={styles.pause} disabled={reducedMotion} aria-label={pauseLabel} title={pauseLabel} onClick={() => setPaused(value => !value)}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{stopped ? <path d="M4 2v12l10-6z" /> : <><rect x="3" y="2" width="4" height="12" rx="1" /><rect x="9" y="2" width="4" height="12" rx="1" /></>}</svg>
    </button> : null}
  </>;
}
export function CoopermaisBanner({ content = {} }: { content?: Record<string, string> }) {
  const media = getCoopermaisBanner(content);
  const mobile = useSyncExternalStore(subscribeScreen, screenSnapshot, screenServerSnapshot);
  const selected = mobile
    ? { ...media, video: media.mobileVideo, image: media.mobileImage, width: 1080, height: 1350 }
    : { ...media, width: 2880, height: 432 };
  return <section id="coopermais" className={styles.section} aria-label="Seja Cliente Coopermais"><Container>
    <div className={`${styles.badge} ${mobile === null ? styles.placeholder : ""}`} aria-busy={mobile === null}>
      {mobile === null ? null : <BannerMedia key={`${mobile}:${selected.video}:${selected.image}`} media={selected} />}
    </div>
  </Container></section>;
}
