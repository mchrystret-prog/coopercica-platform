-- RLS already limits directory reads to self/admin and role changes to admin.
-- Explicit grants are required for the invoker helpers and CMS member management.
revoke truncate,references,trigger on public.cms_members from anon,authenticated;
grant select on public.cms_members to authenticated;
grant update(role,status,approved_at) on public.cms_members to authenticated;
