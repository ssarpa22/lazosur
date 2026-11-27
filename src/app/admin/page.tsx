import {requireAdmin} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
import {AdminLeads} from "@/components/admin-leads";
import {AdminContent} from "@/components/admin-content";

export const metadata = {
  title: "Panel administrativo",
  robots: {index: false, follow: false},
};

export default async function Admin() {
  const user = await requireAdmin();
  const db = await createClient();
  const [leads, projects, services] = await Promise.all([
    db.from("leads").select("id", {count: "exact", head: true}),
    db.from("projects").select("id", {count: "exact", head: true}).eq("published", true),
    db.from("services").select("id", {count: "exact", head: true}).eq("published", true),
  ]);

  return (
    <section className="admin container">
      <span className="eyebrow">LAZO SUR / ADMIN</span>
      <h1>Panel general</h1>
      <p>Sesión: {user.email}</p>
      <div className="admin-stats">
        <article><small>Consultas recibidas</small><strong>{leads.count ?? 0}</strong></article>
        <article><small>Proyectos publicados</small><strong>{projects.count ?? 0}</strong></article>
        <article><small>Servicios publicados</small><strong>{services.count ?? 0}</strong></article>
      </div>
      <div className="admin-panel">
        <h2>Consultas comerciales</h2>
        <p>Revisá los mensajes recibidos, buscá oportunidades y mantené actualizado su estado.</p>
        <AdminLeads />
      </div>
      <div className="admin-panel">
        <h2>Contenido del sitio</h2>
        <p>Administrá los proyectos del portfolio y los servicios que aparecen en el sitio público.</p>
        <AdminContent />
      </div>
    </section>
  );
}
