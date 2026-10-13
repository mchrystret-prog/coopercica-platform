"use client";
import { useEffect, useId, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { answerLink, answerSegments, answerText, type AnswerSegment } from "@/lib/faq-rich-text";
import styles from "./FaqAnswerEditor.module.css";

export function FaqAnswerEditor({ value, format, disabled, onChange }: { value: string; format?: string; disabled: boolean; onChange: (answer: string, answerFormat: "rich") => void }) {
  const id = useId();
  const editor = useRef<HTMLDivElement>(null);
  const selection = useRef<Range | null>(null);
  const emitted = useRef<string | null>(null);
  const [linkForm, setLinkForm] = useState(false);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!editor.current || emitted.current === value) return;
    const fragment = document.createDocumentFragment();
    for (const segment of answerSegments(value, format)) {
      let node: Node = document.createTextNode(segment.text);
      for (const tag of [segment.bold ? "strong" : "", segment.italic ? "em" : "", segment.href ? "a" : ""].filter(Boolean)) {
        const wrapper = document.createElement(tag);
        if (tag === "a" && segment.href) wrapper.setAttribute("href", segment.href);
        wrapper.append(node); node = wrapper;
      }
      fragment.append(node);
    }
    editor.current.replaceChildren(fragment);
  }, [value, format]);
  function range() {
    const selected = window.getSelection();
    if (!selected?.rangeCount || !editor.current) return null;
    const current = selected.getRangeAt(0);
    return editor.current.contains(current.commonAncestorContainer) ? current : null;
  }
  function emit() {
    if (!editor.current) return;
    const segments: AnswerSegment[] = [];
    function add(text: string, marks: Omit<AnswerSegment, "text">) {
      if (!text) return;
      const previous = segments.at(-1);
      if (previous && previous.bold === marks.bold && previous.italic === marks.italic && previous.href === marks.href) previous.text += text;
      else segments.push({ text, ...marks });
    }
    function read(node: Node, marks: Omit<AnswerSegment, "text"> = {}) {
      if (node.nodeType === Node.TEXT_NODE) { add(node.textContent || "", marks); return; }
      if (!(node instanceof HTMLElement)) return;
      if (node.tagName === "BR") { add("\n", marks); return; }
      const next = { ...marks };
      if (["B", "STRONG"].includes(node.tagName)) next.bold = true;
      if (["I", "EM"].includes(node.tagName)) next.italic = true;
      if (node.tagName === "A") next.href = answerLink(node.getAttribute("href") || "") || undefined;
      if (["DIV", "P", "LI"].includes(node.tagName) && segments.length && !segments.at(-1)?.text.endsWith("\n")) add("\n", marks);
      node.childNodes.forEach(child => read(child, next));
    }
    editor.current.childNodes.forEach(node => read(node));
    const serialized = JSON.stringify(segments);
    emitted.current = serialized;
    onChange(serialized, "rich");
  }
  function mark(tag: "strong" | "em") {
    const current = range();
    if (!current || current.collapsed) { setMessage("Selecione a palavra ou frase que deseja formatar."); return; }
    const wrapper = document.createElement(tag); wrapper.append(current.extractContents()); current.insertNode(wrapper);
    const selected = window.getSelection(); current.selectNodeContents(wrapper); selected?.removeAllRanges(); selected?.addRange(current); emit(); setMessage("");
  }
  function editLink() {
    const current = range();
    selection.current = current?.cloneRange() || null;
    const anchor = (current?.startContainer instanceof Element ? current.startContainer : current?.startContainer.parentElement)?.closest("a");
    if (anchor && editor.current?.contains(anchor)) { selection.current?.selectNode(anchor); setLabel(anchor.textContent || ""); setHref(anchor.getAttribute("href") || ""); }
    else { setLabel(current?.toString() || ""); setHref(""); }
    setLinkForm(true); setMessage("");
  }
  function applyLink() {
    const destination = answerLink(href);
    if (!label.trim()) { setMessage("Informe a palavra ou frase que ficará visível."); return; }
    if (!destination) { setMessage("Use uma página como /lojas, uma seção como /#historia ou um endereço completo https://..."); return; }
    const current = selection.current;
    const anchor = document.createElement("a"); anchor.setAttribute("href", destination); anchor.textContent = label;
    if (current && editor.current?.contains(current.commonAncestorContainer)) { current.deleteContents(); current.insertNode(anchor); }
    else editor.current?.append(anchor);
    editor.current?.focus();
    const caret = document.createRange(); caret.setStartAfter(anchor); caret.collapse(true); const selected = window.getSelection(); selected?.removeAllRanges(); selected?.addRange(caret);
    emit(); setLinkForm(false); setMessage("");
  }
  function unlink() {
    const current = range();
    if (!current || !editor.current) { setMessage("Selecione o texto do link que deseja remover."); return; }
    for (const anchor of Array.from(editor.current.querySelectorAll("a"))) if (current.intersectsNode(anchor)) anchor.replaceWith(...anchor.childNodes);
    emit(); setMessage("");
  }
  function insertText(text: string) {
    const current = range();
    const node = document.createTextNode(text);
    if (current) { current.deleteContents(); current.insertNode(node); current.setStartAfter(node); current.collapse(true); }
    else editor.current?.append(node);
    emit();
  }
  function paste(event: ClipboardEvent<HTMLDivElement>) { event.preventDefault(); insertText(event.clipboardData.getData("text/plain")); }
  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); insertText(event.dataTransfer.getData("text/plain")); }
  return <div className={styles.wrapper}>
    <span id={id} className={styles.label}>Resposta</span>
    <div className={styles.toolbar} role="group" aria-label="Formatar resposta">
      <button type="button" disabled={disabled} onMouseDown={e => e.preventDefault()} onClick={() => mark("strong")}>Negrito</button>
      <button type="button" disabled={disabled} onMouseDown={e => e.preventDefault()} onClick={() => mark("em")}>Itálico</button>
      <button type="button" disabled={disabled} onMouseDown={e => e.preventDefault()} onClick={editLink}>Inserir / editar link</button>
      <button type="button" disabled={disabled} onMouseDown={e => e.preventDefault()} onClick={unlink}>Remover link</button>
    </div>
    {linkForm ? <div className={styles.linkForm}>
      <label>Texto do link<input value={label} maxLength={200} disabled={disabled} onChange={e => setLabel(e.target.value)} /></label>
      <label>Destino do link<input autoFocus value={href} maxLength={1000} disabled={disabled} placeholder="/#historia, /lojas ou https://..." onChange={e => setHref(e.target.value)} /></label>
      <div className={styles.actions}><button type="button" disabled={disabled} onClick={applyLink}>Aplicar link</button><button type="button" disabled={disabled} onClick={() => { setLinkForm(false); setMessage(""); editor.current?.focus(); }}>Cancelar</button></div>
    </div> : null}
    <div ref={editor} className={styles.editor} contentEditable={!disabled} suppressContentEditableWarning role="textbox" aria-multiline="true" aria-labelledby={id} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onInput={emit} onPaste={paste} onDrop={drop} onClick={event => { if ((event.target as HTMLElement).closest("a")) event.preventDefault(); }} />
    <small>Selecione um texto para inserir um link. Sites externos abrem em outra aba. {answerText(value, format).length}/4000 caracteres.</small>
    {message ? <p role="status" className={styles.message}>{message}</p> : null}
  </div>;
}
