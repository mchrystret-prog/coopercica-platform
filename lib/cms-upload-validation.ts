import { assertUploadGeometry, formatUploadBytes, uploadRules, type UploadRuleKey } from "./cms-upload-rules";

const types: Record<string, string[]> = { jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"], svg: ["image/svg+xml"], mp4: ["video/mp4"], webm: ["video/webm"], pdf: ["application/pdf"], xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/vnd.ms-excel"] };
const validated = new WeakMap<File, Set<UploadRuleKey>>();

export function assertUploadFile(file: File, key: UploadRuleKey) {
  const rule = uploadRules[key];
  if (!file.size) throw new Error(`${rule.label}: selecione um arquivo não vazio.`);
  if (file.size > rule.maxBytes) throw new Error(`${rule.label}: limite de ${formatUploadBytes(rule.maxBytes)}; recebido ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  if (!(rule.extensions as readonly string[]).includes(extension) || (file.type && !types[extension]?.includes(file.type))) throw new Error(`${rule.label}: formato inválido. Use ${rule.extensions.join(", ").toUpperCase()}.`);
  return extension;
}

async function inspectImage(file: File) {
  if (typeof createImageBitmap === "function" && file.type !== "image/svg+xml" && !/\.svg$/i.test(file.name)) {
    const bitmap = await createImageBitmap(file);
    try { return { width: bitmap.width, height: bitmap.height }; } finally { bitmap.close(); }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => { image.src = ""; reject(new Error("Tempo excedido ao ler a imagem.")); }, 15_000);
      image.onload = () => { clearTimeout(timer); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
      image.onerror = () => { clearTimeout(timer); reject(new Error("Imagem inválida ou corrompida.")); };
      image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

async function inspectVideo(file: File) {
  const url = URL.createObjectURL(file), video = document.createElement("video");
  try {
    return await new Promise<{ width: number; height: number; duration: number }>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Tempo excedido ao ler o vídeo.")), 15_000);
      video.onloadedmetadata = () => { clearTimeout(timer); resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration }); };
      video.onerror = () => { clearTimeout(timer); reject(new Error("Vídeo inválido, corrompido ou incompatível com este navegador.")); };
      video.preload = "metadata";
      video.src = url;
    });
  } finally { video.onloadedmetadata = null; video.onerror = null; video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url); }
}

export async function validateCmsUpload(file: File, key: UploadRuleKey) {
  if (validated.get(file)?.has(key)) return;
  try {
    const extension = assertUploadFile(file, key);
    const rule = uploadRules[key];
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const text = new TextDecoder().decode(header);
    const matches = extension === "png" ? header[0] === 137 && text.slice(1, 4) === "PNG"
      : ["jpg", "jpeg"].includes(extension) ? header[0] === 255 && header[1] === 216
      : extension === "webp" ? text.startsWith("RIFF") && text.slice(8, 12) === "WEBP"
      : extension === "pdf" ? text.startsWith("%PDF-")
      : extension === "xlsx" ? header[0] === 80 && header[1] === 75
      : extension === "mp4" ? text.slice(4, 8) === "ftyp"
      : extension === "webm" ? header[0] === 26 && header[1] === 69 && header[2] === 223 && header[3] === 163 : true;
    if (!matches) throw new Error("O conteúdo não corresponde ao formato informado.");
    if (extension === "svg") {
      const source = await file.text();
      if (/<!DOCTYPE|@import/i.test(source)) throw new Error("Use um SVG sem recursos externos.");
      const svg = new DOMParser().parseFromString(source, "image/svg+xml");
      const unsafeAttribute = Array.from(svg.querySelectorAll("*")).some((element) => Array.from(element.attributes).some((attribute) => /^on/i.test(attribute.name) || (["href", "src"].includes(attribute.localName) && !attribute.value.startsWith("#"))));
      const unsafeUrl = Array.from(source.matchAll(/url\s*\(([^)]+)\)/gi)).some((match) => !match[1].trim().replace(/^['"]|['"]$/g, "").startsWith("#"));
      if (svg.querySelector("parsererror, script, foreignObject, iframe, object, embed") || svg.documentElement.localName !== "svg" || unsafeAttribute || unsafeUrl) throw new Error("Use um SVG válido, sem scripts ou recursos externos.");
    }
    if (rule.kind === "pdf") {
      try {
        const { PDFDocument } = await import("pdf-lib");
        const pdf = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false, throwOnInvalidObject: true });
        const pages = pdf.getPageCount();
        if (pages < 1 || pages > uploadRules.pdf.maxPages!) throw new Error();
      } catch { throw new Error(`Use um PDF válido, sem senha, com 1 a ${uploadRules.pdf.maxPages} páginas.`); }
    } else if (rule.kind === "image") {
      const { width, height } = await inspectImage(file);
      assertUploadGeometry(key, width, height, extension === "svg");
    } else if (rule.kind === "video") {
      const { width, height, duration } = await inspectVideo(file);
      assertUploadGeometry(key, width, height, false, duration);
    }
    const checked = validated.get(file) ?? new Set<UploadRuleKey>();
    checked.add(key);
    validated.set(file, checked);
  } catch (error) { throw new Error(`${file.name}: ${error instanceof Error ? error.message : "Arquivo inválido."}`); }
}

/** Validate the complete batch before its first network upload. */
export async function validateCmsUploads(entries: Array<[FormDataEntryValue | null, UploadRuleKey]>) {
  for (const [file, key] of entries) {
    if (!(file instanceof File) || !file.name) throw new Error(`${uploadRules[key].label}: selecione o arquivo.`);
    await validateCmsUpload(file, key);
  }
}
