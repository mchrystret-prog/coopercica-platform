const { test } = require('node:test');
const assert = require('node:assert/strict');
const { careersBannerIds, getCareersBanners, careersBannerHref, careersBannerInterval, validateCareersBanners } = require('../.careers-test/careers-banners.js');
const { assertUploadGeometry, customizationUploadRule } = require('../.careers-test/cms-upload-rules.js');
const { SUPABASE_URL } = require('../.careers-test/leaflets.js');
const image = `${SUPABASE_URL}/storage/v1/object/public/site-content/careers/test.png`;
test('legacy settings remain readable with no invented banners', () => {
  assert.deepEqual(getCareersBanners({ image, alt: 'Equipe' }), []);
  assert.deepEqual(careersBannerIds({ bannerOrder: 'invalid' }), []);
});
test('ordering, deactivation and stable tracking IDs survive edits', () => {
  const value = { bannerOrder: '["b","a","b"]', banner_b_image: image, banner_b_title: 'Cléo', banner_a_image: image, banner_a_title: 'Márcia', banner_a_active: 'false' };
  assert.deepEqual(getCareersBanners(value).map(b => [b.id,b.active]), [['b',true],['a',false]]);
  assert.equal(validateCareersBanners(value), null);
  assert.equal(getCareersBanners(value)[0].href, '#oportunidades');
});
test('unsafe links and images fail closed', () => {
  for (const href of ['javascript:alert(1)','//evil.test','/\\evil.test','https://user:pass@example.com','data:text/html,test']) assert.equal(careersBannerHref(href), '');
  for (const href of ['#oportunidades','/vagas','https://example.com/historia']) assert.equal(careersBannerHref(href), href);
  assert.match(validateCareersBanners({ bannerOrder: '["a"]', banner_a_image: 'https://evil.test/test.png' }), /Banner 1/);
});
test('uploads enforce requested dimensions without changing legacy photo rules', () => {
  assert.equal(customizationUploadRule('careers:banner_a_image'), 'careersBannerDesktop');
  assert.equal(customizationUploadRule('careers:banner_a_mobileImage'), 'careersBannerMobile');
  assert.equal(customizationUploadRule('careers:image'), 'careersDesktop');
  assert.doesNotThrow(() => assertUploadGeometry('careersBannerDesktop',3384,864));
  assert.throws(() => assertUploadGeometry('careersBannerDesktop',2048,523));
  assert.doesNotThrow(() => assertUploadGeometry('careersBannerMobile',1080,1350));
});
test('autoplay interval is bounded even for malformed settings', () => {
  assert.equal(careersBannerInterval({}),8000);
  assert.equal(careersBannerInterval({bannerInterval:'NaN'}),8000);
  assert.equal(careersBannerInterval({bannerInterval:'1'}),5000);
  assert.equal(careersBannerInterval({bannerInterval:'500'}),30000);
});
