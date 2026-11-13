export type CmsMessageKind = "error" | "success" | "info";

/** Translate technical failures without exposing response bodies or database details. */
export function readableCmsError(value: unknown): string {
  const message = value instanceof Error ? value.message : String(value || "");
  if (/failed to fetch|networkerror|network request|load failed|fetch failed/i.test(message)) return "Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.";
  if (/jwt|token.*expir|sessão.*expir|session.*expir|HTTP 401|unauthorized/i.test(message)) return "Sua sessão expirou. Entre novamente no CMS e repita a ação.";
  if (/row.level.security|permission denied|HTTP 403|forbidden|not authorized/i.test(message)) return "Seu acesso não permite esta ação. Peça ao administrador para conferir suas permissões.";
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  if (/duplicate key|unique constraint|HTTP 409/i.test(message)) return "Já existe um cadastro com esses dados. Confira o título, código ou endereço antes de salvar novamente.";
  if (/HTTP 413|payload too large/i.test(message)) return "O arquivo é maior que o limite permitido. Reduza o tamanho e selecione o arquivo novamente.";
  if (/could not be decoded|encodingerror|invalid image|corrompid/i.test(message)) return "Não foi possível abrir o arquivo. Exporte uma nova cópia no formato indicado abaixo do campo e tente novamente.";
  if (/HTTP 429|too many requests|rate limit/i.test(message)) return "Foram feitas muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.";
  if (/timeout|timed out|tempo excedido/i.test(message)) return "A operação demorou mais que o esperado. Confira a conexão e tente novamente.";
  if (!message || /[{}]|<!doctype|<html|SQLSTATE|Postgrest|HTTP \d|TypeError|undefined|unexpected token/i.test(message)) return "Não foi possível concluir esta ação. Tente novamente. Se o erro continuar, informe ao suporte qual ação você estava realizando.";
  if (/^[\x00-\x7F]+$/.test(message) && !/^(Use |PDF|PNG|JPG|WEBP)/i.test(message) && /error|invalid|denied|failed|cannot|must|not found|unable|exceeded/i.test(message)) return "Não foi possível concluir esta ação. Confira os dados e tente novamente. Se o erro continuar, entre em contato com o suporte.";
  return message;
}
