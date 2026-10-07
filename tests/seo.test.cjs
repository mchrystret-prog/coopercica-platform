/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS tests load the separately compiled TypeScript modules. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const seo = require('../.seo-test/lib/seo.js');
const { stores } = require('../.seo-test/data/stores.js');
const job = { id: '123', slug: 'operador-123', title: 'Operador', description: 'Atendimento <script> e organização', responsibilities: 'Atender\nCooperar', requirements: 'Disponibilidade', benefits: '', status: 'open', city: 'Jundiaí', unit: 'Jardim Cica', work_mode: 'onsite', employment_type: 'clt', openings: 2, closes_on: '2026-10-07', created_at: '2026-10-01T12:00:00Z' };
const now = Date.parse('2026-10-07T15:00:00Z');
test('canonical origin rejects credentials, HTTP and paths', () => {
 assert.equal(seo.siteOrigin('https://empresa.example/'), 'https://empresa.example');
 for (const value of ['http://empresa.example', 'https://user:pass@empresa.example', 'https://empresa.example/site', 'https://empresa.example/?x=1', 'https://empresa.example/#home']) assert.throws(() => seo.siteOrigin(value));
});
test('page metadata resolves distinct canonical URLs and previews cannot index', () => {
 const previous = process.env.VERCEL_ENV;
 const previousFlag = process.env.SITE_INDEXING_ENABLED;
 try {
  process.env.VERCEL_ENV = 'production';
  process.env.SITE_INDEXING_ENABLED = 'true';
  assert.notEqual(seo.pageMetadata('Lojas', 'Lojas', '/lojas').alternates.canonical, seo.pageMetadata('Carreiras', 'Vagas', '/vagas').alternates.canonical);
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(seo.pageMetadata('Lojas', 'Lojas', '/lojas').robots, { index: false, follow: false, noarchive: true, nosnippet: true });
 } finally { if (previous === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous; if (previousFlag === undefined) delete process.env.SITE_INDEXING_ENABLED; else process.env.SITE_INDEXING_ENABLED = previousFlag; }
});
test('CMS text cannot terminate JSON-LD script; values survive encoding', () => {
 const data = { text: '</script><script>alert(1)</script>&\u2028\u2029' };
 const serialized = seo.jsonLd(data);
 assert.equal(serialized.includes('<'), false);
 assert.deepEqual(JSON.parse(serialized), data);
});
test('job closes at the end of its Brazilian calendar day', () => {
 assert.equal(seo.jobIsCurrent(job, Date.parse('2026-10-08T02:59:59.999Z')), true);
 assert.equal(seo.jobIsCurrent(job, Date.parse('2026-10-08T03:00:00Z')), false);
 assert.equal(seo.jobIsCurrent({ ...job, status: 'closed' }, now), false);
 assert.equal(seo.jobIsCurrent({ ...job, closes_on: 'invalid' }, now), false);
 assert.equal(seo.jobIsCurrent({ ...job, closes_on: null }, now), true);
});
test('JobPosting carries visible text, real location and expiry without invented salary or work hours', () => {
 const schema = seo.jobSchema(job, now);
 assert.equal(schema.jobLocation.address.addressCountry, 'BR');
 assert.equal(schema.validThrough, '2026-10-07T23:59:59-03:00');
 assert.match(schema.description, /Atendimento &lt;script&gt;/);
 assert.match(schema.description, /Atender<br>Cooperar/);
 assert.equal(schema.baseSalary, undefined);
 assert.equal(schema.employmentType, undefined); // CLT does not establish full-time hours.
});
test('expired, draft, incomplete and remote-eligibility-unknown jobs have no recruiting schema', () => {
 for (const patch of [{ closes_on: '2026-10-06' }, { status: 'draft' }, { work_mode: 'remote' }, { city: 'Unknown' }, { description: '' }, { created_at: 'invalid' }]) assert.equal(seo.jobSchema({ ...job, ...patch }, now), null);
});
test('store schema uses existing public address and unambiguous opening hours', () => {
 const store = { ...stores[0], hours: 'Seg a sex 07h às 22h | Dom 08h às 18h' };
 const schema = seo.storeSchema(store);
 assert.equal(schema.address.streetAddress, store.address);
 assert.equal(schema.openingHoursSpecification.length, 6);
 const sunday = schema.openingHoursSpecification.find(h => h.dayOfWeek.endsWith('/Sunday'));
 assert.equal(sunday.opens, '08:00');
 assert.equal(sunday.closes, '18:00');
 assert.equal(schema.aggregateRating, undefined);
});
test('entity identifiers and breadcrumbs share the public canonical origin', () => {
 const graph = seo.organizationGraph()['@graph'];
 assert.equal(graph[1].publisher['@id'], graph[0]['@id']);
 const crumbs = seo.breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Lojas', path: '/lojas' }]);
 assert.deepEqual(crumbs.itemListElement.map(c => c.position), [1, 2]);
 assert.equal(crumbs.itemListElement[1].item, seo.absoluteUrl('/lojas'));
});

const { indexingEnabled, indexingHeaders } = require('../.seo-test/lib/site-indexing.js');
test('unconfigured production blocks indexing across pages, APIs and local PDFs', () => {
 const previous = { flag: process.env.SITE_INDEXING_ENABLED, vercel: process.env.VERCEL_ENV };
 try {
  process.env.VERCEL_ENV = 'production';
  for (const flag of [undefined, 'false', '1', 'TRUE', '']) {
   if (flag === undefined) delete process.env.SITE_INDEXING_ENABLED;
   else process.env.SITE_INDEXING_ENABLED = flag;
   assert.equal(indexingEnabled(), false);
   assert.equal(indexingHeaders()[0].source, '/:path*');
   assert.match(indexingHeaders()[0].headers[0].value, /noindex/);
  }
  process.env.SITE_INDEXING_ENABLED = 'true';
  assert.equal(indexingEnabled(), true);
  assert.equal(indexingHeaders()[0].source, '/api/:path*');
  process.env.VERCEL_ENV = 'preview';
  assert.equal(indexingEnabled(), false);
  assert.equal(indexingHeaders()[0].source, '/:path*');
 } finally {
  if (previous.flag === undefined) delete process.env.SITE_INDEXING_ENABLED; else process.env.SITE_INDEXING_ENABLED = previous.flag;
  if (previous.vercel === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous.vercel;
 }
});
