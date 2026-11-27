import { createPageMetadata } from "@/lib/site";
import Link from "next/link";
import JsonLd from "@/components/json-ld";

export const metadata = createPageMetadata({ title: "Posicionamiento SEO", description: "Estrategia SEO, auditorías, optimización técnica y de contenidos para mejorar la visibilidad orgánica de tu sitio web.", path: "/servicios/seo" });

const capabilities = [
  ["Auditoría y diagnóstico", "Revisamos el estado del sitio, detectamos oportunidades y ordenamos los problemas según su impacto y prioridad."],
  ["SEO técnico", "Trabajamos aspectos como rastreo, indexación, estructura, rendimiento y experiencia móvil."],
  ["SEO on-page", "Optimizamos títulos, encabezados, contenido y enlaces internos para que cada página sea clara y relevante."],
  ["Contenido y SEO local", "Organizamos contenidos útiles y mejoramos la información local cuando la ubicación forma parte de tu negocio."],
];

const process = [
  ["01", "Analizar", "Conocemos el sitio, el negocio, sus servicios y las búsquedas relevantes para sus objetivos."],
  ["02", "Priorizar", "Definimos qué conviene resolver primero y armamos una hoja de ruta realista."],
  ["03", "Optimizar", "Aplicamos mejoras técnicas y de contenido de acuerdo con las prioridades acordadas."],
  ["04", "Evaluar", "Revisamos la evolución y usamos lo aprendido para decidir los próximos ajustes."],
];

export default function SeoService() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Posicionamiento SEO",
        serviceType: "Posicionamiento SEO",
        description: "Estrategia SEO, auditorías, optimización técnica y de contenidos para mejorar la visibilidad orgánica de tu sitio web.",
        url: new URL("/servicios/seo", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").toString(),
        provider: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/#organization` },
      }} />
      <section className="service-detail-hero service-detail-hero--seo">
        <div className="container">
          <Link className="service-back-link" href="/servicios">← Todos los servicios</Link>
          <span className="eyebrow">02 / POSICIONAMIENTO SEO</span>
          <h1>Que te encuentren<br /><em>por lo que hacés.</em></h1>
          <p>Trabajamos la estructura, los contenidos y la salud técnica de tu sitio para ayudar a que los buscadores comprendan tu propuesta y las personas adecuadas puedan descubrirla.</p>
          <Link className="btn service-detail-button" href="/contacto?servicio=seo">Hablemos de SEO <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="service-detail-intro section">
        <div className="container service-detail-two-col">
          <div><span className="eyebrow">VISIBILIDAD CON FUNDAMENTO</span><h2>Menos atajos.<br /><em>Más estrategia.</em></h2></div>
          <div><p>El posicionamiento orgánico no se resuelve con una fórmula universal ni con promesas de resultados inmediatos. Requiere entender qué ofrece tu negocio, cómo lo buscan las personas y qué necesita mejorar tu sitio.</p><p>Por eso empezamos por un diagnóstico y priorizamos acciones concretas. La estrategia combina aspectos técnicos, contenido útil y una estructura que facilite la navegación.</p></div>
        </div>
      </section>
      <section className="service-capabilities section">
        <div className="container">
          <div className="service-section-heading"><span className="eyebrow">QUÉ PODEMOS TRABAJAR</span><h2>Una base sólida<br /><em>para crecer.</em></h2></div>
          <div className="service-capability-grid">
            {capabilities.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>
      <section className="service-process section">
        <div className="container service-detail-two-col">
          <div><span className="eyebrow">CÓMO TRABAJAMOS</span><h2>Mejoras con<br /><em>un rumbo claro.</em></h2><p>Las decisiones se toman según el contexto y las prioridades de tu proyecto, no por acumular tareas.</p></div>
          <div className="service-process-list">{process.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
        </div>
      </section>
      <section className="service-detail-cta"><div className="container"><span className="eyebrow">EMPECEMOS POR ENTENDER TU SITIO</span><h2>La visibilidad se<br /><em>construye paso a paso.</em></h2><Link className="btn" href="/contacto?servicio=seo">Consultar por SEO <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
