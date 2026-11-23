"use client";

import { useEffect, useRef, useState } from "react";
import type { Store } from "@/data/stores";
import { Icon } from "@/components/ui/Icon";
import { StorePhoto } from "./StorePhoto";
import styles from "./StorePhotoViewer.module.css";

export function StorePhotoViewer({ store, trigger, onClose }: { store: Store; trigger: HTMLButtonElement; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(0);
  const photos = [...new Set(store.photos?.length ? store.photos : [store.image].filter(Boolean))];

  const previous = () => setIndex(value => (value - 1 + photos.length) % photos.length);
  const next = () => setIndex(value => (value + 1) % photos.length);

  const photoCount = photos.length;

  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && photoCount > 1) { event.preventDefault(); setIndex(value => (value - 1 + photoCount) % photoCount); }
      if (event.key === "ArrowRight" && photoCount > 1) { event.preventDefault(); setIndex(value => (value + 1) % photoCount); }
    };
    element?.addEventListener("keydown", keydown);
    return () => {
      element?.removeEventListener("keydown", keydown);
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [trigger, photoCount]);

  return (
    <dialog ref={dialog} className={styles.viewer} aria-label={`Fotos da Loja ${store.storeNumber}: ${store.name}`} onCancel={event => { event.preventDefault(); onClose(); }}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar fotos"><span aria-hidden="true">×</span></button>
      <div className={styles.topline}>
        <span>LOJA {store.storeNumber} · {store.name}</span>
        {photos.length > 1 ? <span role="status">{index + 1} / {photos.length}</span> : null}
      </div>
      <div
        className={styles.stage}
        onPointerDown={event => { if (event.pointerType === "touch" || event.pointerType === "pen") pointer.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={event => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x;
          const dy = event.clientY - pointer.current.y;
          pointer.current = null;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2 && photos.length > 1) dx < 0 ? next() : previous();
        }}
        onPointerCancel={() => { pointer.current = null; }}
      >
        <StorePhoto key={photos[index]} src={photos[index]} alt={`Loja ${store.storeNumber} · ${store.name} — foto ${index + 1}`} className={styles.photo} sizes="100vw" />
        {photos.length > 1 ? <>
          <button type="button" className={`${styles.arrow} ${styles.previous}`} onClick={previous} aria-label="Foto anterior"><Icon name="chevron-left" /></button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={next} aria-label="Próxima foto"><Icon name="chevron-right" /></button>
        </> : null}
      </div>
      {photos.length > 1 ? <div className={styles.thumbnails} aria-label="Selecionar foto">
        {photos.map((src, photoIndex) => <button key={src} type="button" aria-label={`Exibir foto ${photoIndex + 1}`} aria-current={index === photoIndex ? "true" : undefined} onClick={() => setIndex(photoIndex)}>
          <StorePhoto src={src} alt="" className={styles.thumbnail} sizes="72px" />
        </button>)}
      </div> : null}
      <p className={styles.hint}>{photos.length > 1 ? "Deslize para os lados para ver mais fotos" : "Foto da unidade"}</p>
    </dialog>
  );
}
