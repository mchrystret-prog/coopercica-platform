import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterStoreDirectory, hasPharmacy, storeMapsLink } from '../lib/store-directory.ts';
import { openingHoursFromText, storeStatus } from '../lib/store-hours.ts';
const base = { active: true, city: 'Jundiaí', services: [], hours: 'Todos os dias • 07h às 22h', address: 'Rua Exemplo, 10', neighborhood: 'Centro', maps: '', mapsUrl: '#' };
const stores = [
 { ...base, storeNumber: 3, services: ['Drogaria'] },
 { ...base, storeNumber: 1, city: 'Itupeva', services: ['Farmácia'] },
 { ...base, storeNumber: 2 },
 { ...base, storeNumber: 4, active: false, services: ['Drogaria'] },
];
test('combina cidade, abertas e drogaria, exclui inativas e ordena sem mudar os dados', () => {
 const filters = { city: '', onlyOpen: false, onlyPharmacy: false };
 assert.deepEqual(filterStoreDirectory(stores, filters, () => true).map(s => s.storeNumber), [1, 2, 3]);
 assert.deepEqual(filterStoreDirectory(stores, { ...filters, onlyPharmacy: true }, () => true).map(s => s.storeNumber), [1, 3]);
 assert.deepEqual(filterStoreDirectory(stores, { city: 'Jundiaí', onlyOpen: true, onlyPharmacy: true }, s => s.storeNumber === 3).map(s => s.storeNumber), [3]);
 assert.deepEqual(filterStoreDirectory(stores, { city: 'Itupeva', onlyOpen: true, onlyPharmacy: true }, () => false), []);
 assert.equal(stores[0].storeNumber, 3);
 assert.equal(hasPharmacy({ ...base, services: ['FARMÁCIA'] }), true);
});
test('abertas agora acompanha o horário do CMS no fuso de São Paulo', () => {
 const at = time => store => storeStatus(openingHoursFromText(store.hours), new Date(time)).open;
 const filters = { city: '', onlyOpen: true, onlyPharmacy: false };
 assert.equal(filterStoreDirectory(stores, filters, at('2026-10-07T09:59:00Z')).length, 0);
 assert.equal(filterStoreDirectory(stores, filters, at('2026-10-07T10:00:00Z')).length, 3);
 assert.equal(filterStoreDirectory(stores, filters, at('2026-10-08T01:00:00Z')).length, 0);
});
test('Como chegar prioriza links válidos e usa endereço quando não há link no CMS', () => {
 assert.equal(storeMapsLink({ ...base, maps: 'https://maps.app.goo.gl/example' }), 'https://maps.app.goo.gl/example');
 assert.equal(storeMapsLink({ ...base, mapsUrl: 'https://maps.example/loja', maps: 'https://maps.example/outra' }), 'https://maps.example/loja');
 const fallback = new URL(storeMapsLink({ ...base, mapsUrl: 'javascript:alert(1)' }));
 assert.equal(fallback.origin, 'https://www.google.com');
 assert.equal(fallback.searchParams.get('query'), 'Rua Exemplo, 10, Centro, Jundiaí, SP');
});
