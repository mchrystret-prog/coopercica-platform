-- Run with BEGIN / ROLLBACK. Isolated historical date avoids live-traffic assertions.
set local plpgsql.check_asserts=on;
select set_config('request.jwt.claims',json_build_object('sub',(select user_id from public.cms_members where status='approved' and role='admin' limit 1),'role','authenticated')::text,true);
insert into public.site_analytics_events(event_id,session_id,page_view_id,recorded_at,occurred_at,page_sequence,event_type,path,device,source,campaign,target_id,label,destination,value,x,y,viewport_width,document_height)
select gen_random_uuid(),('70000000-0000-4000-8000-'||lpad(s::text,12,'0'))::uuid,('71000000-0000-4000-8000-'||lpad(v::text,12,'0'))::uuid,
 '2000-02-02T12:00:00Z'::timestamptz,'2000-02-02T12:00:00Z'::timestamptz+seq*interval '1 second',seq,event,path,'mobile','qa-behavior-contract','qa-behavior',target,label,dest,value,x,y,390,8000
from (values
 (1,1,1,'page_view','/','','','',0,null::real,null::real),
 (2,1,1,'click','/','ofertas:button','Controle','',0,0.5,0.4),
 (3,1,1,'rage_click','/','ofertas:button','Controle','',0,0.5,0.4),
 (4,1,1,'non_interactive_click','/','page:area','Área','',0,0.2,0.3),
 (5,1,1,'scroll_depth','/','','','',75,null,null),
 (6,1,1,'engagement','/','','','',30,null,null),
 (7,1,2,'page_view','/revista','','','',0,null,null),
 (8,1,2,'download','/revista','magazine:qa','Revista','example.com/documento.pdf',0,0.2,0.2),
 (9,2,3,'page_view','/lojas','','','',0,null,null)
) v(seq,s,v,event,path,target,label,dest,value,x,y);
set local role authenticated;
do $$ declare r jsonb; j jsonb; h jsonb; before_settings jsonb; begin
 r:=public.cms_site_analytics_sessions('2000-02-02','2000-02-02',null,null,'qa-behavior-contract');
 assert (r->>'total')::int=2,'session grouping';
 assert (r#>>'{summary,rage_sessions}')::int=1,'rage sessions';
 assert (r#>>'{summary,non_interactive_sessions}')::int=1,'static sessions';
 assert (r#>>'{summary,conversion_sessions}')::int=1,'conversion sessions';
 assert (r#>>'{summary,average_active_seconds}')::real=15,'visible time';
 assert (public.cms_site_analytics_sessions('2000-02-02','2000-02-02',null,null,'qa-behavior-contract',null,'rage')->>'total')::int=1,'signal filter';
 assert (public.cms_site_analytics_sessions('2000-02-02','2000-02-02','/lojas','mobile','qa-behavior-contract')->>'total')::int=1,'page/device filters';
 assert (public.cms_site_analytics_sessions('2000-02-02','2000-02-02',null,null,'other')->>'total')::int=0,'source filter';
 assert (public.cms_site_analytics_sessions('2000-02-02','2000-02-02',null,null,null,'other')->>'total')::int=0,'campaign filter';
 assert jsonb_array_length(public.cms_site_analytics_sessions('2000-02-02','2000-02-02',null,null,null,null,null,25)->'sessions')=0,'pagination';
 j:=public.cms_site_analytics_journey('2000-02-02','2000-02-02','70000000-0000-4000-8000-000000000001');
 assert (j->>'total')::int=8,'journey includes pages';
 assert (j#>>'{events,0,event_type}')='page_view','real client chronology';
 assert (j#>>'{events,7,event_type}')='download','last event';
 assert (j#>>'{events,0,approximate_time}')::boolean=false,'client timing';
 h:=public.cms_site_analytics_behavior_map('2000-02-02','2000-02-02','/','mobile','clicks');
 assert (h->>'total')::int=2,'rage signal must not duplicate click';
 assert (h->>'views')::int=1,'map views';
 assert (h#>>'{depths,2,views}')::int=1,'scroll reach';
 assert (public.cms_site_analytics_behavior_map('2000-02-02','2000-02-02','/','mobile','rage')->>'total')::int=1,'rage map';
 assert (public.cms_site_analytics_behavior_map('2000-02-02','2000-02-02','/','mobile','non_interactive')->>'total')::int=1,'static map';
 assert (public.cms_site_analytics_heatmap('2000-02-02','2000-02-02','/','mobile')->>'total')::int=2,'legacy map excludes signals';
 assert (public.cms_site_analytics_report('2000-02-02','2000-02-02')#>>'{summary,clicks}')::int=3,'summary includes static only once';
 before_settings:=(public.cms_get_site_customization()->'settings');
 assert public.cms_save_site_customization(jsonb_build_object('history_images',coalesce(before_settings->'history_images','{}'::jsonb)||jsonb_build_object('fundacao','/history/1978.jpg')),'[]'::jsonb),'history save';
 assert (public.cms_get_site_customization()#>>'{settings,history_images,fundacao}')='/history/1978.jpg','history read';
 assert (public.cms_get_site_customization()->'settings'->'identity') is not distinct from before_settings->'identity','identity preserved';
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000000","role":"authenticated"}',true);
do $$ begin
 assert (select count(*) from public.site_analytics_events)=0,'unapproved raw access';
 begin perform public.cms_site_analytics_sessions('2000-02-02','2000-02-02'); raise exception 'sessions access leaked'; exception when insufficient_privilege then null; end;
 begin perform public.cms_site_analytics_journey('2000-02-02','2000-02-02',gen_random_uuid()); raise exception 'journey access leaked'; exception when insufficient_privilege then null; end;
 begin perform public.cms_site_analytics_behavior_map('2000-02-02','2000-02-02','/','mobile'); raise exception 'map access leaked'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.cms_site_analytics_sessions('2000-02-02','2000-02-02'); raise exception 'anonymous sessions access leaked'; exception when insufficient_privilege then null; end;
 begin perform public.cms_site_analytics_journey('2000-02-02','2000-02-02',gen_random_uuid()); raise exception 'anonymous journey access leaked'; exception when insufficient_privilege then null; end;
 begin perform public.cms_site_analytics_behavior_map('2000-02-02','2000-02-02','/','mobile'); raise exception 'anonymous map access leaked'; exception when insufficient_privilege then null; end;
 assert (select value->>'fundacao' from public.site_settings where key='history_images')='/history/1978.jpg','public history images';
end $$;
reset role;
select 'behavior grouping, chronology, filters, heatmaps, permissions and history images passed' as validation;
