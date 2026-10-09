export type UploadRule = {
  label: string;
  kind: "image" | "video" | "pdf" | "sheet";
  extensions: readonly string[];
  maxBytes: number;
  dimensions?: readonly [number, number];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  minRatio?: number;
  maxRatio?: number;
  maxDuration?: number;
  maxPages?: number;
};
const MB = 1024 * 1024;
const image = (label: string, dimensions: readonly [number, number], maxBytes = 2 * MB): UploadRule => ({ label, kind: "image", extensions: ["jpg", "jpeg", "png", "webp"], dimensions, maxBytes });

export const uploadRules = {
  campaignDesktop: image("Banner desktop", [1920, 826]),
  campaignMobile: image("Banner mobile", [1080, 1350]),
  store: image("Foto da loja", [1600, 1000]),
  section: image("Imagem da seção", [1600, 1000]),
  history: image("Foto da história", [1600, 1000]),
  careersDesktop: image("Foto principal de Vagas", [1600, 1200]),
  careersMobile: image("Foto mobile de Vagas", [1080, 810]),
  videosDesktop: image("Cabeçalho de Vídeos", [2048, 522]),
  videosMobile: image("Cabeçalho mobile de Vídeos", [1080, 810]),
  coopermaisImage: image("Imagem Coopermais", [2880, 432]),
  coopermaisVideo: { label: "Vídeo Coopermais", kind: "video", extensions: ["mp4", "webm"], dimensions: [2880, 432], maxBytes: 15 * MB, maxDuration: 15 } as UploadRule,
  leafletCover: image("Capa do folheto", [1080, 1440]),
  leafletHeader: image("Cabeçalho do folheto", [1920, 600]),
  magazineCover: image("Capa da revista", [1080, 1350]),
  box: image("Fundo do box", [1920, 505]),
  ageSeal: image("Selo +18", [400, 400], MB),
  warningSeal: image("Selo de aleitamento", [800, 200], MB),
  seal: { label: "Selo", kind: "image", extensions: ["jpg", "jpeg", "png", "webp"], maxBytes: MB, minWidth: 64, minHeight: 64, maxWidth: 1600, maxHeight: 800 } as UploadRule,
  product: { label: "Foto do produto", kind: "image", extensions: ["jpg", "jpeg", "png", "webp"], maxBytes: MB, minWidth: 64, minHeight: 64, maxWidth: 1600, maxHeight: 1600 } as UploadRule,
  logo: { label: "Logo", kind: "image", extensions: ["png", "webp", "svg"], maxBytes: 512 * 1024, minWidth: 1200, minHeight: 1, maxWidth: 2400, maxHeight: 600, minRatio: 4, maxRatio: 7 } as UploadRule,
  pdf: { label: "PDF", kind: "pdf", extensions: ["pdf"], maxBytes: 15 * MB, maxPages: 300 } as UploadRule,
  sheet: { label: "Planilha ERP", kind: "sheet", extensions: ["xlsx"], maxBytes: 10 * MB } as UploadRule,
} satisfies Record<string, UploadRule>;
export type UploadRuleKey = keyof typeof uploadRules;

export function formatUploadBytes(bytes: number) { return bytes >= MB ? `${bytes / MB} MB` : `${bytes / 1024} KB`; }
export function uploadRequirements(key: UploadRuleKey) {
  const rule: UploadRule = uploadRules[key];
  const dimensions = rule.dimensions ? `Medida obrigatória: ${rule.dimensions[0]} × ${rule.dimensions[1]} px.`
    : key === "logo" ? "PNG/WebP: largura de 1200 a 2400 px, altura até 600 px. Proporção horizontal de 4:1 a 7:1. SVG: vetorial estático, na mesma proporção, sem mínimo de pixels, scripts ou recursos externos."
    : rule.kind === "image" ? `Largura: ${rule.minWidth}–${rule.maxWidth} px. Altura: ${rule.minHeight}–${rule.maxHeight} px. Proporção livre, sem esticar a imagem.`
    : rule.kind === "pdf" ? `Página em formato livre. De 1 a ${rule.maxPages} páginas, sem senha.` : "Aba obrigatória: Tabloide Digital.";
  const formats = rule.extensions.filter((ext) => ext !== "jpeg").map((ext) => ext.toUpperCase()).join(", ");
  return `${dimensions} Formatos: ${formats}. Limite: ${formatUploadBytes(rule.maxBytes)} por arquivo.${rule.maxDuration ? ` Duração: até ${rule.maxDuration} segundos.` : ""}`;
}
export function leafletAssetRule(kind: "box" | "seal", code: string): UploadRuleKey {
  return kind === "box" ? "box" : code === "+18" ? "ageSeal" : code === "aleitamento" ? "warningSeal" : "seal";
}
export function customizationUploadRule(target: string): UploadRuleKey {
  if (target === "logo" || target === "logoWhite") return "logo";
  if (target.startsWith("history:")) return "history";
  if (target.startsWith("careers:")) return target.endsWith("mobileImage") ? "careersMobile" : "careersDesktop";
  if (target.startsWith("videos:")) return target.endsWith("mobileImage") ? "videosMobile" : "videosDesktop";
  if (target.startsWith("coopermais:")) return target.endsWith("video") ? "coopermaisVideo" : "coopermaisImage";
  if (target.startsWith("section:")) return "section";
  throw new Error("Campo de upload não reconhecido.");
}

export function assertUploadGeometry(key: UploadRuleKey, width: number, height: number, vector = false, duration?: number) {
  const rule: UploadRule = uploadRules[key];
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error("Não foi possível identificar as medidas do arquivo.");
  if (rule.dimensions && (width !== rule.dimensions[0] || height !== rule.dimensions[1])) throw new Error(`${rule.label}: esperado ${rule.dimensions[0]} × ${rule.dimensions[1]} px; arquivo recebido: ${width} × ${height} px.`);
  if (!(vector && key === "logo") && ((rule.minWidth && width < rule.minWidth) || (rule.minHeight && height < rule.minHeight) || (rule.maxWidth && width > rule.maxWidth) || (rule.maxHeight && height > rule.maxHeight))) throw new Error(`${rule.label}: ${width} × ${height} px fora do intervalo permitido. ${uploadRequirements(key)}`);
  const ratio = width / height;
  if ((rule.minRatio && ratio < rule.minRatio) || (rule.maxRatio && ratio > rule.maxRatio)) throw new Error(`${rule.label}: proporção inválida (${ratio.toFixed(2)}:1). ${uploadRequirements(key)}`);
  if (rule.maxDuration && (!Number.isFinite(duration) || duration! <= 0 || duration! > rule.maxDuration)) throw new Error(`${rule.label}: duração máxima de ${rule.maxDuration} segundos.`);
}
