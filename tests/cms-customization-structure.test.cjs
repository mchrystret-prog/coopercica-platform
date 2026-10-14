const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('lib/cms-customization-structure.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
new Function('exports', source)(moduleExports);
const { customizationModules, customizationSavePayload } = moduleExports;
const sections = [{id:'revista',label:'Revista',active:true,sort_order:4,content:{title1:'Título editado',featuredId:'edition-1',editionDetails:'conteúdo antigo'}},{id:'lojas',label:'Lojas',active:true,sort_order:2,content:{title1:'Lojas'}}];
const current = {settings:{},sections:[{...sections[0],content:{title1:'Título atual',featuredId:'edition-2',editionDetails:'resumo atualizado'}}]};
test('all site presentation tabs belong to Personalização',()=>{
  for(const tab of ['identity','sections','history','careers','videos','coopermais','partners','contact','sharing','faq'])assert.ok(customizationModules.personalization.tabs.includes(tab));
  assert.ok(!customizationModules.personalization.tabs.includes('magazine'));
  assert.deepEqual(customizationModules.magazines.tabs,['magazine']);
});
test('saving site presentation preserves fresh magazine editorial content',()=>{
  const saved=customizationSavePayload('personalization',{settings:{identity:{siteName:'Coopercica'},store_galleries:{lojas:'[]'}},sections},current);
  assert.equal(saved.p_sections[0].content.title1,'Título editado');
  assert.equal(saved.p_sections[0].content.editionDetails,'resumo atualizado');
  assert.equal(saved.p_sections[0].content.featuredId,'edition-1');
  assert.equal(saved.p_sections.length,2);
  assert.ok(!saved.p_settings.store_galleries);
});
test('saving Nessa edição preserves current visual presentation and selection',()=>{
  const saved=customizationSavePayload('magazines',{settings:{identity:{siteName:'ignored'}},sections},current);
  assert.equal(saved.p_sections.length,1);
  assert.equal(saved.p_sections[0].content.title1,'Título atual');
  assert.equal(saved.p_sections[0].content.featuredId,'edition-2');
  assert.equal(saved.p_sections[0].content.editionDetails,'conteúdo antigo');
  assert.ok(!('active' in saved.p_sections[0]));
  assert.deepEqual(saved.p_settings,{});
});
