import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Diseño y desarrollo web",
  description: "Sitios web institucionales, comerciales y landing pages diseñados para comunicar con claridad y funcionar en cualquier dispositivo.",
  alternates: { canonical: "/servicios/diseno-web" },
};

const capabilities = [
  ["Sitios institucionales", "Una presencia digital clara para presentar tu negocio, explicar tus servicios y facilitar el contacto."],
  ["Landing pages", "Páginas enfocadas en una propuesta concreta, una campaña o una acción que querés que las personas realicen."],
  ["Rediseño web", "Una revisión de estructura, contenido y experiencia para actualizar un sitio existente."],
  ["Desarrollo a medida", "Funcionalidades y experiencias digitales construidas según las necesidades reales del proyecto."],
];

const process = [
  ["01", "Entender", "Conversamos sobre tu negocio, tus objetivos y las personas que querés alcanzar."],
  ["02", "Planificar", "Definimos estructura, contenidos, prioridades y el alcance del trabajo."],
  ["03", "Diseñar y desarrollar", "Construimos la experiencia y la adaptamos a computadoras, tablets y celulares."],
  ["04", "Revisar y publicar", "Probamos el sitio, corregimos detalles y preparamos su puesta en línea."],
];

export default function WebDesignService() {
  return (
    <>
      <section className="service-detail-hero">
        <div className="container">
          <Link className="service-back-link" href="/servicios">← Todos los servicios</Link>
          <span className="eyebrow">01 / DISEÑO Y DESARROLLO WEB</span>
          <h1>Tu próximo paso<br /><em>empieza en la web.</em></h1>
          <p>Diseñamos y desarrollamos sitios que presentan tu negocio con claridad, generan confianza y hacen más sencillo el contacto con tus potenciales clientes.</p>
          <Link className="btn service-detail-button" href="/contacto?servicio=web">Hablemos de tu sitio <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      <section className="service-detail-intro section">
        <div className="container service-detail-two-col">
          <div><span className="eyebrow">UNA HERRAMIENTA, NO SOLO UNA VIDRIERA</span><h2>Una buena web<br /><em>trabaja con vos.</em></h2></div>
          <div><p>Tu sitio suele ser uno de los primeros lugares donde alguien conoce tu negocio. Por eso importa tanto lo que dice como la facilidad con la que se puede recorrer.</p><p>Priorizamos una estructura comprensible, una experiencia adaptable a distintos dispositivos y una base técnica cuidada. El resultado tiene que responder a tus objetivos, no a una moda.</p></div>
        </div>
      </section>
      <section className="service-capabilities section">
        <div className="container">
          <div className="service-section-heading"><span className="eyebrow">QUÉ PODEMOS HACER</span><h2>La solución adecuada<br /><em>para cada necesidad.</em></h2></div>
          <div className="service-capability-grid">
            {capabilities.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </div>
      </section>
      <section className="service-process section">
        <div className="container service-detail-two-col">
          <div><span className="eyebrow">CÓMO TRABAJAMOS</span><h2>Un proceso<br /><em>con dirección.</em></h2><p>Vas a saber qué estamos haciendo, por qué y cuál es el siguiente paso.</p></div>
          <div className="service-process-list">{process.map(([number, title, description]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
        </div>
      </section>
      <section className="service-detail-cta"><div className="container"><span className="eyebrow">TU PROYECTO PUEDE EMPEZAR CON UNA CHARLA</span><h2>Construyamos algo<br /><em>que tenga sentido.</em></h2><Link className="btn" href="/contacto?servicio=web">Consultar por desarrollo web <span aria-hidden="true">↗</span></Link></div></section>
    </>
  );
}
