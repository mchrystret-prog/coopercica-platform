-- Marketing edits site content, but never recruitment or API configuration.
alter table public.cms_members drop constraint cms_members_role_check;
alter table public.cms_members add constraint cms_members_role_check
  check (role in ('admin', 'editor', 'hr', 'marketing'));

create or replace function public.cms_is_marketing()
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists(select 1 from public.cms_members
    where user_id = (select auth.uid()) and role = 'marketing');
$$;
revoke all on function public.cms_is_marketing() from public, anon;
grant execute on function public.cms_is_marketing() to authenticated;

create or replace function public.cms_marketing_setting_allowed(p_key text)
returns boolean language sql immutable security invoker set search_path = '' as $$
  select coalesce(p_key in ('identity', 'history_images', 'home_videos', 'videos_header',
    'coopermais_banner', 'home_partners', 'footer_contact', 'social_sharing', 'home_faq',
    'footer', 'header', 'store_galleries') or p_key like 'leaflet_asset:%', false);
$$;
revoke all on function public.cms_marketing_setting_allowed(text) from public, anon;
grant execute on function public.cms_marketing_setting_allowed(text) to authenticated;

-- Keep the existing owner-executed membership lookup to avoid RLS recursion.
create or replace function public.cms_can_edit()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.cms_members where user_id = (select auth.uid())
    and status = 'approved' and role in ('admin', 'editor', 'marketing'));
$$;

create policy "Marketing settings scope" on public.site_settings
as restrictive for all to authenticated
using (not (select public.cms_is_marketing()) or public.cms_marketing_setting_allowed(key))
with check (not (select public.cms_is_marketing()) or public.cms_marketing_setting_allowed(key));

create policy "Marketing sections scope" on public.site_sections
as restrictive for all to authenticated
using (not (select public.cms_is_marketing()) or id in ('app-showcase', 'ofertas', 'lojas', 'drogaria', 'delivery', 'revista', 'historia'))
with check (not (select public.cms_is_marketing()) or id in ('app-showcase', 'ofertas', 'lojas', 'drogaria', 'delivery', 'revista', 'historia'));

create policy "Marketing recruitment files excluded" on storage.objects
as restrictive for all to authenticated
using (not (select public.cms_is_marketing()) or bucket_id not in ('site-content', 'leaflet-assets', 'job-resumes') or (public.cms_can_edit() and bucket_id <> 'job-resumes' and not (bucket_id = 'site-content' and split_part(name, '/', 1) = 'careers')))
with check (not (select public.cms_is_marketing()) or bucket_id not in ('site-content', 'leaflet-assets', 'job-resumes') or (public.cms_can_edit() and bucket_id <> 'job-resumes' and not (bucket_id = 'site-content' and split_part(name, '/', 1) = 'careers')));

-- The reader can use caller privileges; RLS filters protected settings as well.
create or replace function public.cms_get_site_customization()
returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or not public.cms_can_edit() then
    raise exception 'Acesso CMS não aprovado' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'settings', (select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from public.site_settings),
    'sections', (select coalesce(jsonb_agg(to_jsonb(s) order by sort_order), '[]'::jsonb) from public.site_sections s)
  );
end;
$$;

-- Writes already use this RPC because direct table writes are not granted.
-- Validate the entire payload before any write; SECURITY DEFINER bypasses RLS.
create or replace function public.cms_save_site_customization(p_settings jsonb, p_sections jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare item jsonb; k text; v jsonb; so integer; act boolean;
begin
  if auth.uid() is null or not public.cms_can_edit() then
    raise exception 'Acesso CMS não aprovado' using errcode = '42501';
  end if;
  if p_settings is null or jsonb_typeof(p_settings) <> 'object' then raise exception 'Configurações inválidas'; end if;
  if p_sections is null or jsonb_typeof(p_sections) <> 'array' then raise exception 'Seções inválidas'; end if;
  if public.cms_is_marketing() then
    if exists(select 1 from jsonb_object_keys(p_settings) as keys(key) where not public.cms_marketing_setting_allowed(key))
      or exists(select 1 from jsonb_array_elements(p_sections) s where coalesce(s->>'id', '') not in ('app-showcase', 'ofertas', 'lojas', 'drogaria', 'delivery', 'revista', 'historia')) then
      raise exception 'Marketing não tem acesso a vagas ou configurações de API.' using errcode = '42501';
    end if;
  end if;
  for k,v in select key,value from jsonb_each(p_settings) loop
    insert into public.site_settings(key,value,updated_at) values(k,v,now())
    on conflict(key) do update set value=excluded.value,updated_at=now();
  end loop;
  for item in select value from jsonb_array_elements(p_sections) loop
    so := case when nullif(item->>'sort_order','') is null then null else (item->>'sort_order')::integer end;
    act := case when nullif(item->>'active','') is null then null else (item->>'active')::boolean end;
    update public.site_sections set
      label=coalesce(nullif(item->>'label',''),label), sort_order=coalesce(so,sort_order),
      active=coalesce(act,active), content=case when jsonb_typeof(item->'content')='object' then item->'content' else content end,
      updated_at=now() where id=item->>'id';
  end loop;
  return true;
end;
$$;
revoke all on function public.cms_get_site_customization(), public.cms_save_site_customization(jsonb,jsonb) from public, anon;
grant execute on function public.cms_get_site_customization(), public.cms_save_site_customization(jsonb,jsonb) to authenticated;
