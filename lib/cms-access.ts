export type CmsRole = "admin" | "editor" | "hr";
export function canAccessCms(role: CmsRole, path: string) {
  const inside = (base: string) => path === base || path.startsWith(base + "/");
  if (role === "hr")
    return inside("/admin/vagas") || inside("/admin/politicas");
  if (role === "editor")
    return !inside("/admin/usuarios") && !inside("/admin/vagas");
  return role === "admin";
}
export const cmsRoleName = (role: string) =>
  ({ admin: "Administrador", editor: "Editor", hr: "Recursos Humanos" })[
    role
  ] || role;
