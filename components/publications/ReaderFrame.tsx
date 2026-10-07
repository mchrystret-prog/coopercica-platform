"use client";
import { useEffect, useRef, useState } from "react";
export default function ReaderFrame({ id, kind, title, edition }: { id: string; kind: string; title: string; edition?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [page] = useState(() => {
    const requested = Number(new URLSearchParams(location.hash.slice(1)).get("p") || 1);
    return Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;
  });
  useEffect(() => {
    let expanded = false;
    let restore = () => {};
    function setExpanded(value: boolean) {
      if (value === expanded) return;
      expanded = value;
      frame.current?.classList.toggle("pdf-reader-frame-expanded", expanded);
      if (expanded) {
        const position = window.scrollY;
        const body = document.body;
        const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
        Object.assign(body.style, { position: "fixed", top: `-${position}px`, width: "100%", overflow: "hidden" });
        restore = () => {
          Object.assign(body.style, previous);
          window.scrollTo({ top: position, behavior: "instant" });
        };
      } else {
        restore();
        restore = () => {};
      }
      frame.current?.contentWindow?.postMessage({ type: "coopercica-reader-expanded", id, expanded }, location.origin);
    }
    function sync(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.id !== id) return;
      if (event.data.type === "coopercica-reader-expand" && typeof event.data.expanded === "boolean") {
        setExpanded(event.data.expanded);
        return;
      }
      if (event.data.type !== "coopercica-reader-page" || !Number.isInteger(event.data.page) || event.data.page < 1) return;
      history.replaceState(history.state, "", `#p=${event.data.page}`);
    }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setExpanded(false); }
    window.addEventListener("message", sync);
    window.addEventListener("keydown", escape);
    return () => {
      restore();
      window.removeEventListener("message", sync);
      window.removeEventListener("keydown", escape);
    };
  }, [id]);
  if (page === null) return <p role="status">Preparando o leitor…</p>;
  return <iframe ref={frame} className="pdf-reader-frame" title={`Folhear: ${title}`} src={`/reader.html?${new URLSearchParams({ id, kind, title, edition: edition ?? "", page: String(page) })}`} allow="fullscreen; clipboard-write" allowFullScreen />;
}
