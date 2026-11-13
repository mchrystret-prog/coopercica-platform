grant delete on public.site_job_applications to authenticated;
create policy "Only admins delete applications" on public.site_job_applications
for delete to authenticated using ((select public.cms_is_admin()));
