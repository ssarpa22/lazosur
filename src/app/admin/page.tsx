import {requireAdmin} from "@/lib/auth";
import {getDb, getRows} from "@/lib/db";
import {AdminLeads} from "@/components/admin-leads";
import {AdminContent} from "@/components/admin-content";

export const metadata = {
  title: "Panel administrativo",
  robots: {index: false, follow: false},
};

export default async function Admin() {
  const user = await requireAdmin();
  let leadCount = 0;
  let projectCount = 0;
  let serviceCount = 0;

  try {
    const db = getDb();
    const [leads, projects, services] = await Promise.all([
      db`SELECT count(*)::int AS count FROM public.leads`,
      db`SELECT count(*)::int AS count FROM public.projects WHERE published = true`,
      db`SELECT count(*)::int AS count FROM public.services WHERE published = true`,
    ]);
    leadCount = Number(getRows<{count: number}>(leads)[0]?.count ?? 0);
    projectCount = Number(getRows<{count: number}>(projects)[0]?.count ?? 0);
    serviceCount = Number(getRows<{count: number}>(services)[0]?.count ?? 0);
  } catch {
    // Keep the admin shell available if the database is temporarily unavailable.
  }

  return (
    <section className="admin container">
      <span className="eyebrow">LAZO SUR / ADMIN</span>
      <h1>Panel general</h1>
      <p>Sesión: {user.email}</p>
      <div className="admin-stats">
        <article><small>Consultas recibidas</small><strong>{leadCount}</strong></article>
        <article><small>Proyectos publicados</small><strong>{projectCount}</strong></article>
        <article><small>Servicios publicados</small><strong>{serviceCount}</strong></article>
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
