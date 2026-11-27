import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contanos sobre tu proyecto web o tu estrategia SEO. En Lazo Sur podemos ayudarte a definir el próximo paso.",
  alternates: { canonical: "/contacto" },
};

export default function Contact() {
  return (
    <>
      <section className="contact-hero">
        <div className="container contact-hero-grid">
          <div className="contact-copy">
            <span className="eyebrow">HABLEMOS DE TU PROYECTO</span>
            <h1>Las buenas ideas<br /><em>empiezan hablando.</em></h1>
            <p>Contanos qué estás buscando, qué necesitás resolver o qué te gustaría mejorar. Leemos cada consulta para entender el contexto y orientarte sobre el próximo paso.</p>
            <div className="contact-note">
              <span className="contact-note-mark" aria-hidden="true">↘</span>
              <div><strong>Sin compromiso, con claridad.</strong><span>Una primera conversación para conocer tu proyecto y ver cómo podemos ayudarte.</span></div>
            </div>
            <Link className="contact-back-link" href="/servicios">¿Todavía estás explorando? Conocé nuestros servicios <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="contact-form-wrap">
            <div className="contact-form-heading"><div><span className="eyebrow">FORMULARIO DE CONTACTO</span><h2>Contanos un poco más.</h2></div><span className="contact-form-index">LS / 01</span></div>
            <ContactForm />
          </div>
        </div>
      </section>
      <section className="contact-bottom">
        <div className="container contact-bottom-inner"><span className="eyebrow">LAZO SUR · DISEÑO, DESARROLLO Y SEO</span><p>Una presencia digital pensada para acompañar el crecimiento de tu negocio.</p></div>
      </section>
    </>
  );
}
