"use client";
import { useId, useRef, useState } from "react";
import { normalizeHex } from "@/lib/identity-colors";
import { Button } from "@/components/ui/Button/Button";
import styles from "./IdentityColorField.module.css";

export function IdentityColorField({ label, value, disabled, onChange, help }: {
  label: string; value: string; disabled: boolean; onChange: (value: string) => void; help?: string;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(value);
  const normalized = normalizeHex(draft);
  const current = normalizeHex(value) || "#000000";
  return <div className={styles.field}>
    <span id={`${id}-label`}>{label}</span>
    <button type="button" className={styles.trigger} disabled={disabled} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="dialog" onClick={() => { setDraft(current); dialog.current?.showModal(); }}>
      <span className={styles.swatch} style={{ backgroundColor: current }} aria-hidden="true" />
      <span id={`${id}-value`}>{current}</span><span>Alterar</span>
    </button>
    {help ? <small>{help}</small> : null}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{label}</h2>
      <p>Escolha uma cor ou digite o código HEX.</p>
      <label className={styles.control}>Seletor visual
        <input type="color" value={normalized || current} onChange={event => setDraft(event.target.value.toUpperCase())} />
      </label>
      <label className={styles.control}>Código HEX
        <input autoFocus type="text" value={draft} maxLength={7} placeholder="#1C4722" spellCheck={false} autoComplete="off" aria-invalid={!normalized} aria-describedby={`${id}-hint`} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && normalized) { event.preventDefault(); onChange(normalized); dialog.current?.close(); } }} />
      </label>
      <p id={`${id}-hint`}>{normalized ? "Aceita 3 ou 6 caracteres, com ou sem #." : "Informe um HEX válido, por exemplo #1C4722."}</p>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>Cancelar</Button>
        <Button type="button" variant="primary" disabled={!normalized || disabled} onClick={() => { if (normalized) { onChange(normalized); dialog.current?.close(); } }}>Aplicar cor</Button>
      </div>
      <p>Depois, clique em salvar na personalização para publicar.</p>
    </dialog>
  </div>;
}
