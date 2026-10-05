-- Extend only the analytics module. Older collectors remain compatible.
alter table public.site_analytics_events add column occurred_at timestamptz,
  add column page_sequence integer check (page_sequence between 1 and 1000000);
alter table public.site_analytics_events drop constraint site_analytics_events_event_type_check;
alter table public.site_analytics_events add constraint site_analytics_events_event_type_check
  check(event_type in ('page_view','banner_view','banner_click','link_click','download','scroll_depth','engagement','click','rage_click','non_interactive_click'));
alter table public.site_analytics_events drop constraint site_analytics_events_check;
alter table public.site_analytics_events add constraint site_analytics_events_check
  check((x is null and y is null) or (x between 0 and 1 and y between 0 and 1 and event_type in ('click','link_click','banner_click','download','rage_click','non_interactive_click')));
create index site_analytics_session_idx on public.site_analytics_events(session_id,recorded_at);
create or replace function public.site_analytics_ingest(p_events jsonb,p_rate_key text)
returns integer language plpgsql security invoker set search_path='' as $$
declare n integer; used_count integer; inserted_count integer; s record;
begin
  if jsonb_typeof(p_events)<>'array' or length(p_rate_key)<>64 then raise exception 'invalid_batch'; end if;
  n:=jsonb_array_length(p_events);
  if n<1 or n>40 then raise exception 'invalid_batch'; end if;
  insert into analytics_private.rate_limits as r values ('ip:'||p_rate_key,date_trunc('minute',now()),n)
  on conflict(key,bucket) do update set used=r.used+excluded.used where r.used+excluded.used<=1200 returning used into used_count;
  if used_count is null then raise exception 'rate_limited'; end if;
  for s in select e->>'session_id' as id,count(*)::integer as n from jsonb_array_elements(p_events) e group by 1 loop
    used_count:=null;
    insert into analytics_private.rate_limits as r values ('session:'||s.id,date_trunc('minute',now()),s.n)
    on conflict(key,bucket) do update set used=r.used+excluded.used where r.used+excluded.used<=180 returning used into used_count;
    if used_count is null then raise exception 'rate_limited'; end if;
  end loop;
  insert into public.site_analytics_events(event_id,session_id,page_view_id,event_type,path,device,source,medium,campaign,referrer_host,target_id,label,destination,x,y,viewport_width,document_height,value,occurred_at,page_sequence)
  select event_id,session_id,page_view_id,event_type,path,device,source,medium,campaign,referrer_host,target_id,label,destination,x,y,viewport_width,document_height,value,case when occurred_at between now()-interval '24 hours' and now()+interval '5 minutes' then occurred_at else null end,page_sequence
  from jsonb_to_recordset(p_events) as e(event_id uuid,session_id uuid,page_view_id uuid,event_type text,path text,device text,source text,medium text,campaign text,referrer_host text,target_id text,label text,destination text,x real,y real,viewport_width integer,document_height integer,value real,occurred_at timestamptz,page_sequence integer)
  on conflict do nothing;
  get diagnostics inserted_count=row_count;
  return inserted_count;
end $$;
revoke all on function public.site_analytics_ingest(jsonb,text) from public,anon,authenticated;
grant execute on function public.site_analytics_ingest(jsonb,text) to service_role;

create or replace function public.cms_site_analytics_report(p_from date,p_to date,p_path text default null,p_device text default null)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 then raise exception 'Choose a period of up to 90 days'; end if;
  if p_device is not null and p_device not in ('mobile','tablet','desktop') then raise exception 'Invalid device'; end if;
  with filtered as materialized (
    select * from public.site_analytics_events where recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
    and (p_path is null or path=p_path) and (p_device is null or device=p_device)
  ), summary as (
    select count(*) filter(where event_type='page_view') as views,
      count(distinct session_id) as sessions,
      count(*) filter(where event_type in ('banner_click','link_click','download','click','non_interactive_click')) as clicks,
      count(*) filter(where event_type='banner_click') as banner_clicks,
      count(*) filter(where event_type='download') as downloads,
      coalesce(round((sum(value) filter(where event_type='engagement')/nullif(count(distinct page_view_id),0))::numeric,1),0) as average_seconds,
      max(recorded_at) as last_event from filtered
  ), daily as (
    select (recorded_at at time zone 'America/Sao_Paulo')::date as day,count(*) filter(where event_type='page_view') as views,count(distinct session_id) as sessions
    from filtered group by 1
  ), pages as (
    select path,count(*) filter(where event_type='page_view') as views,count(distinct session_id) as sessions,count(*) filter(where event_type in ('banner_click','link_click','download','click','non_interactive_click')) as clicks,
    coalesce(round((sum(value) filter(where event_type='engagement')/nullif(count(distinct page_view_id),0))::numeric,1),0) as seconds from filtered group by path order by views desc,path limit 100
  ), banners as (
    select target_id,max(label) as label,count(*) filter(where event_type='banner_view') as impressions,count(*) filter(where event_type='banner_click') as clicks,count(distinct page_view_id) filter(where event_type='banner_click') as unique_clicks
    from filtered where event_type in ('banner_view','banner_click') group by target_id order by clicks desc,target_id limit 100
  ), links as (
    select event_type,label,destination,count(*) as clicks from filtered where event_type in ('link_click','download') group by event_type,label,destination order by clicks desc limit 100
  ), devices as (
    select device,count(*) filter(where event_type='page_view') as views,count(distinct session_id) as sessions from filtered group by device order by views desc
  ), sources as (
    select source,medium,campaign,referrer_host,count(distinct session_id) as sessions,count(*) filter(where event_type='page_view') as views from filtered group by source,medium,campaign,referrer_host order by sessions desc limit 50
  ), depths as (
    select value,count(distinct page_view_id) as views from filtered where event_type='scroll_depth' group by value
  )
  select jsonb_build_object(
    'summary',(select to_jsonb(s) from summary s),
    'daily',(select coalesce(jsonb_agg(jsonb_build_object('day',d::date,'views',coalesce(a.views,0),'sessions',coalesce(a.sessions,0)) order by d),'[]'::jsonb) from generate_series(p_from::timestamp,p_to::timestamp,'1 day') d left join daily a on a.day=d::date),
    'pages',(select coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) from pages p),
    'banners',(select coalesce(jsonb_agg(to_jsonb(b)||jsonb_build_object('ctr',round(100.0*b.unique_clicks/nullif(b.impressions,0),2))),'[]'::jsonb) from banners b),
    'links',(select coalesce(jsonb_agg(to_jsonb(l)),'[]'::jsonb) from links l),
    'devices',(select coalesce(jsonb_agg(to_jsonb(d)),'[]'::jsonb) from devices d),
    'sources',(select coalesce(jsonb_agg(to_jsonb(s)),'[]'::jsonb) from sources s),
    'depths',(select coalesce(jsonb_agg(jsonb_build_object('depth',v,'views',coalesce(d.views,0)) order by v),'[]'::jsonb) from unnest(array[25,50,75,90,100]) v left join depths d on d.value=v),
    'paths',(select coalesce(jsonb_agg(path order by path),'[]'::jsonb) from (select distinct path from public.site_analytics_events where recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo') p)
  ) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_report(date,date,text,text) from public,anon;
grant execute on function public.cms_site_analytics_report(date,date,text,text) to authenticated;


create function public.cms_site_analytics_sessions(p_from date,p_to date,p_path text default null,p_device text default null,p_source text default null,p_campaign text default null,p_signal text default null,p_offset integer default 0)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 or p_offset<0 or p_offset>100000 then raise exception 'Invalid period or offset'; end if;
  if p_device is not null and p_device not in ('mobile','tablet','desktop') or p_signal is not null and p_signal not in ('rage','non_interactive','conversion') then raise exception 'Invalid filter'; end if;
  with filtered as materialized (
    select *,coalesce(occurred_at,recorded_at) as at from public.site_analytics_events
    where recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
      and (p_path is null or path=p_path) and (p_device is null or device=p_device)
      and (p_source is null or source=p_source) and (p_campaign is null or campaign=p_campaign)
  ), sessions as materialized (
    select session_id,min(at) as started_at,max(at) as ended_at,
      (array_agg(path order by at,page_sequence nulls last,event_id))[1] as entry_path,
      (array_agg(path order by at desc,page_sequence desc nulls last,event_id))[1] as exit_path,
      max(device) as device,max(source) as source,max(medium) as medium,max(campaign) as campaign,
      count(*) filter(where event_type='page_view') as views,count(distinct path) as pages,
      count(*) filter(where event_type in ('click','link_click','banner_click','download','non_interactive_click')) as clicks,
      coalesce(sum(value) filter(where event_type='engagement'),0) as active_seconds,
      coalesce(max(value) filter(where event_type='scroll_depth'),0) as max_depth,
      count(*) filter(where event_type='rage_click') as rage_clicks,
      count(*) filter(where event_type='non_interactive_click') as non_interactive_clicks,
      count(*) filter(where event_type='download' or target_id in ('cta:delivery','cta:pharmacy')) as conversions
    from filtered group by session_id
  ), matched as materialized (
    select * from sessions where p_signal is null or p_signal='rage' and rage_clicks>0 or p_signal='non_interactive' and non_interactive_clicks>0 or p_signal='conversion' and conversions>0
  ), listed as (select * from matched order by started_at desc,session_id limit 25 offset p_offset),
  hotspots as (
    select path,target_id,max(label) as label,count(*) filter(where event_type='rage_click') as rage_clicks,count(*) filter(where event_type='non_interactive_click') as non_interactive_clicks
    from filtered where event_type in ('rage_click','non_interactive_click') and session_id in(select session_id from matched)
    group by path,target_id order by count(*) desc,path,target_id limit 15
  )
  select jsonb_build_object(
    'total',(select count(*) from matched),
    'summary',(select jsonb_build_object('sessions',count(*),'rage_sessions',count(*) filter(where rage_clicks>0),'non_interactive_sessions',count(*) filter(where non_interactive_clicks>0),'conversion_sessions',count(*) filter(where conversions>0),'average_active_seconds',coalesce(round(avg(active_seconds)::numeric,1),0)) from matched),
    'sessions',(select coalesce(jsonb_agg(to_jsonb(l) order by started_at desc,session_id),'[]'::jsonb) from listed l),
    'hotspots',(select coalesce(jsonb_agg(to_jsonb(h)),'[]'::jsonb) from hotspots h),
    'sources',(select coalesce(jsonb_agg(source order by source),'[]'::jsonb) from(select distinct source from public.site_analytics_events where recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo') s),
    'campaigns',(select coalesce(jsonb_agg(campaign order by campaign),'[]'::jsonb) from(select distinct campaign from public.site_analytics_events where campaign<>'' and recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo') c)
  ) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_sessions(date,date,text,text,text,text,text,integer) from public,anon;
grant execute on function public.cms_site_analytics_sessions(date,date,text,text,text,text,text,integer) to authenticated;

create function public.cms_site_analytics_journey(p_from date,p_to date,p_session_id uuid)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 or p_session_id is null then raise exception 'Invalid session filters'; end if;
  with events as materialized (
    select event_id,page_view_id,coalesce(occurred_at,recorded_at) as at,occurred_at is null as approximate_time,page_sequence,event_type,path,target_id,label,destination,value,x,y
    from public.site_analytics_events where session_id=p_session_id
      and recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
  ), listed as (select * from events order by at,page_sequence nulls last,event_id limit 1000)
  select jsonb_build_object('total',(select count(*) from events),'events',(select coalesce(jsonb_agg(to_jsonb(e) order by at,page_sequence nulls last,event_id),'[]'::jsonb) from listed e)) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_journey(date,date,uuid) from public,anon;
grant execute on function public.cms_site_analytics_journey(date,date,uuid) to authenticated;

create function public.cms_site_analytics_behavior_map(p_from date,p_to date,p_path text,p_device text,p_kind text default 'clicks')
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 or p_path is null or p_device not in ('mobile','tablet','desktop') or p_device is null or p_kind not in ('clicks','rage','non_interactive','scroll') or p_kind is null then raise exception 'Invalid map filters'; end if;
  with filtered as materialized (
    select * from public.site_analytics_events where path=p_path and device=p_device
      and recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
  ), points as materialized (
    select * from filtered where x is not null and (
      p_kind='clicks' and event_type in ('click','link_click','banner_click','download','non_interactive_click') or
      p_kind='rage' and event_type='rage_click' or p_kind='non_interactive' and event_type='non_interactive_click')
  ), cells as (
    select least(39,floor(x*40)) as bx,least(199,floor(y*200)) as by,count(*) as count from points group by 1,2
  ), depths as (
    select value,count(distinct page_view_id) as views from filtered where event_type='scroll_depth' group by value
  )
  select jsonb_build_object('total',(select count(*) from points),'views',(select count(distinct page_view_id) from filtered),
    'viewport_width',coalesce((select round(avg(viewport_width))::integer from filtered),case p_device when 'mobile' then 390 when 'tablet' then 820 else 1440 end),
    'document_height',coalesce((select round(avg(document_height))::integer from filtered),4000),
    'depths',(select coalesce(jsonb_agg(jsonb_build_object('depth',v,'views',coalesce(d.views,0)) order by v),'[]'::jsonb) from unnest(array[25,50,75,90,100]) v left join depths d on d.value=v),
    'points',(select coalesce(jsonb_agg(jsonb_build_object('x',(bx+0.5)/40,'y',(by+0.5)/200,'count',count) order by count desc),'[]'::jsonb) from cells)) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_behavior_map(date,date,text,text,text) from public,anon;
grant execute on function public.cms_site_analytics_behavior_map(date,date,text,text,text) to authenticated;
create or replace function public.cms_site_analytics_heatmap(p_from date,p_to date,p_path text,p_device text)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 or p_path is null or p_device is null or p_device not in ('mobile','tablet','desktop') then raise exception 'Invalid heatmap filters'; end if;
  with points as materialized (
    select x,y,viewport_width,document_height from public.site_analytics_events
    where path=p_path and device=p_device and x is not null and event_type<>'rage_click' and recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
  ), cells as (
    select least(39,floor(x*40)) as bx,least(199,floor(y*200)) as by,count(*) as count from points group by 1,2
  ) select jsonb_build_object('total',(select count(*) from points),'viewport_width',coalesce((select round(avg(viewport_width))::integer from points),case p_device when 'mobile' then 390 when 'tablet' then 820 else 1440 end),
    'document_height',coalesce((select round(avg(document_height))::integer from points),4000),
    'points',(select coalesce(jsonb_agg(jsonb_build_object('x',(bx+0.5)/40,'y',(by+0.5)/200,'count',count) order by count desc),'[]'::jsonb) from cells)) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_heatmap(date,date,text,text) from public,anon;
grant execute on function public.cms_site_analytics_heatmap(date,date,text,text) to authenticated;

