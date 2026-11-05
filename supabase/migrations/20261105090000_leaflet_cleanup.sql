
-- Política segura: apenas imagens de produtos referenciadas por folhetos
-- expirados há mais de sete dias. Nunca remover selos, fundos, capas,
-- arquivos sem vínculo ou imagens compartilhadas com outro folheto.
create table if not exists public.leaflet_cleanup_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  mode text not null check (mode in ('dry_run', 'delete')),
  candidates integer not null default 0,
  deleted integer not null default 0,
  bytes_reclaimed bigint not null default 0,
  errors integer not null default 0,
  details jsonb not null default '{}'::jsonb
);
alter table public.leaflet_cleanup_runs enable row level security;
revoke all on public.leaflet_cleanup_runs from anon, authenticated;
grant select on public.leaflet_cleanup_runs to authenticated;
grant insert, select on public.leaflet_cleanup_runs to service_role;
grant usage, select on sequence public.leaflet_cleanup_runs_id_seq to service_role;
create policy "CMS may see leaflet cleanup audit" on public.leaflet_cleanup_runs
  for select to authenticated using ((select public.cms_can_edit()));

create or replace function public.leaflet_cleanup_candidates()
returns table(path text, size_bytes bigint)
language sql stable security definer
set search_path = ''
as $$
  with expired as (
    select l.id from public.digital_leaflets l
    where l.ends_at < ((now() at time zone 'America/Sao_Paulo')::date - 7)
  ), linked as (
    select distinct substring(p.image_url from '/storage/v1/object/public/leaflet-assets/(products/[^?#]+)') as path
    from public.digital_leaflet_products p
    join expired e on e.id = p.leaflet_id
    where p.image_url like '%/storage/v1/object/public/leaflet-assets/products/%'
  )
  select o.name::text, coalesce((o.metadata->>'size')::bigint, 0)::bigint
  from storage.objects o
  join linked l on l.path = o.name
  where o.bucket_id = 'leaflet-assets'
    and o.name like 'products/%'
    -- Não excluir imagem associada a rascunho, edição ativa ou em carência.
    and not exists (
      select 1 from public.digital_leaflet_products p
      join public.digital_leaflets f on f.id = p.leaflet_id
      where p.image_url like '%/storage/v1/object/public/leaflet-assets/' || o.name
        and (
          f.status = 'draft'
          or f.ends_at >= ((now() at time zone 'America/Sao_Paulo')::date - 7)
        )
    )
    -- Referências cruzadas no CMS e metadados permanecem protegidas.
    and not exists (
      select 1 from public.site_settings ss where ss.value::text like '%' || o.name || '%'
    )
    and not exists (
      select 1 from public.digital_leaflets f
      where coalesce(f.cover_url,'') like '%' || o.name || '%'
         or coalesce(f.header_url,'') like '%' || o.name || '%'
         or coalesce(f.pdf_url,'') like '%' || o.name || '%'
    )
  order by o.name;
$$;
revoke all on function public.leaflet_cleanup_candidates() from public, anon, authenticated;
grant execute on function public.leaflet_cleanup_candidates() to service_role;

create or replace function public.leaflet_cleanup_mark_deleted(p_path text)
returns integer language plpgsql security definer set search_path = ''
as $$
declare affected integer := 0;
begin
  if p_path is null or p_path not like 'products/%' then raise exception 'Invalid path'; end if;
  -- Nunca apagar referência antes de confirmar ausência do objeto.
  if exists (select 1 from storage.objects where bucket_id='leaflet-assets' and name=p_path) then
    raise exception 'Object still exists; nothing to mark';
  end if;
  update public.digital_leaflet_products p set image_url = null
  from public.digital_leaflets l
  where p.leaflet_id = l.id
    and l.ends_at < ((now() at time zone 'America/Sao_Paulo')::date - 7)
    and l.status <> 'draft'
    and p.image_url like '%/storage/v1/object/public/leaflet-assets/' || p_path;
  get diagnostics affected = row_count;
  return affected;
end $$;
revoke all on function public.leaflet_cleanup_mark_deleted(text) from public, anon, authenticated;
grant execute on function public.leaflet_cleanup_mark_deleted(text) to service_role;

-- Credencial de cron fica criptografada no Vault, nunca no código público.
select vault.create_secret(
  encode(gen_random_bytes(32), 'hex'),
  'leaflet_cleanup_cron_token',
  'Token de autorização para limpeza automática dos folhetos'
)
where not exists (select 1 from vault.secrets where name='leaflet_cleanup_cron_token');

create or replace function public.leaflet_cleanup_verify_cron_token(p_token text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_token is not null and length(p_token) >= 32 and exists(
    select 1 from vault.decrypted_secrets s
    where s.name='leaflet_cleanup_cron_token' and s.decrypted_secret=p_token
  );
$$;
revoke all on function public.leaflet_cleanup_verify_cron_token(text) from public, anon, authenticated;
grant execute on function public.leaflet_cleanup_verify_cron_token(text) to service_role;
