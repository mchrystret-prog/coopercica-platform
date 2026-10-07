"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Container } from "@/components/ui/Container/Container";
import { Button } from "@/components/ui/Button/Button";
import { FeaturedYouTube } from "@/components/videos/FeaturedYouTube";
import type { VideoFeed, VideoItem } from "@/lib/home-videos";
import styles from "./HomeVideos.module.css";
function VideoRail({ items, playlists = false, active, select }: { items: VideoItem[]; playlists?: boolean; active?: string; select?: (item: VideoItem) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const title = playlists ? "Conheça nossas playlists" : "Confira os últimos vídeos";
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * .85, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  return <div className={styles.railGroup}><div className={styles.railHeading}><h3>{title}</h3><div className={styles.arrows}><button type="button" onClick={() => scroll(-1)} aria-label={`Voltar: ${title}`}>←</button><button type="button" onClick={() => scroll(1)} aria-label={`Avançar: ${title}`}>→</button></div></div>
    <div ref={rail} className={styles.rail} aria-label={title}>{items.map(item => {
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
