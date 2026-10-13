const DEFAULT_DELIVERY_URL = "https://www.coopercicadelivery.com.br/";

export function mobileNavigationVisible(pathname: string) {
  return !/^\/(admin|design-system)(\/|$)/.test(pathname) && !/\/folhear\/?$/.test(pathname);
}

export function mobileNavigationActive(pathname: string) {
  if (pathname === "/") return "home";
  if (/^\/(folheteria|folhetos)(\/|$)/.test(pathname)) return "offers";
  if (/^\/lojas(\/|$)/.test(pathname)) return "stores";
  return "more";
}

export function mobileDeliveryHref(value?: string) {
  try {
    const url = new URL(value || DEFAULT_DELIVERY_URL);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : DEFAULT_DELIVERY_URL;
  } catch {
    return DEFAULT_DELIVERY_URL;
  }
}
