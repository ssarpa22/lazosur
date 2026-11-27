begin;

-- Contact submissions must go through the server route so that the shared
-- rate limit cannot be bypassed through the Supabase REST API.
revoke all on table public.leads from anon, authenticated, public;
revoke insert (
  name,
  company,
  email,
  phone,
  service,
  budget,
  message,
  consent_at
) on table public.leads from anon, authenticated, public;

drop policy if exists "public can submit contact leads" on public.leads;

commit;
