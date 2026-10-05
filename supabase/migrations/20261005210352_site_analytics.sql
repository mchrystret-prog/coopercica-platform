-- Isolated analytics: no changes to existing CMS/content policies or tables.
create schema if not exists analytics_private;
revoke all on schema analytics_private from public, anon, authenticated;
grant usage on schema analytics_private to service_role;

create table public.site_analytics_events (
  event_id uuid primary key,
  session_id uuid not null,
  page_view_id uuid not null,
  recorded_at timestamptz not null default now(),
  event_type text not null check (event_type in ('page_view','banner_view','banner_click','link_click','download','scroll_depth','engagement','click')),
  path text not null check (length(path)<=160 and path ~ '^/($|(quem-somos|lojas|folheteria|delivery|drogaria|revista|politicas)$|folheteria/[a-z0-9-]+$)'),
  device text not null check (device in ('mobile','tablet','desktop')),
  source text not null default '' check (length(source)<=80),
  medium text not null default '' check (length(medium)<=80),
  campaign text not null default '' check (length(campaign)<=80),
  referrer_host text not null default '' check (length(referrer_host)<=100),
  target_id text not null default '' check (length(target_id)<=100),
  label text not null default '' check (length(label)<=100),
  destination text not null default '' check (length(destination)<=180 and destination !~ '[?@%[:space:]]'),
  x real, y real,
  viewport_width integer not null check (viewport_width between 240 and 4096),
  document_height integer not null check (document_height between 1 and 50000),
  value real not null default 0 check (value between 0 and 100),
  check ((x is null and y is null) or (x between 0 and 1 and y between 0 and 1 and event_type in ('click','link_click','banner_click','download')))
);
create index site_analytics_period_idx on public.site_analytics_events(recorded_at);
create index site_analytics_heatmap_idx on public.site_analytics_events(path,device,recorded_at) where x is not null;
create unique index site_analytics_page_unique on public.site_analytics_events(page_view_id) where event_type='page_view';
create unique index site_analytics_banner_unique on public.site_analytics_events(page_view_id,target_id) where event_type='banner_view';
create unique index site_analytics_scroll_unique on public.site_analytics_events(page_view_id,value) where event_type='scroll_depth';
alter table public.site_analytics_events enable row level security;
revoke all on public.site_analytics_events from public, anon, authenticated;
grant select on public.site_analytics_events to authenticated;
grant all on public.site_analytics_events to service_role;
create policy "Approved CMS members read site analytics" on public.site_analytics_events
  for select to authenticated using ((select public.cms_can_edit()));

create table analytics_private.rate_limits (
  key text not null, bucket timestamptz not null, used integer not null,
  primary key(key,bucket)
);
alter table analytics_private.rate_limits enable row level security;
revoke all on analytics_private.rate_limits from public, anon, authenticated;
grant all on analytics_private.rate_limits to service_role;

create function public.site_analytics_ingest(p_events jsonb,p_rate_key text)
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
  insert into public.site_analytics_events(event_id,session_id,page_view_id,event_type,path,device,source,medium,campaign,referrer_host,target_id,label,destination,x,y,viewport_width,document_height,value)
  select event_id,session_id,page_view_id,event_type,path,device,source,medium,campaign,referrer_host,target_id,label,destination,x,y,viewport_width,document_height,value
  from jsonb_to_recordset(p_events) as e(event_id uuid,session_id uuid,page_view_id uuid,event_type text,path text,device text,source text,medium text,campaign text,referrer_host text,target_id text,label text,destination text,x real,y real,viewport_width integer,document_height integer,value real)
  on conflict do nothing;
  get diagnostics inserted_count=row_count;
  return inserted_count;
end $$;
revoke all on function public.site_analytics_ingest(jsonb,text) from public,anon,authenticated;
grant execute on function public.site_analytics_ingest(jsonb,text) to service_role;

create function public.cms_site_analytics_report(p_from date,p_to date,p_path text default null,p_device text default null)
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
      count(*) filter(where event_type in ('banner_click','link_click','download','click')) as clicks,
      count(*) filter(where event_type='banner_click') as banner_clicks,
      count(*) filter(where event_type='download') as downloads,
      coalesce(round((sum(value) filter(where event_type='engagement')/nullif(count(distinct page_view_id),0))::numeric,1),0) as average_seconds,
      max(recorded_at) as last_event from filtered
  ), daily as (
    select (recorded_at at time zone 'America/Sao_Paulo')::date as day,count(*) filter(where event_type='page_view') as views,count(distinct session_id) as sessions
    from filtered group by 1
  ), pages as (
    select path,count(*) filter(where event_type='page_view') as views,count(distinct session_id) as sessions,count(*) filter(where event_type in ('banner_click','link_click','download','click')) as clicks,
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

create function public.cms_site_analytics_heatmap(p_from date,p_to date,p_path text,p_device text)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
  if not public.cms_can_edit() then raise exception 'CMS access required' using errcode='42501'; end if;
  if p_from is null or p_to is null or p_to<p_from or p_to-p_from>89 or p_path is null or p_device is null or p_device not in ('mobile','tablet','desktop') then raise exception 'Invalid heatmap filters'; end if;
  with points as materialized (
    select x,y,viewport_width,document_height from public.site_analytics_events
    where path=p_path and device=p_device and x is not null and recorded_at>=p_from::timestamp at time zone 'America/Sao_Paulo' and recorded_at<(p_to+1)::timestamp at time zone 'America/Sao_Paulo'
  ), cells as (
    select least(39,floor(x*40)) as bx,least(199,floor(y*200)) as by,count(*) as count from points group by 1,2
  ) select jsonb_build_object('total',(select count(*) from points),'viewport_width',coalesce((select round(avg(viewport_width))::integer from points),case p_device when 'mobile' then 390 when 'tablet' then 820 else 1440 end),
    'document_height',coalesce((select round(avg(document_height))::integer from points),4000),
    'points',(select coalesce(jsonb_agg(jsonb_build_object('x',(bx+0.5)/40,'y',(by+0.5)/200,'count',count) order by count desc),'[]'::jsonb) from cells)) into result;
  return result;
end $$;
revoke all on function public.cms_site_analytics_heatmap(date,date,text,text) from public,anon;
grant execute on function public.cms_site_analytics_heatmap(date,date,text,text) to authenticated;

create function public.site_analytics_purge() returns void language sql security invoker set search_path='' as $$
  delete from public.site_analytics_events where recorded_at<now()-interval '90 days';
  delete from analytics_private.rate_limits where bucket<now()-interval '1 hour';
$$;
revoke all on function public.site_analytics_purge() from public,anon,authenticated;
grant execute on function public.site_analytics_purge() to service_role;
do $$ begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    perform cron.schedule('site-analytics-retention','17 * * * *','select public.site_analytics_purge()');
  end if;
end $$;
