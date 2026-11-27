import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Proyectos",
  description: "Proyectos digitales propios de Lazo Sur.",
  path: "/portfolio",
});

type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  external_url: string | null;
  sort_order: number;
};

const fallbackProjects: Project[] = [
  {
    id: "metricasur",
    name: "MétricaSur",
    slug: "metricasur",
    description: "Software orientado a la gestión y analítica empresarial.",
    category: "Proyecto propio",
    external_url: "https://metricasur.vercel.app",
    sort_order: 1,
  },
  {
    id: "radioeterna",
    name: "RadioEterna",
    slug: "radioeterna",
    description: "Proyecto digital propio de Lazo Sur.",
    category: "Proyecto propio",
    external_url: "https://radioeterna.vercel.app",
    sort_order: 2,
  },
];

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function getProjects(): Promise<Project[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,slug,description,category,external_url,sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Project[];
  } catch {
    // Keep the public portfolio available during initial setup or a temporary database outage.
    return fallbackProjects;
  }
}

export default async function Portfolio() {
  const projects = await getProjects();

  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">EXPLORACIONES PROPIAS</span>
        <h1>Ideas que se<br /><em>convierten en proyectos.</em></h1>
        <p>Estos proyectos nacen de nuestras propias ideas; no son trabajos atribuidos a clientes externos.</p>
        {projects.length > 0 ? (
          <div className="cards projects">
            {projects.map((project) => {
              const externalUrl = safeExternalUrl(project.external_url);
              const visualClass = project.slug === "metricasur" ? "metric" : project.slug === "radioeterna" ? "radio" : "";
              const initial = project.name.trim().charAt(0).toUpperCase() || "L";

              return (
                <article key={project.id}>
                  <div className={`project-art ${visualClass}`} aria-hidden="true">
                    {project.slug === "metricasur" ? <>Métrica<span>Sur</span></> : project.slug === "radioeterna" ? <>R<span>E</span></> : initial}
                  </div>
                  <small>{project.category}</small>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  {externalUrl && (
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                      Visitar proyecto <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p role="status">Estamos preparando nuevos proyectos para compartir.</p>
        )}
        <div className="portfolio-cta">
          <p>¿Tenés una idea que te gustaría convertir en un proyecto?</p>
          <Link className="btn" href="/contacto">Hablemos de tu proyecto <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
