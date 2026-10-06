import { test } from 'node:test';
import assert from 'node:assert/strict';
import { regularHours, storeStatus } from '../lib/store-hours.ts';
import { publicationIsVisible } from '../types/publication.ts';
test('horário usa São Paulo, inclusive antes da abertura e no fechamento', () => {
  const hours = regularHours();
  assert.equal(storeStatus(hours, new Date('2026-10-06T09:59:00Z')).open, false);
  assert.equal(storeStatus(hours, new Date('2026-10-06T10:00:00Z')).open, true);
  assert.equal(storeStatus(hours, new Date('2026-10-07T00:59:00Z')).open, true);
  assert.equal(storeStatus(hours, new Date('2026-10-07T01:00:00Z')).open, false);
});
test('lojas 1 e 3 fecham às 20h aos domingos', () => {
  const instant = new Date('2026-10-04T23:00:00Z');
  assert.equal(storeStatus(regularHours('20:00'), instant).open, false);
  assert.equal(storeStatus(regularHours(), instant).open, true);
});
test('intervalo que atravessa a meia-noite', () => {
  const hours = { 1: [{ opens: '22:00', closes: '02:00' }] };
  assert.equal(storeStatus(hours, new Date('2026-10-06T04:59:00Z')).open, true);
  assert.equal(storeStatus(hours, new Date('2026-10-06T05:00:00Z')).open, false);
});
test('publicação respeita rascunho, início e último dia no fuso brasileiro', () => {
  const item = { published: true, startsAt: '2026-10-06', endsAt: '2026-10-06' };
  assert.equal(publicationIsVisible(item, new Date('2026-10-06T02:59:00Z')), false);
  assert.equal(publicationIsVisible(item, new Date('2026-10-06T03:00:00Z')), true);
  assert.equal(publicationIsVisible(item, new Date('2026-10-07T02:59:00Z')), true);
  assert.equal(publicationIsVisible(item, new Date('2026-10-07T03:00:00Z')), false);
  assert.equal(publicationIsVisible({ ...item, published: false }, new Date('2026-10-06T15:00:00Z')), false);
});
