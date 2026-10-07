/* eslint-disable @typescript-eslint/no-require-imports -- Node tests load compiled TypeScript modules. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { offersConfig, normalizeOffers, publicHttps, atPath } = require('../.offers-test/home-offers.js');
const defaults = offersConfig({}, 'delivery');
const item = (patch = {}) => ({ description: 'Produto', regular_price: 20, ...patch });
test('normaliza resposta aninhada, campos mapeados e preços brasileiros sem trocar preço comum por Coopermais', () => {
  const config = offersConfig({ productsPath: 'data.items', field_description: 'name', field_regular_price: 'prices.normal', field_offer_all_price: 'prices.sale' }, 'delivery');
  const [product] = normalizeOffers({ data: { items: [{ name: 'Arroz', prices: { normal: 'R$ 1.234,56', sale: '999,90' } }] } }, config);
  assert.equal(product.regular_price, 1234.56);
  assert.equal(product.offer_all_price, 999.9);
  assert.equal(product.coopermais_price, null);
});
test('omite preço inválido, indisponibilidade e oferta expirada; data inclui fim do dia em São Paulo', () => {
  const config = { ...defaults, limit: 40 };
  const products = normalizeOffers([item({ regular_price: 'vinte' }), item({ available: false }), item({ ends_at: '2026-10-05' }), item({ ends_at: '2026-10-06' })], config, Date.parse('2026-10-07T01:00:00Z'));
  assert.equal(products.length, 1);
});
test('limita quantidade, deduplica e preserva flags dos selos', () => {
  const config = { ...defaults, limit: 2 };
  const products = normalizeOffers([item({ ean: '1', age_18: 'sim' }), item({ ean: '1' }), item({ description: 'Leite', breastfeeding_warning: true }), item({ description: 'Outro' })], config);
  assert.equal(products.length, 2);
  assert.equal(products[0].age_18, true);
  assert.equal(products[1].breastfeeding_warning, true);
});
test('não aceita URLs executáveis, credenciais, IPs ou endpoints locais', () => {
  for (const url of ['javascript:alert(1)', 'http://api.example.com', 'https://user:pass@api.example.com', 'https://127.0.0.1', 'https://10.0.0.1', 'https://[::1]', 'https://localhost', 'https://service.internal', 'https://api.example.com:8080']) assert.equal(publicHttps(url), null);
  assert.equal(publicHttps('https://www.coopercicadelivery.com.br/produto/1'), 'https://www.coopercicadelivery.com.br/produto/1');
  const [product] = normalizeOffers([item({ image_url: 'javascript:alert(1)', delivery_url: 'http://localhost' })], defaults);
  assert.equal(product.image_url, null); assert.equal(product.delivery_url, null);
});
test('resposta incompatível falha e mapeamento não acessa propriedades herdadas', () => {
  assert.throws(() => normalizeOffers({ error: 'failed' }, defaults));
  assert.equal(atPath({}, '__proto__.polluted'), undefined);
});
test('integrações começam desativadas e limites inválidos são normalizados', () => {
  assert.equal(defaults.enabled, false);
  assert.equal(offersConfig({ limit: '-1' }, 'pharmacy').limit, 12);
  assert.equal(offersConfig({ limit: '1000' }, 'delivery').limit, 40);
});

const { previewOffers } = require('../.offers-test/home-offers-preview.js');
test('Delivery e Drogaria preservam o preço exclusivo da API sem atribuir Coopermais a ofertas comuns', () => {
  for (const channel of ['delivery', 'pharmacy']) {
    const config = offersConfig({ field_coopermais_price: 'prices.club' }, channel);
    const products = normalizeOffers([
      item({ ean: '1', prices: { club: '14,90' } }),
      item({ ean: '2', offer_all_price: 15 }),
      item({ ean: '3', prices: { club: 0 } }),
      item({ ean: '4', prices: { club: 25 } }),
    ], config);
    assert.equal(products[0].coopermais_price, 14.9);
    assert.equal(products[0].regular_price, 20);
    assert.deepEqual(products.slice(1).map(product => product.coopermais_price), [null, null, null]);
    assert.equal(products[1].offer_all_price, 15);
  }
});
test('preview dos dois canais demonstra Coopermais e oferta comum sem links de compra', () => {
  for (const channel of ['delivery', 'pharmacy']) {
    const products = previewOffers(channel);
    assert.equal(products.length, 5);
    assert.ok(products.some(product => product.coopermais_price > 0));
    assert.ok(products.some(product => product.coopermais_price === null));
    for (const product of products) {
      assert.equal(product.delivery_url, null);
      if (product.coopermais_price !== null) assert.ok(product.coopermais_price < product.offer_all_price);
    }
  }
});
