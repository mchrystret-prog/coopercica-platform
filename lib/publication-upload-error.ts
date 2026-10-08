export async function publicationUploadError(response: Response, fileLabel: string): Promise<Error> {
  const detail = await response.json().catch(() => ({}));
  const message = String(detail.message || detail.error || "");
  if (response.status === 401 || /jwt|token.*expir|exp.*claim|unauthorized/i.test(message)) return new Error("Sua sessão expirou. Saia do CMS, entre novamente e reenvie a revista.");
  if (response.status === 413 || /size|too large|exceed/i.test(message)) return new Error(`${fileLabel} deve ter até 15 MB.`);
  if (/mime|content.type/i.test(message)) return new Error(`O formato de ${fileLabel.toLowerCase()} não é permitido. Confira o arquivo selecionado.`);
  if (response.status === 403 || /row.level|access.denied|permission/i.test(message)) return new Error(`Seu perfil não tem permissão para enviar ${fileLabel.toLowerCase()}. Entre com um perfil administrador ou editor.`);
  return new Error(`Não foi possível enviar ${fileLabel.toLowerCase()} (erro ${response.status}). Tente novamente; se persistir, contate o administrador.`);
}
