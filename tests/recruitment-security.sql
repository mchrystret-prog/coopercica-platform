-- Execute inside BEGIN / ROLLBACK. All fixtures and membership changes are rolled back.
set local plpgsql.check_asserts=on;
select set_config('qa.recruitment.uid',(select user_id::text from public.cms_members where status='approved' and role='admin' limit 1),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('qa.recruitment.uid'),'role','authenticated')::text,true);
insert into public.site_jobs(id,slug,title,department,city,employment_type,work_mode,description,requirements,status,closes_on) values
 ('81000000-0000-4000-8000-000000000001','qa-open','Vaga QA aberta','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.','open',null),
 ('81000000-0000-4000-8000-000000000002','qa-draft','Vaga QA rascunho','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.','draft',null),
 ('81000000-0000-4000-8000-000000000003','qa-closed','Vaga QA encerrada','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.','closed',null),
 ('81000000-0000-4000-8000-000000000004','qa-expired','Vaga QA expirada','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.','open',(now() at time zone 'America/Sao_Paulo')::date-1);
set local role anon;
do $$ begin
 assert (select count(*) from public.site_jobs where slug like 'qa-%')=1,'public vacancy scope';
 begin perform count(*) from public.site_job_applications;raise exception 'anonymous PII access';exception when insufficient_privilege then null;end;
 begin perform public.recruitment_submit_application(gen_random_uuid(),gen_random_uuid(),'x','x','x','x','x','x');raise exception 'anonymous submission RPC';exception when insufficient_privilege then null;end;
 begin perform public.recruitment_charge_limit(repeat('a',64),repeat('b',64));raise exception 'anonymous limiter';exception when insufficient_privilege then null;end;
 assert (select count(*) from storage.objects where bucket_id='job-resumes')=0,'anonymous resumes';
end $$;
reset role;
set local role service_role;
do $$ declare a uuid;begin
 a:=public.recruitment_submit_application('82000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Pessoa QA','qa-recruitment@example.invalid','(11) 90000-0000','Jundiaí','Teste','81000000-0000-4000-8000-000000000001/82000000-0000-4000-8000-000000000001.pdf');
 assert a='82000000-0000-4000-8000-000000000001','service application submit';
 assert public.recruitment_submit_application('82000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000001','Pessoa QA','QA-RECRUITMENT@example.invalid','(11) 90000-0000','Jundiaí','Teste','81000000-0000-4000-8000-000000000001/82000000-0000-4000-8000-000000000002.pdf') is null,'email deduplication';
 begin perform public.recruitment_submit_application('82000000-0000-4000-8000-000000000003','81000000-0000-4000-8000-000000000003','Pessoa QA','qa@example.invalid','(11) 90000-0000','Jundiaí','','81000000-0000-4000-8000-000000000003/82000000-0000-4000-8000-000000000003.pdf');raise exception 'closed accepted';exception when raise_exception then assert sqlerrm='job_closed';end;
 begin perform public.recruitment_submit_application('82000000-0000-4000-8000-000000000004','81000000-0000-4000-8000-000000000004','Pessoa QA','qa@example.invalid','(11) 90000-0000','Jundiaí','','81000000-0000-4000-8000-000000000004/82000000-0000-4000-8000-000000000004.pdf');raise exception 'expired accepted';exception when raise_exception then assert sqlerrm='job_closed';end;
 for n in 1..5 loop perform public.recruitment_charge_limit(repeat('a',64),repeat('b',64));end loop;
 begin perform public.recruitment_charge_limit(repeat('a',64),repeat('b',64));raise exception 'limit absent';exception when raise_exception then assert sqlerrm='rate_limited';end;
end $$;
reset role;
-- Private metadata fixtures simulate the Storage RLS boundary, without physical files.
insert into storage.objects(bucket_id,name) values('job-resumes','81000000-0000-4000-8000-000000000001/82000000-0000-4000-8000-000000000001.pdf');
update public.cms_members set role='hr' where user_id=current_setting('qa.recruitment.uid')::uuid;
set local role authenticated;
do $$ declare n integer;policy_id uuid;begin
 assert public.cms_can_manage_recruitment(),'RH recruitment rights';assert public.cms_can_manage_policies(),'RH document rights';assert not public.cms_can_edit(),'RH must not receive general editing';assert not public.cms_is_admin(),'RH must not be admin';
 assert (select count(*) from public.site_jobs where slug like 'qa-%')=4,'RH reads drafts and closed';
 update public.site_jobs set title='Vaga QA editada' where slug='qa-draft';get diagnostics n=row_count;assert n=1,'RH edits vacancies';
 insert into public.site_jobs(slug,title,department,city,employment_type,work_mode,description,requirements) values('qa-rh-created','Criada pelo RH','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.');
 assert (select count(*) from public.site_job_applications where email='qa-recruitment@example.invalid')=1,'RH reads candidates';
 update public.site_job_applications set status='interview',internal_notes='Anotação privada' where id='82000000-0000-4000-8000-000000000001';get diagnostics n=row_count;assert n=1,'RH reviews candidate';
 assert (select count(*) from storage.objects where bucket_id='job-resumes')=1,'RH reads private resumes';
 begin update public.site_job_applications set email='changed@example.invalid';raise exception 'PII mutation accepted';exception when insufficient_privilege then null;end;
 policy_id:=public.cms_save_policy(null,'Documento QA RH','qa-rh-policy','','https://example.invalid/qa.pdf',0,false);
 assert (select count(*) from public.site_policies where id=policy_id)=1,'RH reads inactive document';
 assert public.cms_delete_policy(policy_id),'RH document removal';
 insert into storage.objects(bucket_id,name) values('site-content','policies/qa-recruitment.pdf');
 begin insert into storage.objects(bucket_id,name) values('site-content','campaigns/qa-recruitment.png');raise exception 'RH general upload accepted';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('leaflet-assets','qa-recruitment.png');raise exception 'RH legacy media grant escaped';exception when insufficient_privilege then null;end;
 begin insert into storage.objects(bucket_id,name) values('job-resumes','qa-upload.pdf');raise exception 'RH private upload accepted';exception when insufficient_privilege then null;end;
 update public.cms_members set role='admin' where user_id=current_setting('qa.recruitment.uid')::uuid;get diagnostics n=row_count;assert n=0,'RH cannot escalate role';
 update public.site_campaigns set title='Must not change';get diagnostics n=row_count;assert n=0,'RH cannot edit campaigns';
 begin update public.digital_leaflets set name='Must not change';get diagnostics n=row_count;assert n=0,'RH cannot edit leaflets';exception when insufficient_privilege then null;end;
 assert (select count(*) from public.site_analytics_events)=0,'RH cannot read analytics';
 begin perform public.cms_site_analytics_report(current_date,current_date);raise exception 'RH report accepted';exception when insufficient_privilege then null;end;
 begin perform public.cms_get_site_customization();raise exception 'RH customization accepted';exception when raise_exception then assert sqlerrm<>'RH customization accepted';end;
end $$;
reset role;
update public.cms_members set status='pending' where user_id=current_setting('qa.recruitment.uid')::uuid;
set local role authenticated;
do $$ begin
 assert not public.cms_can_manage_recruitment(),'unapproved RH';assert not public.cms_can_manage_policies(),'unapproved policies';
 assert (select count(*) from public.site_job_applications)=0,'unapproved candidates';
 assert (select count(*) from storage.objects where bucket_id='job-resumes')=0,'unapproved resumes';
 begin insert into storage.objects(bucket_id,name) values('site-content','policies/qa-pending.pdf');raise exception 'pending RH upload';exception when insufficient_privilege then null;end;
end $$;
reset role;
update public.cms_members set role='editor',status='approved' where user_id=current_setting('qa.recruitment.uid')::uuid;
set local role authenticated;
do $$ declare n integer;begin
 assert public.cms_can_edit(),'editor unchanged';assert public.cms_can_manage_policies(),'editor policies unchanged';assert not public.cms_can_manage_recruitment(),'editor recruiting denied';
 assert (select count(*) from public.site_job_applications)=0,'editor candidates';assert (select count(*) from storage.objects where bucket_id='job-resumes')=0,'editor resumes';
 update public.site_jobs set title='Must not change' where slug='qa-open';get diagnostics n=row_count;assert n=0,'editor vacancy writes';
 begin insert into public.site_jobs(slug,title,department,city,employment_type,work_mode,description,requirements) values('qa-editor','Editor must fail','QA','Jundiaí','clt','onsite','Descrição técnica de teste com mais de vinte letras.','Requisitos técnicos de QA.');raise exception 'editor vacancy insert';exception when insufficient_privilege then null;end;
end $$;
reset role;
update public.cms_members set role='admin' where user_id=current_setting('qa.recruitment.uid')::uuid;
set local role authenticated;
do $$ begin assert public.cms_can_manage_recruitment(),'admin recruiting';assert (select count(*) from public.site_jobs where slug like 'qa-%')=5,'admin vacancies';assert (select count(*) from public.site_job_applications where email='qa-recruitment@example.invalid')=1,'admin applicants';assert (select count(*) from public.cms_members)>0,'admin member directory';end $$;
reset role;
select 'RH/admin/editor/anonymous scopes, applications, deadlines, deduplication, private resumes and rate limits passed' as validation;
