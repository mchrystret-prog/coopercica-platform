export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_APPLICATION_BYTES = MAX_RESUME_BYTES + 64 * 1024;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export type ApplicationInput = {
  job_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
};
export function validateApplication(
  fields: Record<string, unknown>,
): ApplicationInput {
  if (
    Object.keys(fields).some(
      (k) =>
        ![
          "job_id",
          "name",
          "email",
          "phone",
          "city",
          "message",
          "consent",
        ].includes(k),
    )
  )
    throw new Error("invalid_fields");
  const text = (key: string, min: number, max: number) => {
    const v = fields[key];
    if (
      typeof v !== "string" ||
      v.trim().length < min ||
      v.trim().length > max ||
      /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v)
    )
      throw new Error("invalid_fields");
    return v.trim();
  };
  const job_id = text("job_id", 36, 36);
  if (!UUID.test(job_id)) throw new Error("invalid_fields");
  if (fields.consent !== "accepted") throw new Error("consent_required");
  const email = text("email", 5, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("invalid_fields");
  const phone = text("phone", 8, 24);
  if (!/^[0-9+ ()-]{8,24}$/.test(phone) || phone.replace(/\D/g, "").length < 8)
    throw new Error("invalid_fields");
  return {
    job_id,
    name: text("name", 2, 120),
    email,
    phone,
    city: text("city", 2, 100),
    message: text("message", 0, 4000),
  };
}
export function validateResume(bytes: Uint8Array, type: string) {
  if (
    type !== "application/pdf" ||
    bytes.length < 8 ||
    bytes.length > MAX_RESUME_BYTES ||
    new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-"
  )
    throw new Error("invalid_resume");
}
export async function readApplicationBody(
  request: Request,
): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid_fields");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_APPLICATION_BYTES) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}
