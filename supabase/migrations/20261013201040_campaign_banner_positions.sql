-- Recover duplicate positions: the most recently created banner wins a tie.
lock table public.site_campaigns in share row exclusive mode;
with ranked as (
  select id, row_number() over (order by sort_order, created_at desc, id)::integer as position
  from public.site_campaigns
)
update public.site_campaigns as campaign
set sort_order = ranked.position
from ranked where campaign.id = ranked.id;

alter table public.site_campaigns
  add constraint site_campaigns_position_positive check (sort_order >= 1),
  add constraint site_campaigns_position_unique unique (sort_order) deferrable initially deferred;

-- Serialize writes before any row locks, including writes performed by CMS RPCs.
create function public.lock_campaign_positions()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('public.site_campaigns.positions', 0));
  return null;
end;
$$;
create trigger lock_campaign_positions
before insert or update or delete on public.site_campaigns
for each statement execute function public.lock_campaign_positions();

create function public.place_campaign_banner()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  available_positions integer;
begin
  -- Internal shifts must not recursively move the other banners again.
  if pg_catalog.pg_trigger_depth() > 1 then return new; end if;
  if tg_op = 'UPDATE' and new.sort_order is not distinct from old.sort_order then return new; end if;

  select count(*)::integer + 1 into available_positions
  from public.site_campaigns where id <> new.id;
  if new.sort_order is null or new.sort_order < 1 or new.sort_order > available_positions then
    raise exception 'Escolha uma posição inteira entre 1 e %.', available_positions using errcode = '22023';
  end if;

  -- Exclude the moved banner, compact any gaps, then open its requested slot.
  with ranked as (
    select id, row_number() over (order by sort_order, created_at desc, id)::integer as position
    from public.site_campaigns where id <> new.id
  ), positioned as (
    select id, position + case when position >= new.sort_order then 1 else 0 end as position
    from ranked
  )
  update public.site_campaigns as campaign set sort_order = positioned.position
  from positioned where campaign.id = positioned.id and campaign.sort_order <> positioned.position;
  return new;
end;
$$;
create trigger place_campaign_banner
before insert or update of sort_order on public.site_campaigns
for each row execute function public.place_campaign_banner();

revoke all on function public.lock_campaign_positions() from public, anon;
revoke all on function public.place_campaign_banner() from public, anon;
grant execute on function public.lock_campaign_positions() to authenticated, service_role;
grant execute on function public.place_campaign_banner() to authenticated, service_role;
