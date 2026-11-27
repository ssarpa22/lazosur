import { createPageMetadata } from "@/lib/site";
import Link from "next/link";

export const metadata = createPageMetadata({ title: "Servicios", description: "Diseño y desarrollo web y posicionamiento SEO para negocios y profesionales.", path: "/servicios" });

const services = [
  {
    number: "01",
    eyebrow: "PRESENCIA DIGITAL",
    title: "Diseño y desarrollo web",
    description: "Un sitio claro, sólido y adaptable que explique lo que hacés y ayude a tus visitantes a dar el siguiente paso.",
    points: ["Sitios institucionales y comerciales", "Landing pages", "Rediseño de sitios existentes", "Desarrollos web a medida"],
    href: "/servicios/diseno-web",
    action: "Conocer desarrollo web",
  },
  {
    number: "02",
    eyebrow: "VISIBILIDAD ORGÁNICA",
    title: "Posicionamiento SEO",
    description: "Mejoramos la estructura, el contenido y los aspectos técnicos para facilitar que las personas encuentren tu negocio.",
    points: ["Auditoría y diagnóstico", "SEO técnico y rendimiento", "Optimización de páginas", "Estrategia de contenidos y SEO local"],
    href: "/servicios/seo",
    action: "Conocer SEO",
  },
];

export default function Services() {
  return (
    <>
      <section className="service-overview-hero">
        <div className="container">
          <span className="eyebrow">SERVICIOS · LAZO SUR</span>
          <h1>Lo que necesitás<br /><em>para avanzar.</em></h1>
          <p>Diseño, desarrollo y posicionamiento con una misma idea: que cada decisión digital tenga un propósito claro para tu negocio.</p>
        </div>
      </section>
      <section className="service-overview section">
        <div className="container">
          <div className="service-overview-intro">
            <span className="eyebrow">DOS ÁREAS, UN MISMO OBJETIVO</span>
            <p>No trabajamos con soluciones enlatadas. Primero entendemos el contexto; después definimos qué tiene sentido construir o mejorar.</p>
          </div>
          <div className="service-overview-grid">
            {services.map((service) => (
              <article className="service-overview-card" key={service.number}>
                <div className="service-overview-meta"><span>{service.number} / {service.eyebrow}</span><span aria-hidden="true">↗</span></div>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <ul>{service.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <Link href={service.href}>{service.action} <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="service-overview-cta">
        <div className="container service-overview-cta-inner">
          <div><span className="eyebrow">¿NO SABÉS POR DÓNDE EMPEZAR?</span><h2>Lo pensamos<br /><em>en conjunto.</em></h2></div>
          <Link className="btn" href="/contacto">Contanos tu idea <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </>
  );
}
