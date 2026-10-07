import type { Store } from "../data/stores";
export function hasPharmacy(store: Store) {
  return store.services.some(service => /drogaria|farmacia/.test(service.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()));
}
export function filterStoreDirectory(items: Store[], filters: { city: string; onlyOpen: boolean; onlyPharmacy: boolean }, isOpen: (store: Store) => boolean) {
  return items.filter(store => store.active !== false &&
    (!filters.city || store.city === filters.city) &&
    (!filters.onlyPharmacy || hasPharmacy(store)) &&
    (!filters.onlyOpen || isOpen(store)))
    .sort((a, b) => a.storeNumber - b.storeNumber);
}
export function storeMapsLink(store: Store) {
  for (const value of [store.mapsUrl, store.maps]) {
    try { const url = new URL(value); if (url.protocol === "https:" && !url.username && !url.password) return url.href; } catch { /* Try the other CMS field or an address-based map. */ }
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.address}, ${store.neighborhood}, ${store.city}, SP`)}`;
}
