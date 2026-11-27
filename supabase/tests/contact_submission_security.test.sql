-- Run with: npx supabase test db

create extension if not exists pgtap with schema extensions;

begin;

select plan(4);

select ok(
  not has_table_privilege('anon', 'public.leads', 'INSERT'),
  'anonymous visitors cannot insert leads directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.leads', 'INSERT'),
  'authenticated users cannot bypass the contact endpoint'
);

select ok(
  not has_column_privilege('anon', 'public.leads', 'email', 'INSERT'),
  'anonymous visitors have no column-level insert grant'
);

select ok(
  not has_column_privilege('authenticated', 'public.leads', 'email', 'INSERT'),
  'authenticated users have no column-level insert grant'
);

select * from finish();

rollback;
