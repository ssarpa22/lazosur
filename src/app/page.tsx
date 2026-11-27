import Link from "next/link";

const services = [
  { number: "01", tag: "PRESENCIA DIGITAL", title: "Diseño y desarrollo web", copy: "Sitios web pensados para comunicar mejor, generar confianza y convertir visitas en oportunidades.", href: "/servicios/diseno-web", action: "Explorar desarrollo web", mark: "↗" },
  { number: "02", tag: "CRECIMIENTO ORGÁNICO", title: "Posicionamiento SEO", copy: "Una base técnica sólida y contenido estratégico para que tu negocio pueda ser encontrado.", href: "/servicios/seo", action: "Explorar SEO", mark: "⌕" },
];

const steps = [
  ["01", "Escuchamos", "Entendemos tu negocio, tus objetivos y a las personas a las que querés llegar."],
  ["02", "Damos dirección", "Ordenamos las ideas y definimos un plan de trabajo con prioridades claras."],
  ["03", "Hacemos realidad", "Diseñamos, desarrollamos y probamos cada parte del proyecto."],
  ["04", "Seguimos creciendo", "Medimos, aprendemos y mejoramos lo que construimos."],
];

const projects = [
  {
    number: "01 / 02",
    category: "PROYECTO PROPIO · SOFTWARE",
    name: "MétricaSur",
    href: "https://metricasur.vercel.app",
    description: "Una plataforma de gestión pensada para emprendedores y pequeñas empresas. Permite organizar el trabajo en espacios independientes y centralizar clientes y operaciones en un mismo lugar.",
    focus: "Gestión de negocios · Espacios de trabajo · Organización operativa",
  },
  {
    number: "02 / 02",
    category: "PROYECTO PROPIO · PLATAFORMA DIGITAL",
    name: "RadioEterna",
    href: "https://radioeterna.vercel.app",
    description: "Un directorio internacional de radios cristianas y evangélicas. Reúne emisoras, sus fichas informativas y enlaces de transmisión para que cada persona pueda descubrirlas y escucharlas en vivo.",
    focus: "Directorio de emisoras · Reproducción en vivo · Descubrimiento",
  },
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid home-hero-grid--single">
          <div className="home-hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> ESTUDIO DIGITAL INDEPENDIENTE · ARGENTINA</span>
            <h1>Ideas claras.<br />Experiencias que<br /><em>mueven negocios.</em></h1>
            <p className="home-lead">Diseñamos y desarrollamos experiencias digitales para marcas que quieren dar su próximo paso con intención.</p>
            <div className="home-actions">
              <Link className="btn home-primary" href="/contacto">Hablemos de tu proyecto <span aria-hidden="true">↗</span></Link>
              <Link className="home-text-link" href="/servicios">Conocé qué hacemos <span aria-hidden="true">→</span></Link>
            </div>
            <div className="home-note"><span className="home-note-line" /> ESTRATEGIA <i>·</i> DISEÑO <i>·</i> DESARROLLO <i>·</i> SEO</div>
          </div>
        </div>
        <div className="container hero-bottom"><span>01 / UNA IDEA, MUCHAS POSIBILIDADES</span><span>DESLIZÁ PARA DESCUBRIR <b>↓</b></span></div>
      </section>

      <section className="home-intro section">
        <div className="container intro-grid">
          <div><span className="eyebrow">01 — NUESTRA MIRADA</span><h2>Lo digital no es el destino.<br /><em>Es lo que te lleva.</em></h2></div>
          <div className="intro-copy"><p>Una buena presencia digital hace mucho más que verse bien. Explica lo que hacés, transmite confianza y ayuda a que las personas den el siguiente paso.</p><p>En Lazo Sur combinamos estrategia, diseño y tecnología para construir herramientas digitales con propósito.</p><Link className="inline-link" href="/contacto">Conversemos sobre tu idea <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="home-services section">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">02 — QUÉ HACEMOS</span><h2>Herramientas para<br /><em>avanzar.</em></h2></div><p>Soluciones digitales a medida, con objetivos concretos y decisiones pensadas para tu negocio.</p></div>
          <div className="service-grid">{services.map((service) => <article className="service-card" key={service.number}><div className="service-card-top"><span>{service.number} / {service.tag}</span><b aria-hidden="true">{service.mark}</b></div><h3>{service.title}</h3><p>{service.copy}</p><Link href={service.href}>{service.action} <span aria-hidden="true">↗</span></Link></article>)}</div>
        </div>
      </section>

      <section className="home-process section">
        <div className="container process-layout">
          <div className="process-heading"><span className="eyebrow">03 — EL PROCESO</span><h2>De la charla<br />a algo <em>real.</em></h2><p>Trabajamos de forma cercana y ordenada. Cada etapa tiene un porqué y cada decisión, una intención.</p><Link className="process-link" href="/contacto">Empezar una conversación ↗</Link></div>
          <div className="process-list">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><b aria-hidden="true">↗</b></article>)}</div>
        </div>
      </section>

      <section className="home-work section">
        <div className="container">
          <div className="section-heading work-heading"><div><span className="eyebrow">04 — EN NUESTRO UNIVERSO</span><h2>Ideas que también<br /><em>ponemos en práctica.</em></h2></div><p>Además de trabajar con marcas, desarrollamos proyectos propios que nos permiten explorar, aprender y crear.</p></div>
          <div className="work-grid work-grid--editorial">
            {projects.map((project) => (
              <article className="work-card work-card--editorial" key={project.name}>
                <div className="work-meta"><span>{project.category}</span><span>{project.number}</span></div>
                <h3><a href={project.href} target="_blank" rel="noopener noreferrer">{project.name}<span aria-hidden="true"> ↗</span></a></h3>
                <p>{project.description}</p>
                <div className="work-focus">{project.focus}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta"><div className="container cta-inner"><span className="eyebrow">¿TENÉS UNA IDEA EN MENTE?</span><h2>Hagamos que<br /><em>pase algo bueno.</em></h2><div className="cta-bottom"><p>Contanos qué estás imaginando.<br />El primer paso es una conversación.</p><Link className="btn cta-button" href="/contacto">Hablemos <span aria-hidden="true">↗</span></Link></div></div></section>
    </>
  );
}
