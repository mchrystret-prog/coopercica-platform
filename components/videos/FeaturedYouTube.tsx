"use client";
import { useEffect, useRef, useState } from "react";
type Player = { mute: () => void; playVideo: () => void; pauseVideo: () => void; destroy: () => void };
type YouTube = { Player: new (element: HTMLElement, options: { videoId: string; host: string; playerVars: Record<string, string | number>; events: { onReady: (event: { target: Player }) => void; onError: () => void } }) => Player };
declare global { interface Window { YT?: YouTube; onYouTubeIframeAPIReady?: () => void } }
let ready: Promise<YouTube> | undefined;
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ready) return ready;
  ready = new Promise<YouTube>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); if (window.YT) resolve(window.YT); };
    let script = document.getElementById("coopercica-youtube-api") as HTMLScriptElement | null;
    if (!script) { script = document.createElement("script"); script.id = "coopercica-youtube-api"; script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.head.append(script); }
    script.addEventListener("error", () => { ready = undefined; script?.remove(); reject(new Error("YouTube unavailable")); }, { once: true });
  });
  return ready;
}
export function FeaturedYouTube({ id, title }: { id: string; title: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let player: Player | undefined, disposed = false, visible = false, loading = false, playerReady = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { if (!player || !playerReady) return; if (visible && !motion.matches && document.visibilityState !== "hidden") player.playVideo(); else player.pauseVideo(); };
    const init = async () => {
      if (loading || player || disposed) return;
      loading = true;
      try {
        const api = await loadYouTube();
        if (disposed) return;
        const mount = document.createElement("div"); element.append(mount);
        player = new api.Player(mount, { videoId: id, host: "https://www.youtube-nocookie.com", playerVars: { autoplay: 0, playsinline: 1, rel: 0, origin: window.location.origin }, events: {
          onReady: event => { if (disposed) return; player = event.target; playerReady = true; const iframe = element.querySelector("iframe"); if (iframe) { iframe.title = title; iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen"); } player.mute(); sync(); },
          onError: () => { if (!disposed) setFailed(true); },
        } });
      } catch { if (!disposed) setFailed(true); }
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .5;
      if (visible) void init();
      sync();
    }, { threshold: [0, .5] });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => { disposed = true; observer.disconnect(); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); player?.destroy(); element.replaceChildren(); };
  }, [id, title]);
  return <><div ref={host} style={{ position: "absolute", inset: 0, background: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg) center / cover` }} />{failed ? <a style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#1c4722", color: "white" }} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">Assistir a {title} no YouTube ↗</a> : null}</>;
}
