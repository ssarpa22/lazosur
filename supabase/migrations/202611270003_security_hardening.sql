begin;

-- Public contact submissions may populate only the fields owned by the form.
-- Status/source and all administrative/system fields are supplied by defaults.
revoke insert on table public.leads from anon, authenticated;
grant insert (
  name,
  company,
  email,
  phone,
  service,
  budget,
  message,
  consent_at
) on table public.leads to anon, authenticated;

-- Keep the public insert policy narrow and explicit.
drop policy if exists "public can submit contact leads" on public.leads;
create policy "public can submit contact leads"
on public.leads
for insert
to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and internal_notes is null
  and consent_at is not null
);

-- Keep the audit log append-only from application roles. Entries are generated
-- by triggers from real mutations, never accepted as arbitrary client inserts.
drop policy if exists "admins append audit log" on public.admin_audit_log;
revoke insert, update, delete, truncate, references, trigger
on table public.admin_audit_log from anon, authenticated;
grant select on table public.admin_audit_log to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.audit_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  changed_row jsonb;
begin
  if tg_op = 'DELETE' then
    changed_row := to_jsonb(old);
  else
    changed_row := to_jsonb(new);
  end if;

  insert into public.admin_audit_log (
    actor_email,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    coalesce(nullif(auth.jwt() ->> 'email', ''), 'system'),
    lower(tg_op),
    tg_table_name,
    changed_row ->> 'id',
    jsonb_build_object('operation', tg_op)
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Trigger execution does not require callers to have EXECUTE on the function.
revoke all on function public.audit_admin_mutation() from public, anon, authenticated;

drop trigger if exists leads_audit_mutation on public.leads;
create trigger leads_audit_mutation
after insert or update or delete on public.leads
for each row execute function public.audit_admin_mutation();

drop trigger if exists projects_audit_mutation on public.projects;
create trigger projects_audit_mutation
after insert or update or delete on public.projects
for each row execute function public.audit_admin_mutation();

drop trigger if exists services_audit_mutation on public.services;
create trigger services_audit_mutation
after insert or update or delete on public.services
for each row execute function public.audit_admin_mutation();

drop trigger if exists site_settings_audit_mutation on public.site_settings;
create trigger site_settings_audit_mutation
after insert or update or delete on public.site_settings
for each row execute function public.audit_admin_mutation();

-- Indexes used by the first administrative views and public content ordering.
create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);
create index if not exists leads_created_at_idx
  on public.leads (created_at desc);
create index if not exists projects_published_sort_order_idx
  on public.projects (sort_order, created_at desc)
  where published = true;
create index if not exists services_published_sort_order_idx
  on public.services (sort_order, created_at desc)
  where published = true;

-- Slugs are used in public URLs and must remain URL-safe.
alter table public.projects
  drop constraint if exists projects_slug_format_check;
alter table public.projects
  add constraint projects_slug_format_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
alter table public.projects validate constraint projects_slug_format_check;

alter table public.services
  drop constraint if exists services_slug_format_check;
alter table public.services
  add constraint services_slug_format_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$') not valid;
alter table public.services validate constraint services_slug_format_check;

commit;
