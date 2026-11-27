import {requireAdmin} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
import {AdminLeads} from "@/components/admin-leads";

export const metadata = {
  title: "Panel administrativo",
  robots: {index: false, follow: false},
};

export default async function Admin() {
  const user = await requireAdmin();
  const db = await createClient();
  const [projects, services] = await Promise.all([
    db.from("projects").select("id", {count: "exact", head: true}).eq("published", true),
    db.from("services").select("id", {count: "exact", head: true}).eq("published", true),
  ]);

  return (
    <section className="admin container">
      <span className="eyebrow">LAZO SUR / ADMIN</span>
      <h1>Panel general</h1>
      <p>Sesión: {user.email}</p>
      <div className="admin-stats">
        <article><small>Proyectos publicados</small><strong>{projects.count ?? 0}</strong></article>
        <article><small>Servicios publicados</small><strong>{services.count ?? 0}</strong></article>
        <article><small>Gestión comercial</small><strong>Activa</strong></article>
      </div>
      <div className="admin-panel">
        <h2>Consultas comerciales</h2>
        <p>Revisá los mensajes recibidos, buscá oportunidades y mantené actualizado su estado.</p>
        <AdminLeads />
      </div>
    </section>
  );
}
