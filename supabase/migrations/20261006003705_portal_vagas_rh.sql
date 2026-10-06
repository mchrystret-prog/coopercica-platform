-- RH is a separate CMS role; cms_can_edit remains restricted to admin/editor.
alter table public.cms_members drop constraint cms_members_role_check;
alter table public.cms_members add constraint cms_members_role_check check(role in ('admin','editor','hr'));
create function public.cms_has_hr_role() returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.cms_members where user_id=(select auth.uid()) and role='hr');
$$;
create function public.cms_can_manage_recruitment() returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.cms_members where user_id=(select auth.uid()) and status='approved' and role in ('admin','hr'));
$$;
create function public.cms_can_manage_policies() returns boolean language sql stable security invoker set search_path='' as $$
 select public.cms_can_edit() or exists(select 1 from public.cms_members where user_id=(select auth.uid()) and status='approved' and role='hr');
$$;
revoke all on function public.cms_has_hr_role(),public.cms_can_manage_recruitment(),public.cms_can_manage_policies() from public,anon;
grant execute on function public.cms_has_hr_role(),public.cms_can_manage_recruitment(),public.cms_can_manage_policies() to authenticated;

create policy "CMS admins read member directory" on public.cms_members for select to authenticated using((select public.cms_is_admin()));

-- Extend only the policies/documents scope to approved RH members.
alter policy "CMS can read policies" on public.site_policies using(active=true or (select public.cms_can_manage_policies()));
create or replace function public.cms_save_policy(p_id uuid,p_title text,p_slug text,p_description text,p_file_url text,p_sort_order integer,p_active boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if not public.cms_can_manage_policies() then raise exception 'Acesso CMS não aprovado' using errcode='42501'; end if;
 if p_id is null then
  insert into public.site_policies(title,slug,description,file_url,sort_order,active) values(p_title,p_slug,nullif(p_description,''),p_file_url,coalesce(p_sort_order,0),coalesce(p_active,true)) returning id into v_id;
 else
  update public.site_policies set title=p_title,slug=p_slug,description=nullif(p_description,''),file_url=p_file_url,sort_order=coalesce(p_sort_order,0),active=coalesce(p_active,true),updated_at=now() where id=p_id returning id into v_id;
 end if;
 if v_id is null then raise exception 'Política não encontrada'; end if;
 return v_id;
end $$;
create or replace function public.cms_delete_policy(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public.cms_can_manage_policies() then raise exception 'Acesso CMS não aprovado' using errcode='42501'; end if;
 delete from public.site_policies where id=p_id; return found;
end $$;
revoke all on function public.cms_save_policy(uuid,text,text,text,text,integer,boolean),public.cms_delete_policy(uuid) from public,anon;
grant execute on function public.cms_save_policy(uuid,text,text,text,text,integer,boolean),public.cms_delete_policy(uuid) to authenticated;
create policy "RH uploads policy PDFs" on storage.objects for insert to authenticated
 with check(bucket_id='site-content' and (storage.foldername(name))[1]='policies' and name~'\.pdf$' and (select public.cms_can_manage_policies()));
-- Restrictive policies also block legacy authenticated-wide media grants for RH.
create policy "RH media insert scope" on storage.objects as restrictive for insert to authenticated
 with check(not (select public.cms_has_hr_role()) or (bucket_id='site-content' and (storage.foldername(name))[1]='policies' and name~'\.pdf$' and (select public.cms_can_manage_policies())));
create policy "RH media update scope" on storage.objects as restrictive for update to authenticated
 using(not (select public.cms_has_hr_role())) with check(not (select public.cms_has_hr_role()));
create policy "RH media delete scope" on storage.objects as restrictive for delete to authenticated
 using(not (select public.cms_has_hr_role()));

create table public.site_jobs (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug~'^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=160),
 title text not null check(length(trim(title)) between 3 and 140),
 department text not null check(length(trim(department)) between 2 and 80),
 city text not null check(length(trim(city)) between 2 and 100),
 unit text not null default '' check(length(unit)<=120),
 employment_type text not null check(employment_type in ('clt','temporary','apprentice','internship')),
 work_mode text not null check(work_mode in ('onsite','hybrid','remote')),
 openings integer not null default 1 check(openings between 1 and 999),
 salary text not null default '' check(length(salary)<=120),
 description text not null check(length(trim(description)) between 20 and 12000),
 responsibilities text not null default '' check(length(responsibilities)<=12000),
 requirements text not null check(length(trim(requirements)) between 10 and 12000),
 benefits text not null default '' check(length(benefits)<=12000),
 status text not null default 'draft' check(status in ('draft','open','closed')),
 closes_on date,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index site_jobs_public_idx on public.site_jobs(status,department,created_at desc);
alter table public.site_jobs enable row level security;
revoke all on public.site_jobs from public,anon,authenticated;
grant select on public.site_jobs to anon,authenticated;
grant insert,update on public.site_jobs to authenticated;
grant all on public.site_jobs to service_role;
create policy "Visitors read open vacancies" on public.site_jobs for select to anon,authenticated
 using(status='open' and (closes_on is null or closes_on>=(now() at time zone 'America/Sao_Paulo')::date));
create policy "RH and admin read vacancies" on public.site_jobs for select to authenticated using((select public.cms_can_manage_recruitment()));
create policy "RH and admin create vacancies" on public.site_jobs for insert to authenticated with check((select public.cms_can_manage_recruitment()));
create policy "RH and admin edit vacancies" on public.site_jobs for update to authenticated using((select public.cms_can_manage_recruitment())) with check((select public.cms_can_manage_recruitment()));

create table public.site_job_applications (
 id uuid primary key,job_id uuid not null references public.site_jobs(id),
 name text not null check(length(trim(name)) between 2 and 120),
 email text not null check(length(email)<=254 and email=lower(trim(email)) and email~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text not null check(phone~'^[0-9+ ()-]{8,24}$'),city text not null check(length(trim(city)) between 2 and 100),
 message text not null default '' check(length(message)<=4000),
 resume_path text not null unique check(resume_path~'^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'),
 consent_at timestamptz not null default now(),consent_version text not null default 'recruitment-v1',
 status text not null default 'received' check(status in ('received','review','interview','hired','rejected')),
 internal_notes text not null default '' check(length(internal_notes)<=12000),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(job_id,email)
);
create index site_job_applications_job_idx on public.site_job_applications(job_id,status,created_at desc);
alter table public.site_job_applications enable row level security;
revoke all on public.site_job_applications from public,anon,authenticated;
grant select on public.site_job_applications to authenticated;
grant update(status,internal_notes) on public.site_job_applications to authenticated;
grant all on public.site_job_applications to service_role;
create policy "RH and admin read applications" on public.site_job_applications for select to authenticated using((select public.cms_can_manage_recruitment()));
create policy "RH and admin review applications" on public.site_job_applications for update to authenticated using((select public.cms_can_manage_recruitment())) with check((select public.cms_can_manage_recruitment()));
create schema recruitment_private;
revoke all on schema recruitment_private from public,anon,authenticated;
grant usage on schema recruitment_private to service_role;
create function recruitment_private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at:=now();return new;end $$;
revoke all on function recruitment_private.touch_updated_at() from public,anon,authenticated;
create trigger site_jobs_updated before update on public.site_jobs for each row execute function recruitment_private.touch_updated_at();
create trigger site_job_applications_updated before update on public.site_job_applications for each row execute function recruitment_private.touch_updated_at();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('job-resumes','job-resumes',false,5242880,array['application/pdf']);
create policy "RH and admin read resumes" on storage.objects for select to authenticated using(bucket_id='job-resumes' and (select public.cms_can_manage_recruitment()));

create table recruitment_private.rate_limits(key text not null,bucket date not null,used integer not null,primary key(key,bucket));
alter table recruitment_private.rate_limits enable row level security;
revoke all on recruitment_private.rate_limits from public,anon,authenticated;
grant all on recruitment_private.rate_limits to service_role;
create policy "Collector maintains recruitment limits" on recruitment_private.rate_limits for all to service_role using(true) with check(true);
create function public.recruitment_charge_limit(p_ip_key text,p_email_key text) returns void language plpgsql security invoker set search_path='' as $$
declare k text;n integer;
begin
 if p_ip_key!~'^[a-f0-9]{64}$' or p_email_key!~'^[a-f0-9]{64}$' or p_ip_key is null or p_email_key is null then raise exception 'invalid_limit_key';end if;
 foreach k in array array['ip:'||p_ip_key,'email:'||p_email_key] loop
  n:=null;
  insert into recruitment_private.rate_limits as r values(k,current_date,1) on conflict(key,bucket) do update set used=r.used+1 where r.used<case when k like 'ip:%' then 30 else 5 end returning used into n;
  if n is null then raise exception 'rate_limited';end if;
 end loop;
 delete from recruitment_private.rate_limits where bucket<current_date-2;
end $$;
create function public.recruitment_submit_application(p_id uuid,p_job_id uuid,p_name text,p_email text,p_phone text,p_city text,p_message text,p_resume_path text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare v_id uuid;
begin
 perform id from public.site_jobs where id=p_job_id and status='open' and (closes_on is null or closes_on>=(now() at time zone 'America/Sao_Paulo')::date) for share;
 if not found then raise exception 'job_closed';end if;
 if p_resume_path<>p_job_id::text||'/'||p_id::text||'.pdf' then raise exception 'invalid_resume_path';end if;
 insert into public.site_job_applications(id,job_id,name,email,phone,city,message,resume_path) values(p_id,p_job_id,p_name,lower(trim(p_email)),p_phone,p_city,p_message,p_resume_path) on conflict(job_id,email) do nothing returning id into v_id;
 return v_id;
end $$;
revoke all on function public.recruitment_charge_limit(text,text),public.recruitment_submit_application(uuid,uuid,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.recruitment_charge_limit(text,text),public.recruitment_submit_application(uuid,uuid,text,text,text,text,text,text) to service_role;
