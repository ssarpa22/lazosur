import Link from "next/link";

const services = [
  { number: "01", tag: "PRESENCIA DIGITAL", title: "Diseño y desarrollo web", copy: "Sitios web pensados para comunicar mejor, generar confianza y convertir visitas en oportunidades.", href: "/servicios#web", action: "Explorar desarrollo web", mark: "↗" },
  { number: "02", tag: "CRECIMIENTO ORGÁNICO", title: "Posicionamiento SEO", copy: "Una base técnica sólida y contenido estratégico para que tu negocio pueda ser encontrado.", href: "/servicios#seo", action: "Explorar SEO", mark: "⌕" },
];

const steps = [
  ["01", "Escuchamos", "Entendemos tu negocio, tus objetivos y a las personas a las que querés llegar."],
  ["02", "Damos dirección", "Ordenamos las ideas y definimos un plan de trabajo con prioridades claras."],
  ["03", "Hacemos realidad", "Diseñamos, desarrollamos y probamos cada parte del proyecto."],
  ["04", "Seguimos creciendo", "Medimos, aprendemos y mejoramos lo que construimos."],
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid">
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
          <div className="hero-visual" aria-label="Composición gráfica abstracta de Lazo Sur">
            <div className="hero-visual-top"><span>LS / EST. DIGITAL</span><span>01 — 04</span></div>
            <div className="hero-sun" />
            <div className="hero-loop loop-one" />
            <div className="hero-loop loop-two" />
            <div className="hero-loop loop-three" />
            <div className="hero-cross">+</div>
            <div className="hero-visual-bottom"><strong>LO QUE IMAGINÁS,<br />PUEDE TOMAR FORMA.</strong><span>BUENOS AIRES<br />ARGENTINA</span></div>
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
          <div className="work-grid">
            <article className="work-card work-metric"><div className="work-art metric-art"><span className="metric-symbol">M<span>↗</span></span><span className="art-caption">DATOS EN MOVIMIENTO / 01</span><div className="metric-bars"><i/><i/><i/><i/><i/><i/><i/></div></div><div className="work-meta"><span>PROYECTO PROPIO · SOFTWARE</span><span>01 / 02</span></div><h3>MétricaSur</h3><p>Software de gestión y analítica empresarial.</p></article>
            <article className="work-card work-radio"><div className="work-art radio-art"><span className="radio-orbit orbit-a"/><span className="radio-orbit orbit-b"/><strong>R<span>E</span></strong><span className="art-caption">UNA SEÑAL, MUCHAS HISTORIAS / 02</span></div><div className="work-meta"><span>PROYECTO PROPIO · DIGITAL</span><span>02 / 02</span></div><h3>RadioEterna</h3><p>Un proyecto digital propio en desarrollo.</p></article>
          </div>
        </div>
      </section>

      <section className="home-cta"><div className="container cta-inner"><span className="eyebrow">¿TENÉS UNA IDEA EN MENTE?</span><h2>Hagamos que<br /><em>pase algo bueno.</em></h2><div className="cta-bottom"><p>Contanos qué estás imaginando.<br />El primer paso es una conversación.</p><Link className="btn cta-button" href="/contacto">Hablemos <span aria-hidden="true">↗</span></Link></div><span className="cta-stamp" aria-hidden="true">LS</span></div></section>
    </>
  );
}
