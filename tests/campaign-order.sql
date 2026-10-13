-- Regression test: all fixture rows and shifts are rolled back.
begin;
do $$ begin
  perform set_config('request.jwt.claims', (
    select json_build_object('sub', user_id, 'role', 'authenticated')::text
    from public.cms_members where status = 'approved' and role in ('admin', 'editor') limit 1
  ), true);
end $$;
set local role authenticated;
do $$
declare template public.site_campaigns; first_id uuid; second_id uuid; total integer;
begin
  select * into template from public.site_campaigns order by sort_order limit 1;
  select count(*) into total from public.site_campaigns;
  insert into public.site_campaigns(title, desktop_image_url, mobile_image_url, sort_order, active)
  values ('QA position first', template.desktop_image_url, template.mobile_image_url, 1, false) returning id into first_id;
  insert into public.site_campaigns(title, desktop_image_url, mobile_image_url, sort_order, active)
  values ('QA position second', template.desktop_image_url, template.mobile_image_url, 1, false) returning id into second_id;
  if (select sort_order from public.site_campaigns where id = first_id) <> 2 then
    raise exception 'Inserting at first must shift the previous first banner';
  end if;
  update public.site_campaigns set sort_order = total + 2 where id = second_id;
  if (select sort_order from public.site_campaigns where id = first_id) <> 1 then raise exception 'Move down failed'; end if;
  update public.site_campaigns set sort_order = 1 where id = second_id;
  if (select sort_order from public.site_campaigns where id = first_id) <> 2 then raise exception 'Move up failed'; end if;
  delete from public.site_campaigns where id = first_id;
  insert into public.site_campaigns(title, desktop_image_url, mobile_image_url, sort_order, active)
  values ('QA gap compaction', template.desktop_image_url, template.mobile_image_url, 2, false);
  if (select count(distinct sort_order) from public.site_campaigns) <> total + 2
    or (select max(sort_order) from public.site_campaigns) <> total + 2 then raise exception 'Gaps were not compacted'; end if;
  begin
    update public.site_campaigns set sort_order = 0 where id = second_id;
    raise exception 'Zero position accepted';
  exception when invalid_parameter_value then null; end;
  begin
    update public.site_campaigns set sort_order = 9999 where id = second_id;
    raise exception 'Out of range position accepted';
  exception when invalid_parameter_value then null; end;
end $$;
set constraints all immediate;
rollback;
