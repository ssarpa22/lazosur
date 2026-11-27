-- Trusted administrator claim is assigned only by a project owner through Supabase Auth.
-- The application also checks the server-only ADMIN_EMAILS allowlist.
create policy "public can submit contact leads" on public.leads
for insert to anon, authenticated
with check (
  status = 'new'
  and source = 'website'
  and internal_notes is null
  and consent_at is not null
);

create policy "admins manage leads" on public.leads
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage projects" on public.projects
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage services" on public.services
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins manage site settings" on public.site_settings
for all to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins read audit log" on public.admin_audit_log
for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins append audit log" on public.admin_audit_log
for insert to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant insert on public.leads to anon, authenticated;
grant select, insert, update, delete on public.leads, public.projects, public.services, public.site_settings to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
