begin;

create extension if not exists pgtap with schema extensions;

select plan(14);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.leads'::regclass),
  'RLS is enabled for leads'
);
select ok(
  has_column_privilege('anon', 'public.leads', 'name', 'INSERT'),
  'anonymous role can insert the contact name'
);
select ok(
  has_column_privilege('anon', 'public.leads', 'consent_at', 'INSERT'),
  'anonymous role can insert consent timestamp'
);
select ok(
  not has_column_privilege('anon', 'public.leads', 'status', 'INSERT'),
  'anonymous role cannot choose lead status'
);
select ok(
  not has_column_privilege('anon', 'public.leads', 'source', 'INSERT'),
  'anonymous role cannot choose lead source'
);
select ok(
  not has_column_privilege('anon', 'public.leads', 'internal_notes', 'INSERT'),
  'anonymous role cannot set internal notes'
);
select ok(
  not has_table_privilege('anon', 'public.leads', 'SELECT'),
  'anonymous role cannot read leads'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_audit_log', 'INSERT'),
  'authenticated role cannot forge audit entries'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_audit_log', 'UPDATE'),
  'authenticated role cannot edit audit entries'
);
select ok(
  not has_table_privilege('authenticated', 'public.admin_audit_log', 'DELETE'),
  'authenticated role cannot delete audit entries'
);
select is(
  (select count(*)::integer from pg_trigger
   where not tgisinternal
     and tgname in ('leads_audit_mutation', 'projects_audit_mutation',
                    'services_audit_mutation', 'site_settings_audit_mutation')),
  4,
  'all mutable business tables have audit triggers'
);
select is(
  (select count(*)::integer from pg_trigger
   where not tgisinternal
     and tgname in ('leads_set_updated_at', 'projects_set_updated_at',
                    'services_set_updated_at', 'site_settings_set_updated_at')),
  4,
  'all mutable business tables have updated_at triggers'
);

select lives_ok(
  $insert into public.leads
    (name, email, service, message, consent_at)
    values ('Test Contact', 'test@example.com', 'web',
            'This is a valid test contact message.', now())$,
  'lead insert successfully writes an audit entry'
);

select is(
  (select count(*)::integer from public.admin_audit_log
   where entity = 'leads' and action = 'insert'),
  1,
  'lead mutation is recorded in the audit log'
);

select * from finish();
rollback;
