export type CmsRole = "admin" | "editor" | "hr" | "marketing";
export function canAccessCms(role: CmsRole, path: string) {
  const inside = (base: string) => path === base || path.startsWith(base + "/");
  if (role === "marketing")
    return path === "/admin" || ["personalizacao", "campanhas", "revistas", "folheteria", "lojas", "midias", "analytics", "politicas"].some(module => inside(`/admin/${module}`));
  if (role === "hr")
    return inside("/admin/vagas") || inside("/admin/politicas");
  if (role === "editor")
    return !inside("/admin/usuarios") && !inside("/admin/vagas");
  return role === "admin";
}
export const cmsRoleName = (role: string) =>
  ({ admin: "Administrador", editor: "Editor", hr: "Recursos Humanos", marketing: "Marketing" })[
    role
  ] || role;
