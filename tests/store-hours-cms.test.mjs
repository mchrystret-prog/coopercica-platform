import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openingHoursFromText, storeStatus } from '../lib/store-hours.ts';
test('filtro acompanha os horários cadastrados no CMS', () => {
  const hours = openingHoursFromText('Seg a Sáb: 07h às 22h | Dom: 07h às 20h');
  assert.equal(storeStatus(hours, new Date('2026-10-04T22:59:00Z')).open, true);
  assert.equal(storeStatus(hours, new Date('2026-10-04T23:00:00Z')).open, false);
  assert.equal(storeStatus(hours, new Date('2026-10-06T10:00:00Z')).open, true);
  assert.equal(storeStatus(openingHoursFromText('Todos os dias • 08h30 às 21h45'), new Date('2026-10-06T11:29:00Z')).open, false);
  assert.equal(storeStatus(openingHoursFromText('Todos os dias • 08h30 às 21h45'), new Date('2026-10-06T11:30:00Z')).open, true);
  assert.deepEqual(openingHoursFromText('Consulte a loja'), {});
});
