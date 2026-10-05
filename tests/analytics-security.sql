-- Run inside a transaction after the analytics migration; roll back all fixtures.
set local plpgsql.check_asserts = on;
select set_config('request.jwt.claims',json_build_object('sub',(select user_id from public.cms_members where status='approved' and role='admin' limit 1),'role','authenticated')::text,true);
insert into public.site_analytics_events(event_id,session_id,page_view_id,recorded_at,event_type,path,device,source,medium,campaign,target_id,label,destination,value,x,y,viewport_width,document_height)
select ('10000000-0000-4000-8000-'||lpad(seq::text,12,'0'))::uuid,
 ('20000000-0000-4000-8000-'||lpad((case when v=3 then 2 else 1 end)::text,12,'0'))::uuid,
 ('30000000-0000-4000-8000-'||lpad(v::text,12,'0'))::uuid,
 '2026-10-05T03:00:00Z'::timestamptz,event,path,device,'meta','cpc','qa-analytics',target,label,destination,value,x,y,1366,8000
from (values
 (1,1,'page_view','/','desktop','','','',0,null::real,null::real),
 (2,2,'page_view','/','desktop','','','',0,null,null),
 (3,3,'page_view','/revista','mobile','','','',0,null,null),
 (4,1,'banner_view','/','desktop','banner:qa','QA banner','',0,null,null),
 (5,2,'banner_view','/','desktop','banner:qa','QA banner','',0,null,null),
 (6,1,'banner_click','/','desktop','banner:qa','QA banner','/#ofertas',0,0.5,0.4),
 (7,1,'banner_click','/','desktop','banner:qa','QA banner','/#ofertas',0,0.5,0.4),
 (8,2,'banner_click','/','desktop','banner:qa','QA banner','/#ofertas',0,0.5,0.4),
 (9,3,'download','/revista','mobile','magazine:qa','QA revista','example.com/documento.pdf',0,0.5,0.2),
 (10,1,'scroll_depth','/','desktop','','','',75,null,null),
 (11,2,'scroll_depth','/','desktop','','','',75,null,null),
 (12,1,'engagement','/','desktop','','','',30,null,null),
 (13,2,'engagement','/','desktop','','','',30,null,null)
) as v(seq,v,event,path,device,target,label,destination,value,x,y);
insert into public.site_analytics_events(event_id,session_id,page_view_id,recorded_at,event_type,path,device,viewport_width,document_height)
values ('10000000-0000-4000-8000-000000000099','20000000-0000-4000-8000-000000000099','30000000-0000-4000-8000-000000000099','2026-10-05T02:59:59Z','page_view','/lojas','desktop',1366,8000);
set local role authenticated;
do $$ declare r jsonb; h jsonb; begin
 r:=public.cms_site_analytics_report('2026-10-05','2026-10-05');
 assert (r#>>'{summary,views}')::int=3,'views';
 assert (r#>>'{summary,sessions}')::int=2,'sessions';
 assert (r#>>'{summary,banner_clicks}')::int=3,'banner clicks';
 assert (r#>>'{summary,downloads}')::int=1,'PDFs';
 assert (r#>>'{summary,average_seconds}')::real=20,'time';
 assert (r#>>'{banners,0,ctr}')::real=100,'CTR must deduplicate repeated clicks';
 assert (r#>>'{depths,2,views}')::int=2,'scroll depth';
 assert (public.cms_site_analytics_report('2026-10-05','2026-10-05','/','desktop')#>>'{summary,views}')::int=2,'filters';
 assert (public.cms_site_analytics_report('2026-10-04','2026-10-04')#>>'{summary,views}')::int=1,'SP midnight';
 h:=public.cms_site_analytics_heatmap('2026-10-05','2026-10-05','/','desktop');
 assert (h->>'total')::int=3,'heatmap excludes mobile and other pages';
 assert (h#>>'{points,0,count}')::int=3,'heatmap clustering';
 begin perform public.cms_site_analytics_report('2026-01-01','2026-10-05'); raise exception 'period accepted'; exception when raise_exception then if sqlerrm='period accepted' then raise; end if; end;
end $$;
-- Pending/unapproved users must see no raw events and cannot run reports.
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}',true);
do $$ begin
 assert (select count(*) from public.site_analytics_events)=0,'RLS leaked rows';
 begin perform public.cms_site_analytics_report('2026-10-05','2026-10-05'); raise exception 'unapproved user accessed report'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform count(*) from public.site_analytics_events; raise exception 'anon read allowed'; exception when insufficient_privilege then null; end;
 begin perform public.site_analytics_ingest('[]',''); raise exception 'anon ingest allowed'; exception when insufficient_privilege then null; end;
 begin perform public.cms_site_analytics_report('2026-10-05','2026-10-05'); raise exception 'anon report allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.site_analytics_events(event_id) values(gen_random_uuid()); raise exception 'anon write allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ declare e jsonb; n int; begin
 e:=jsonb_build_array(jsonb_build_object('event_id','40000000-0000-4000-8000-000000000001','session_id','50000000-0000-4000-8000-000000000001','page_view_id','60000000-0000-4000-8000-000000000001','event_type','click','path','/','device','desktop','source','qa','medium','','campaign','','referrer_host','','target_id','','label','','destination','','x',0.5,'y',0.5,'viewport_width',1366,'document_height',8000,'value',0));
 assert public.site_analytics_ingest(e,repeat('a',64))=1,'ingestion';
 assert public.site_analytics_ingest(e,repeat('a',64))=0,'idempotent retry';
 for n in 1..4 loop
   select jsonb_agg((e->0)||jsonb_build_object('event_id',gen_random_uuid())) into e from generate_series(1,40);
   perform public.site_analytics_ingest(e,repeat('a',64));
   -- Restore the template before generating the next batch.
   e:=jsonb_build_array(e->0);
 end loop;
 begin
   select jsonb_agg((e->0)||jsonb_build_object('event_id',gen_random_uuid())) into e from generate_series(1,40);
   perform public.site_analytics_ingest(e,repeat('a',64));
   raise exception 'rate limit not enforced';
 exception when raise_exception then if sqlerrm<>'rate_limited' then raise; end if; end;
end $$;
reset role;
select 'analytics permissions, ingestion, rate limit, reports, filters, timezone and heatmap passed' as validation;
