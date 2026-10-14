"use client";
import { useEffect, useRef, useState } from "react";
import type { Store } from "@/data/stores";
import { storeMapsLink } from "@/lib/store-directory";
import { Button } from "@/components/ui/Button/Button";
import { Icon } from "@/components/ui/Icon";
import { StorePhoto } from "./StorePhoto";
import styles from "./StoreDetailsModal.module.css";
export function StoreDetailsModal({ store, trigger, keyboard, onClose }: { store: Store; trigger: HTMLButtonElement; keyboard: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState(0);
  const photos = [...new Set(store.photos?.length ? store.photos : [store.image].filter(Boolean))];
  const digits = store.phone.replace(/\D/g, "");
  const phone = digits.length === 10 || digits.length === 11 ? `+55${digits}` : /^55\d{10,11}$/.test(digits) ? `+${digits}` : null;
  useEffect(() => {
    const element = dialog.current;
    const focused = trigger;
    let keyboardInteraction = keyboard;
    const onKey = () => { keyboardInteraction = true; };
    const onPointer = () => { keyboardInteraction = false; };
    element?.addEventListener("keydown", onKey);
    element?.addEventListener("pointerdown", onPointer);
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => {
      element?.removeEventListener("keydown", onKey);
      element?.removeEventListener("pointerdown", onPointer);
      element?.close(); document.body.style.overflow = overflow;
      if (focused.isConnected) {
        focused.focus({ preventScroll: true });
        // Touch on Safari can leave the carousel as the native return target.
        // Return to the actual card, and retain visible focus only for keyboard use.
        if (!keyboardInteraction) focused.blur();
      }
    };
  }, [trigger, keyboard]);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="store-modal-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}>
    <button type="button" className={styles.close} aria-label="Fechar informações da loja" autoFocus onClick={onClose}>×</button>
    <div className={styles.layout}>
      <div className={styles.gallery}>
        <StorePhoto src={photos[photo]} alt={`Loja ${store.storeNumber} · ${store.name} — foto ${photo + 1}`} className={styles.mainPhoto} />
        {photos.length > 1 ? <><div className={styles.galleryControls}><button type="button" onClick={() => setPhoto(index => (index - 1 + photos.length) % photos.length)} aria-label="Foto anterior"><Icon name="chevron-left" /></button><span role="status">Foto {photo + 1} de {photos.length}</span><button type="button" onClick={() => setPhoto(index => (index + 1) % photos.length)} aria-label="Próxima foto"><Icon name="chevron-right" /></button></div><div className={styles.thumbnails}>{photos.map((src, index) => <button key={src} type="button" aria-label={`Exibir foto ${index + 1}`} aria-pressed={photo === index} onClick={() => setPhoto(index)}><StorePhoto src={src} alt="" className={styles.thumbnail} sizes="76px" /></button>)}</div></> : null}
      </div>
      <div className={styles.info}>
        <span className="ds-eyebrow">{store.city}</span><h2 id="store-modal-title">Loja {store.storeNumber}<span>{store.name}</span></h2>
        <h3>Endereço</h3><p>{store.address}{store.neighborhood ? `, ${store.neighborhood}` : ""}<br />{store.city}</p>
        <h3>Horário de funcionamento</h3><p>{store.hours || "Consulte a unidade para confirmar os horários."}</p>
        {store.services.length ? <><h3>Serviços da unidade</h3><ul className={styles.services}>{store.services.map(service => <li key={service}>{service}</li>)}</ul></> : null}
        {store.phone ? <><h3>Contato</h3><p>{phone ? <a href={`tel:${phone}`}>{store.phone}</a> : store.phone}</p></> : null}
        <div className={styles.actions}><Button href={storeMapsLink(store)} external>Como chegar</Button></div>
        <small>Horário de Brasília. Em feriados, confirme o funcionamento com a unidade.</small>
      </div>
    </div>
  </dialog>;
}
