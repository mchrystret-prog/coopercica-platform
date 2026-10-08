import { suggestMagazineEditorial, type PdfTextPage, type PdfText } from "./magazine-pdf-summary";

/** Loaded on demand by the CMS, using the same compatible engine as the reader. */
export async function readMagazinePdf(source: string | File, signal: AbortSignal, onProgress: (message: string) => void) {
  const maxBytes = 15 * 1024 * 1024;
  let data: Uint8Array;
  if (typeof source !== "string") {
    if (source.size > maxBytes) throw new Error("A leitura automática aceita PDFs de até 15 MB.");
    data = new Uint8Array(await source.arrayBuffer());
  } else {
  const response = await fetch(source, { signal });
  if (!response.ok) throw new Error("Não foi possível abrir o PDF desta edição. Confira o arquivo no menu Revistas.");
  if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("A leitura automática aceita PDFs de até 15 MB.");
  const reader = response.body?.getReader();
  if (!reader) throw new Error("O navegador não conseguiu ler o arquivo PDF.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) throw new Error("A leitura automática aceita PDFs de até 15 MB.");
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  signal.throwIfAborted();
  data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  }
  if (new TextDecoder().decode(data.slice(0, 5)) !== "%PDF-") throw new Error("Selecione um PDF válido para a leitura automática.");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  signal.throwIfAborted();
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.legacy.min.mjs";
  const task = pdfjs.getDocument({ data, cMapUrl: "/vendor/pdfjs/cmaps/", cMapPacked: true,
    standardFontDataUrl: "/vendor/pdfjs/standard_fonts/", wasmUrl: "/vendor/pdfjs/wasm/" });
  const abort = () => { void task.destroy(); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const pdf = await task.promise;
    const pages: PdfTextPage[] = [];
    const limit = Math.min(pdf.numPages, 60);
    for (let number = 1; number <= limit; number++) {
      signal.throwIfAborted();
      onProgress(`Lendo página ${number} de ${limit}…`);
      const page = await pdf.getPage(number);
      try {
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        pages.push({ number, width: viewport.width, height: viewport.height,
          items: content.items.filter((item): item is PdfText & typeof item => "str" in item) });
      } finally { page.cleanup(); }
    }
    return suggestMagazineEditorial(pages, pdf.numPages);
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof Error && error.name === "PasswordException") throw new Error("Este PDF exige senha. Envie uma versão sem proteção para usar a leitura automática.");
    throw error;
  } finally { signal.removeEventListener("abort", abort); await task.destroy(); }
}
