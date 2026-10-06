-- Additive change: existing spreadsheet leaflets, CMS membership and Hub access are preserved.
alter table public.digital_leaflets add column if not exists pdf_url text;

create or replace function public.cms_set_publication_pdf(p_kind text, p_id uuid, p_url text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.cms_can_edit() then raise exception 'Acesso CMS não aprovado' using errcode = '42501'; end if;
  if p_url is null or p_url !~ '^https://pmcvhrkykezvtdzkkfpa[.]supabase[.]co/storage/v1/object/public/site-content/(leaflets|magazines)/[a-f0-9-]{36}[.]pdf$' then raise exception 'PDF inválido'; end if;
  if p_kind = 'leaflet' then
    update public.digital_leaflets set pdf_url = p_url, updated_at = now() where id = p_id;
  elsif p_kind = 'magazine' then
    update public.site_magazines set pdf_url = p_url where id = p_id;
  else raise exception 'Tipo inválido';
  end if;
  if not found then raise exception 'Publicação não encontrada'; end if;
end;
$$;
revoke all on function public.cms_set_publication_pdf(text, uuid, text) from public, anon;
grant execute on function public.cms_set_publication_pdf(text, uuid, text) to authenticated;

create or replace function public.cms_create_pdf_leaflet(p_data jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid := gen_random_uuid();
  name_value text := btrim(p_data->>'name');
  pdf_value text := p_data->>'pdf_url';
  start_value date := (p_data->>'starts_at')::date;
  end_value date := (p_data->>'ends_at')::date;
  display_value date := (p_data->>'display_from')::date;
  status_value text := p_data->>'status';
begin
  if auth.uid() is null or not public.cms_can_edit() then raise exception 'Acesso CMS não aprovado' using errcode = '42501'; end if;
  if name_value is null or length(name_value) not between 1 and 160 then raise exception 'Informe o nome'; end if;
  if pdf_value is null or pdf_value !~ '^https://pmcvhrkykezvtdzkkfpa[.]supabase[.]co/storage/v1/object/public/site-content/leaflets/[a-f0-9-]{36}[.]pdf$' then raise exception 'PDF inválido'; end if;
  if start_value is null or end_value is null or display_value is null or start_value > end_value or display_value > end_value then raise exception 'Período inválido'; end if;
  if status_value is null or status_value not in ('draft', 'published') then raise exception 'Status inválido'; end if;
  insert into public.digital_leaflets(id, name, slug, starts_at, ends_at, display_from, status, pdf_url)
  values (new_id, name_value, 'folheto-' || new_id::text, start_value, end_value, display_value, status_value, pdf_value);
  return new_id;
end;
$$;
revoke all on function public.cms_create_pdf_leaflet(jsonb) from public, anon;
grant execute on function public.cms_create_pdf_leaflet(jsonb) to authenticated;
