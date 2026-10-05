const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseAnalyticsBatch,safePath,safeLabel,safeDestination,campaignToken,readBatch} = require('../.analytics-test/supabase/functions/_shared/analytics.js');
const {csvCell,analyticsRange} = require('../.analytics-test/lib/analytics-report.js');
const id = '11111111-1111-4111-8111-111111111111';
const event = () => ({event_id:id,session_id:id,page_view_id:id,event_type:'page_view',path:'/',device:'desktop',source:'meta',medium:'cpc',campaign:'criancas',referrer_host:'google.com',target_id:'',label:'',destination:'',x:null,y:null,viewport_width:1366,document_height:8000,value:0});
const batch = e => ({consent:'granted',events:[e]});
test('accepts public routes and excludes CMS/private and encoded paths',()=>{
 assert.equal(safePath('/folheteria/c-de-crianca'),'/folheteria/c-de-crianca');
 for(const path of ['/admin','/admin/analytics','/api/secret','//admin','/folheteria/../admin','/folheteria/%2e%2e'])assert.equal(safePath(path),null);
 assert.equal(safePath('/revista/?email=test'),' /revista'.trim());
});
test('removes queries, contacts and external paths from destinations',()=>{
 const base='https://coopercica-platform.vercel.app/';
 assert.equal(safeDestination('/#lojas',base),'/#lojas');
 assert.equal(safeDestination('/revista?token=abc',base),'/revista');
 assert.equal(safeDestination('https://wa.me/5511999999999?text=abc',base),'wa.me');
 assert.equal(safeDestination('mailto:mattheus@example.com',base),'mailto');
 assert.equal(safeDestination('tel:+5511999999999',base),'tel');
 assert.equal(safeDestination('https://storage.test/private-name.pdf?token=a',base),'storage.test/documento.pdf');
 assert.equal(safeDestination('javascript:alert(1)',base),'');
});
test('scrubs contact data in titles and UTM values',()=>{
 assert(!safeLabel('Contato user@example.com 11999999999').includes('user@'));
 assert(!safeLabel('Contato user@example.com 11999999999').includes('99999'));
 assert.equal(campaignToken('user@example.com'),'');
 assert.equal(campaignToken('5511999999999'),'');
 assert.equal(campaignToken('criancas_2026'),'criancas_2026');
});
test('requires consent and exact, bounded event fields',()=>{
 assert.equal(parseAnalyticsBatch(batch(event())).length,1);
 assert.throws(()=>parseAnalyticsBatch({consent:'denied',events:[event()]}));
 assert.throws(()=>parseAnalyticsBatch(batch({...event(),email:'person@company.com'})));
 assert.throws(()=>parseAnalyticsBatch({consent:'granted',events:Array.from({length:41},event)}));
 for(const changes of [{path:'/admin'},{event_type:'mouse_input'},{x:2,y:0.5},{event_type:'click',x:0.1,y:null},{value:10},{device:'bot'},{destination:'wa.me/5511999999999'},{label:'x'.repeat(201)},{viewport_width:9000},{event_id:'invalid'}])assert.throws(()=>parseAnalyticsBatch(batch({...event(),...changes})));
});
test('validates heatmap points and scroll milestones',()=>{
 assert.equal(parseAnalyticsBatch(batch({...event(),event_type:'click',x:0,y:1}))[0].y,1);
 assert.equal(parseAnalyticsBatch(batch({...event(),event_type:'scroll_depth',value:75}))[0].value,75);
 assert.throws(()=>parseAnalyticsBatch(batch({...event(),event_type:'scroll_depth',value:80})));
 assert.throws(()=>parseAnalyticsBatch(batch({...event(),event_type:'engagement',value:61})));
});
test('bounds request streaming before JSON parsing',async()=>{
 assert.equal((await readBatch(new Request('https://site.test',{method:'POST',body:JSON.stringify(batch(event()))}))).length,1);
 await assert.rejects(()=>readBatch(new Request('https://site.test',{method:'POST',body:'x'.repeat(32769)})),/payload_too_large/);
});
test('escapes CSV cells and spreadsheet formulas',()=>{
 assert.equal(csvCell('a"b'),'"a""b"');
 for(const value of ['=1+1','+cmd','@SUM(A1)',' -2'])assert(csvCell(value).startsWith('"\''));
 assert.equal(csvCell(123),'"123"');
});
test('period presets include exactly the requested local dates',()=>{
 for(const days of [7,30,90]){const r=analyticsRange(days);assert.equal((Date.parse(r.to)-Date.parse(r.from))/86400000,days-1);}
});

test('new timing fields are optional for legacy collectors and strictly validated',()=>{
 const timing={occurred_at:new Date().toISOString(),page_sequence:1};assert.equal(parseAnalyticsBatch(batch({...event(),...timing}))[0].page_sequence,1);
 for(const changes of [{...timing,page_sequence:0},{...timing,page_sequence:1.5},{occurred_at:new Date().toISOString()},{...timing,occurred_at:'yesterday'},{...timing,occurred_at:'2020-01-01T00:00:00.000Z'}])assert.throws(()=>parseAnalyticsBatch(batch({...event(),...changes})));
 for(const event_type of ['rage_click','non_interactive_click'])assert.equal(parseAnalyticsBatch(batch({...event(),event_type,x:0.1,y:0.2}))[0].event_type,event_type);
});
