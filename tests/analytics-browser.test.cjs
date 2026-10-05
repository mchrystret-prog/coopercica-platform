// Contract tests with fake event surfaces. No real DOM/browser interaction.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseAnalyticsBatch}=require('../.analytics-test/supabase/functions/_shared/analytics.js');
const modulePath=require.resolve('../.analytics-test/lib/analytics-browser.js');
class Surface {listeners=new Map();addEventListener(n,f){if(!this.listeners.has(n))this.listeners.set(n,new Set());this.listeners.get(n).add(f);}removeEventListener(n,f){this.listeners.get(n)?.delete(f);}dispatchEvent(e){this.listeners.get(e.type)?.forEach(f=>f(e));}fire(n,e={}){this.listeners.get(n)?.forEach(f=>f(e));}}
class Storage {data=new Map();getItem(k){return this.data.get(k)||null;}setItem(k,v){this.data.set(k,v);}removeItem(k){this.data.delete(k);}}
class FakeElement {constructor(options={}){Object.assign(this,{dataset:{},tagName:'DIV',id:'',private:false,fixed:false,section:null,anchor:null},options);}closest(selector){if(selector.includes('data-analytics-ignore')&&selector.includes('form'))return this.private?this:null;if(selector.includes('data-analytics-fixed'))return this.fixed?this:null;if(selector==='a[href]')return this.anchor;if(selector.includes('section[id]'))return this.section;if(selector==='header')return null;if(selector==='[data-analytics-id],a,button')return this;return null;}getAttribute(n){return n==='aria-label'?this.ariaLabel:null;}hasAttribute(n){return n==='download'&&this.download;}}
function setup({denied=false,preview=false,gpc=false}={}){
 delete require.cache[modulePath];
 const win=new Surface();win.self=win.top=win;
 const timers=new Map();let counter=0;
 win.setTimeout=(f,delay)=>{timers.set(++counter,{f,delay});return counter;};win.setInterval=win.setTimeout;
 global.clearTimeout=id=>timers.delete(id);global.clearInterval=global.clearTimeout;
 const doc=new Surface();doc.documentElement={scrollHeight:8000,scrollWidth:1366};doc.body={};doc.visibilityState='visible';doc.referrer='https://google.com/search?q=personal';
 const banner=new FakeElement({tagName:'A',dataset:{analyticsKind:'banner',analyticsId:'banner:1',analyticsLabel:'Campanha infantil',analyticsActive:'true'}});banner.anchor=banner;banner.href='https://coopercica-platform.vercel.app/#ofertas';
 doc.querySelectorAll=()=>[banner];
 Object.assign(global,{window:win,document:doc,localStorage:new Storage(),sessionStorage:new Storage(),Element:FakeElement,location:new URL('https://coopercica-platform.vercel.app/?utm_source=meta&utm_medium=cpc&utm_campaign=criancas'+(preview?'&analytics_preview=1':'')),innerWidth:1366,innerHeight:800,scrollX:0,scrollY:0});
 const batches=[];
 Object.defineProperty(global,'navigator',{configurable:true,value:{doNotTrack:'0',globalPrivacyControl:gpc,sendBeacon:(url,blob)=>{batches.push(blob.text());return true;}}});
 let intersection;
 global.IntersectionObserver=class{constructor(fn){intersection=fn;}observe(){}disconnect(){this.disconnected=true;}};
 global.MutationObserver=class{constructor(fn){this.fn=fn;}observe(){}disconnect(){this.disconnected=true;}};
 global.fetch=async(url,options)=>{batches.push(Promise.resolve(options.body));return new Response(null,{status:204});};
 const analytics=require(modulePath);analytics.chooseConsent(denied?'denied':'granted');
 const events=async()=>{const values=await Promise.all(batches);return values.flatMap(text=>parseAnalyticsBatch(JSON.parse(text)));};
 const click=(element,extra={})=>doc.fire('click',{target:element,isTrusted:true,defaultPrevented:false,detail:1,clientX:683,clientY:400,...extra});
 const run=delay=>{for(const [id,t]of [...timers])if(t.delay===delay){timers.delete(id);t.f();}};
 return {analytics,events,win,doc,banner,intersection:()=>intersection,click,run,batches};
}
test('consent refusal, GPC, private routes and heatmap previews produce no traffic',async()=>{
 for(const options of [{denied:true},{gpc:true},{preview:true}]){const s=setup(options);s.analytics.startAnalytics('/')();assert.equal((await s.events()).length,0);}
 const s=setup();s.analytics.startAnalytics('/admin')();assert.equal((await s.events()).length,0);
});
test('collector events satisfy the ingestion contract and attribution excludes referrer queries',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');
 const link=new FakeElement({tagName:'A',section:{id:'delivery'},ariaLabel:'Comprar online'});link.anchor=link;link.href='https://shop.example.com/?email=user';s.click(link);stop();
 const events=await s.events();assert.equal(events.filter(e=>e.event_type==='page_view').length,1);
 const e=events.find(e=>e.event_type==='link_click');assert.equal(e.destination,'shop.example.com');assert.equal(e.x,0.5);assert.equal(e.y,0.05);assert.equal(e.source,'meta');assert.equal(e.campaign,'criancas');assert.equal(e.referrer_host,'google.com');
 assert.equal(s.doc.listeners.get('click').size,0);assert.equal(s.win.listeners.get('scroll').size,0);
});
test('form input, prevented drags and synthetic clicks are excluded',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.click(new FakeElement({private:true}));s.click(new FakeElement(),{defaultPrevented:true});s.click(new FakeElement(),{isTrusted:false});stop();
 assert(! (await s.events()).some(e=>e.event_type==='click'));
});
test('keyboard clicks and fixed menus count without heatmap coordinates',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.click(new FakeElement({tagName:'BUTTON'}),{detail:0});s.click(new FakeElement({fixed:true}));stop();
 const clicks=(await s.events()).filter(e=>['click','non_interactive_click'].includes(e.event_type));assert.equal(clicks.length,2);assert(clicks.every(e=>e.x===null&&e.y===null));
});
test('banner impressions require active visibility and are deduplicated per page',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');const notify=()=>s.intersection()([{target:s.banner,intersectionRatio:0.8}]);
 s.banner.dataset.analyticsActive='false';notify();s.run(1000);s.banner.dataset.analyticsActive='true';notify();s.run(1000);notify();s.run(1000);s.click(s.banner);stop();
 const events=await s.events();assert.equal(events.filter(e=>e.event_type==='banner_view').length,1);assert.equal(events.filter(e=>e.event_type==='banner_click').length,1);
});
test('quick banner click also creates a measured impression',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.click(s.banner);stop();const events=await s.events();assert.equal(events.filter(e=>e.event_type==='banner_view').length,1);
});
test('revoking consent discards queued events and clears the session',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.analytics.chooseConsent('denied');stop();assert.equal((await s.events()).length,0);assert.equal(sessionStorage.getItem('coopercica_analytics_session_v1'),null);
});
test('same tab preserves attribution across routes',async()=>{
 const s=setup();s.analytics.startAnalytics('/')();location=new URL('https://coopercica-platform.vercel.app/revista');s.analytics.startAnalytics('/revista')();const events=await s.events();const views=events.filter(e=>e.event_type==='page_view');assert.equal(views.length,2);assert.equal(views[0].session_id,views[1].session_id);assert.equal(views[1].source,'meta');assert.notEqual(views[0].page_view_id,views[1].page_view_id);
});

test('timestamps and sequence preserve real event order within delivery batches',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.click(new FakeElement({tagName:'BUTTON'}));stop();const events=await s.events();assert(events.every(e=>Number.isFinite(Date.parse(e.occurred_at))));assert.deepEqual(events.map(e=>e.page_sequence),events.map((e,i)=>i+1));
});
test('three positional clicks emit one rage signal without duplicating ordinary clicks',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');for(let i=0;i<3;i++)s.click(new FakeElement({tagName:'BUTTON'}));stop();const events=await s.events();assert.equal(events.filter(e=>e.event_type==='rage_click').length,1);assert.equal(events.filter(e=>e.event_type==='click').length,3);
});
test('static areas are classified separately from links and controls',async()=>{
 const s=setup();const stop=s.analytics.startAnalytics('/');s.click(new FakeElement());s.click(new FakeElement({tagName:'BUTTON'}));stop();const events=await s.events();assert.equal(events.filter(e=>e.event_type==='non_interactive_click').length,1);assert.equal(events.filter(e=>e.event_type==='click').length,1);
});
test('rage detector resets on distance, time, and after an emitted group',()=>{
 const {createRageDetector}=setup().analytics;const detect=createRageDetector();assert.equal(detect(0,0,0),false);assert.equal(detect(10,0,0),false);assert.equal(detect(20,0,0),true);assert.equal(detect(30,0,0),false);assert.equal(detect(5000,0,0),false);assert.equal(detect(5010,100,100),false);assert.equal(detect(5020,100,100),false);assert.equal(detect(5030,100,100),true);
});
