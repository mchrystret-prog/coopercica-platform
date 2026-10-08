"use client";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { Container } from "@/components/ui/Container/Container";
import { Button } from "@/components/ui/Button/Button";
import { FeaturedYouTube } from "@/components/videos/FeaturedYouTube";
import type { VideoFeed, VideoItem } from "@/lib/home-videos";
import styles from "./HomeVideos.module.css";
function VideoRail({ items, playlists = false, active, select }: { items: VideoItem[]; playlists?: boolean; active?: string; select?: (item: VideoItem) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  const suppressClick = useRef(0);
  const [dragging, setDragging] = useState(false);
  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    if (state.moved) suppressClick.current = Date.now() + 350;
    drag.current = null; setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  const title = playlists ? "Conheça nossas playlists" : "Confira os últimos vídeos";
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * .85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  return <div className={styles.railGroup}><div className={styles.railHeading}><h3>{title}</h3><div className={styles.arrows}><button type="button" onClick={() => scroll(-1)} aria-label={`Voltar: ${title}`}>←</button><button type="button" onClick={() => scroll(1)} aria-label={`Avançar: ${title}`}>→</button></div></div>
    <div ref={rail} className={styles.rail} data-dragging={dragging} role="group" aria-roledescription="carrossel" aria-label={title} tabIndex={0}
      onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { event.preventDefault(); scroll(event.key === "ArrowLeft" ? -1 : 1); } }}
      onPointerDown={event => { if (event.pointerType !== "mouse" || !event.isPrimary || event.button !== 0 || event.currentTarget.scrollWidth <= event.currentTarget.clientWidth + 2) return; suppressClick.current = 0; drag.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }}
      onPointerMove={event => { const state = drag.current; if (!state || state.id !== event.pointerId) return; const dx = event.clientX - state.x; if (!state.moved && Math.abs(dx) > 6) { state.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); } if (state.moved) { event.preventDefault(); event.currentTarget.scrollLeft = state.left - dx; } }}
      onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={event => { if (event.target === event.currentTarget) finishDrag(event); }} onPointerLeave={event => { if (drag.current && !drag.current.moved) finishDrag(event); }}
      onDragStart={event => event.preventDefault()} onClickCapture={event => { if (event.detail !== 0 && Date.now() < suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
      {items.map(item => {
      const picture = <><div className={styles.thumbnail}>{item.thumbnail || !playlists ? <Image unoptimized src={item.thumbnail || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`} alt="" width={480} height={270} /> : <span className={styles.playlistArt} aria-hidden="true">☷<span>Playlist Coopercica</span></span>}<span className={styles.play} aria-hidden="true">{playlists ? "☷" : "▶"}</span></div><span className={styles.cardTitle}>{item.title}</span></>;
      return playlists ? <a className={styles.card} key={item.id} href={`https://www.youtube.com/playlist?list=${item.id}`} target="_blank" rel="noopener noreferrer" data-analytics-id={`home-playlist:${item.id}`} data-analytics-label={item.title}>{picture}</a> : <button className={styles.card} key={item.id} type="button" aria-pressed={item.id === active} onClick={() => select?.(item)} data-analytics-id={`home-video:${item.id}`} data-analytics-label={item.title}>{picture}</button>;
    })}</div>
  </div>;
}
export function HomeVideos({ feed }: { feed: VideoFeed }) {
  const initial = feed.videos.find(item => item.id === feed.featured) || { id: feed.featured, title: "Vídeo em destaque Coopercica" };
  const [selected, setSelected] = useState(initial);
  const player = useRef<HTMLDivElement>(null);
  if (!feed.featured) return null;
  function select(item: VideoItem) { setSelected(item); player.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }
  return <section id="videos-home" className={styles.section} aria-labelledby="home-videos-title"><Container>
    <div className={styles.heading}><div><span className={styles.eyebrow}>No canal Coopercica</span><h2 id="home-videos-title">{feed.title}</h2><p>Receitas e dicas para fazer parte do seu dia.</p></div><Button href="/videos">Explore nossos vídeos</Button></div>
    <div ref={player} className={styles.featured}><FeaturedYouTube key={selected.id} id={selected.id} title={selected.title} /></div><p className={styles.featuredTitle}>{selected.title}</p>
    {feed.videos.length ? <VideoRail items={feed.videos} active={selected.id} select={select} /> : null}
    {feed.playlists.length ? <VideoRail items={feed.playlists} playlists /> : null}
  </Container></section>;
}
