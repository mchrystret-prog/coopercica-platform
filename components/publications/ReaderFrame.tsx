"use client";
import { useEffect, useRef, useState } from "react";
export default function ReaderFrame({ id, kind, title, edition }: { id: string; kind: string; title: string; edition?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [page] = useState(() => {
    const requested = Number(new URLSearchParams(location.hash.slice(1)).get("p") || 1);
    return Number.isFinite(requested) && requested >= 1 ? Math.floor(requested) : 1;
  });
  useEffect(() => {
    function sync(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "coopercica-reader-page" || event.data.id !== id || !Number.isInteger(event.data.page) || event.data.page < 1) return;
      history.replaceState(history.state, "", `#p=${event.data.page}`);
    }
    window.addEventListener("message", sync);
    return () => window.removeEventListener("message", sync);
  }, [id]);
  if (page === null) return <p role="status">Preparando o leitor…</p>;
  return <iframe ref={frame} className="pdf-reader-frame" title={`Folhear: ${title}`} src={`/reader.html?${new URLSearchParams({ id, kind, title, edition: edition ?? "", page: String(page) })}`} allow="fullscreen; clipboard-write" allowFullScreen />;
}
