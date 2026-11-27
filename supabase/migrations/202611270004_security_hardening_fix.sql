begin;

-- Supabase projects may grant table privileges to PUBLIC by default.
-- Remove inherited/public access to leads, then grant only the form columns.
revoke all on table public.leads from anon, public;
grant insert (
  name,
  company,
  email,
  phone,
  service,
  budget,
  message,
  consent_at
) on table public.leads to anon;

-- Keep the audit trigger compatible with its restricted search_path.
create or replace function public.audit_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  changed_row jsonb;
  claims jsonb;
begin
  if tg_op = 'DELETE' then
    changed_row := to_jsonb(old);
  else
    changed_row := to_jsonb(new);
  end if;

  claims := auth.jwt();

  insert into public.admin_audit_log (
    actor_email,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    coalesce(nullif(claims ->> 'email', ''), 'system'),
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

revoke all on function public.audit_admin_mutation() from public, anon, authenticated;

commit;
