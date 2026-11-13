import { readableCmsError } from "./cms-feedback";
const inputs = new WeakMap<File, { input: HTMLInputElement; version: symbol }>();
const versions = new WeakMap<HTMLInputElement, symbol>();
export function bindCmsUploadFiles(input: HTMLInputElement, files: FileList | File[] | null) {
  const version = Symbol();
  versions.set(input, version);
  for (const file of Array.from(files || [])) inputs.set(file, { input, version });
}
export function reportCmsUploadError(file: File | HTMLInputElement | null | undefined, error: unknown) {
  if (!file || typeof window === "undefined") return;
  const binding = file instanceof File ? inputs.get(file) : null;
  const input = file instanceof File ? binding?.input : file;
  if (!input || !input.isConnected || (binding && versions.get(input) !== binding.version)) return;
  input.dispatchEvent(new CustomEvent("cms-upload-error", { detail: readableCmsError(error) }));
}
/** Only file transfer failures belong to the upload field; save failures stay in the form. */
export async function cmsUploadFetch(url: RequestInfo | URL, init: RequestInit) {
  const file = init.body instanceof File ? init.body : null;
  try {
    const response = await fetch(url, init);
    if (!response.ok) throw new Error(response.status === 413 ? "HTTP 413" : response.status === 401 || response.status === 403 ? `HTTP ${response.status}` : "Não foi possível enviar o arquivo. Tente novamente. Se o erro continuar, entre em contato com o suporte.");
    return response;
  } catch (error) {
    reportCmsUploadError(file, error);
    throw new Error(readableCmsError(error));
  }
}
