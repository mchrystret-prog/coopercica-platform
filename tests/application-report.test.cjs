const { test } = require('node:test');
const assert = require('node:assert/strict');
const XLSX = require('xlsx');
const { applicationFilterQuery, loadApplicationReport, applicationWorkbook } = require('../.report-test/application-report.js');
const filters = { job: '', status: 'review', query: '', start: '2026-11-01', end: '2026-11-30' };
test('combines status and inclusive local dates, with exclusive next-day boundary', () => {
  const query = new URLSearchParams(applicationFilterQuery(filters));
  assert.equal(query.get('status'), 'eq.review');
  assert.deepEqual(query.getAll('created_at'), ['gte.2026-11-01T00:00:00 America/Sao_Paulo', 'lt.2026-12-01T00:00:00 America/Sao_Paulo']);
  assert.throws(() => applicationFilterQuery({ ...filters, start: '2026-12-01' }), /inicial/);
  assert.throws(() => applicationFilterQuery({ ...filters, start: '2026-02-30' }), /válida/);
  assert.equal(new URLSearchParams(applicationFilterQuery({ ...filters, start: '', end: '' })).has('created_at'), false);
});
test('downloads every page even when server caps page size', async () => {
  const calls = [];
  const rows = await loadApplicationReport(filters, async query => {
    calls.push(query);
    const offset = Number(new URLSearchParams(query.split('?')[1]).get('offset'));
    return { items: Array.from({ length: Math.min(100, 251 - offset) }, (_, i) => ({ id: String(offset + i) })), total: 251 };
  });
  assert.equal(rows.length, 251);
  assert.equal(calls.length, 3);
  for (const query of calls) assert.equal(new URLSearchParams(query.split('?')[1]).get('status'), 'eq.review');
});
test('fails instead of returning a partial export on interrupted pagination', async () => {
  await assert.rejects(loadApplicationReport(filters, async () => ({ items: [], total: 10 })), /novamente/);
  await assert.rejects(loadApplicationReport(filters, async () => { throw new Error('Acesso negado'); }), /Acesso negado/);
});
test('xlsx round trip preserves phones and treats formula-like candidate input as text', () => {
  const row = { id: '123', name: '=1+1', email: 'rh@example.test', phone: '011999999999', city: 'Jundiaí', status: 'review', created_at: '2026-11-02T02:59:59Z', updated_at: '', message: '', internal_notes: 'Entrevista', site_jobs: null };
  const book = applicationWorkbook(XLSX, [row], filters);
  const parsed = XLSX.read(XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer' });
  assert.deepEqual(parsed.SheetNames, ['Candidaturas', 'Resumo']);
  const sheet = parsed.Sheets.Candidaturas;
  assert.equal(sheet.B2.v, '=1+1');
  assert.equal(sheet.B2.t, 's');
  assert.equal(sheet.B2.f, undefined);
  assert.equal(sheet.D2.v, '011999999999');
  assert.equal(sheet.H2.v, 'Em análise');
  assert.match(sheet.I2.v, /01\/11\/2026/);
  assert.equal(sheet['!autofilter'].ref, 'A1:L2');
});
