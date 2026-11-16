export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, "");
  if (/^[a-f\d]{3}$/i.test(hex)) return `#${hex.split("").map(c => c + c).join("").toUpperCase()}`;
  return /^[a-f\d]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}

export function identityColorTokens(identity: Record<string, string>) {
  return Object.fromEntries([
    ["primaryColor", "--brand-green-900"],
    ["secondaryColor", "--brand-green-500"],
    ["accentColor", "--brand-red-500"],
    ["pageColor", "--surface-page"],
  ].flatMap(([key, token]) => {
    const value = normalizeHex(identity[key] || "");
    return value ? [[token, value]] : [];
  }));
}
