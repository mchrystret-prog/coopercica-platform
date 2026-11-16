-- Run in a transaction and always ROLLBACK: no real memberships or content change.
set local plpgsql.check_asserts = on;
select set_config('qa.marketing.uid', (select user_id::text from public.cms_members where status='approved' and role='admin' limit 1), true);
select set_config('request.jwt.claims', json_build_object('sub',current_setting('qa.marketing.uid'),'role','authenticated')::text, true);
update public.cms_members set role='marketing' where user_id=current_setting('qa.marketing.uid')::uuid;
insert into public.site_settings(key,value) values ('offers_delivery','{"qa":true}') on conflict(key) do nothing;
set local role authenticated;
do $$
declare n integer; content jsonb; leaflet_id uuid; magazine_id uuid;
begin
  assert public.cms_can_edit(), 'Marketing edits content';
  assert not public.cms_is_admin(), 'Marketing is not admin';
  assert not public.cms_can_manage_recruitment(), 'Marketing cannot manage recruitment';
  content := public.cms_get_site_customization();
  assert not ((content->'settings') ? 'careers_hero'), 'Recruitment settings filtered';
  assert not ((content->'settings') ? 'offers_delivery'), 'API settings filtered';
  assert (select count(*) from public.site_settings where key in ('careers_hero','offers_delivery'))=0, 'Direct settings reads filtered';
  assert public.cms_save_site_customization('{"history_images":{"qa":"test"}}','[]'), 'Marketing saves personalization';
  assert public.cms_save_site_customization('{}','[{"id":"revista","content":{"editionDetails":"{}"}}]'), 'Marketing edits magazine presentation';
  begin
    perform public.cms_save_site_customization('{"offers_delivery":{"endpoint":"https://example.invalid"}}','[]');
    raise exception 'API write accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.cms_save_site_customization('{"careers_hero":{}}','[]');
    raise exception 'Recruitment settings write accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform public.cms_save_site_customization('{}','[{"id":"careers","content":{}}]');
    raise exception 'Unknown section write accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.site_settings set value='{}' where key='offers_delivery';
    get diagnostics n=row_count; assert n=0, 'Direct API write denied';
  exception when insufficient_privilege then null; end;
  assert (select count(*) from public.site_job_applications)=0, 'No candidate PII';
  assert (select count(*) from storage.objects where bucket_id='job-resumes')=0, 'No resumes';
  update public.site_jobs set title='QA must not change' where status='draft';
  get diagnostics n=row_count; assert n=0, 'No vacancy writes';
  update public.cms_members set role='admin' where user_id=current_setting('qa.marketing.uid')::uuid;
  get diagnostics n=row_count; assert n=0, 'No privilege escalation';
  assert (select count(*) from public.cms_members where user_id<>current_setting('qa.marketing.uid')::uuid)=0, 'No member directory';
  insert into storage.objects(bucket_id,name) values('site-content','magazines/qa-marketing.pdf');
  insert into storage.objects(bucket_id,name) values('leaflet-assets','qa-marketing.png');
  begin
    insert into storage.objects(bucket_id,name) values('site-content','careers/qa-marketing.png');
    raise exception 'Recruitment asset upload accepted';
  exception when insufficient_privilege then null; end;
  leaflet_id := public.cms_create_pdf_leaflet(jsonb_build_object('name','QA Marketing','pdf_url','https://pmcvhrkykezvtdzkkfpa.supabase.co/storage/v1/object/public/site-content/leaflets/'||gen_random_uuid()||'.pdf','starts_at',current_date,'ends_at',current_date+1,'display_from',current_date,'status','draft'));
  assert leaflet_id is not null, 'Creates leaflet';
  perform public.cms_save_content('leaflet',leaflet_id,'{"name":"QA Marketing editado"}');
  assert (public.cms_get_content('leaflet',leaflet_id)->>'name')='QA Marketing editado', 'Edits leaflet';
  insert into public.site_magazines(title,edition,pdf_url,active) values('QA Marketing','QA','https://example.invalid/qa.pdf',false) returning id into magazine_id;
  update public.site_magazines set title='QA Marketing editado' where id=magazine_id;
  get diagnostics n=row_count; assert n=1, 'Creates and edits magazines';
  assert public.cms_delete_content('magazine',magazine_id), 'Removes magazine';
end $$;
reset role;
update public.cms_members set status='pending' where user_id=current_setting('qa.marketing.uid')::uuid;
set local role authenticated;
do $$ begin
  assert not public.cms_can_edit(), 'Pending Marketing denied';
  begin perform public.cms_save_site_customization('{}','[]'); raise exception 'Pending member saved'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects(bucket_id,name) values('leaflet-assets','qa-pending.png'); raise exception 'Pending upload accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.cms_members set status='approved',role='admin' where user_id=current_setting('qa.marketing.uid')::uuid;
set local role authenticated;
do $$ begin
  assert public.cms_is_admin(), 'Admin unchanged';
  assert public.cms_can_manage_recruitment(), 'Admin recruitment unchanged';
  assert (public.cms_get_site_customization()->'settings') ? 'offers_delivery', 'Admin keeps API settings';
end $$;
reset role;
select 'Marketing permissions passed; rollback required' as result;
