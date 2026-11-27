"use client";

import { useState, type FormEvent } from "react";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result: { error?: string } = await response.json();

      if (!response.ok) throw new Error(result.error ?? "No pudimos enviar tu consulta. Intentá nuevamente.");

      form.reset();
      setStatus("success");
      setMessage("Recibimos tu consulta. ¡Gracias por escribirnos!");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado. Intentá nuevamente.");
    }
  }

  return (
    <form className="form contact-form" onSubmit={submit} aria-busy={status === "submitting"}>
      <div className="contact-form-fields">
        <label>Nombre y apellido<input name="name" autoComplete="name" placeholder="Cómo te llamás" required minLength={2} maxLength={100} /></label>
        <label>Empresa o negocio <span className="field-optional">OPCIONAL</span><input name="company" autoComplete="organization" placeholder="Nombre de tu negocio" maxLength={120} /></label>
        <label>Correo electrónico<input name="email" type="email" autoComplete="email" placeholder="nombre@empresa.com" required maxLength={254} /></label>
        <label>Teléfono <span className="field-optional">OPCIONAL</span><input name="phone" type="tel" autoComplete="tel" placeholder="+54 9 ..." maxLength={40} /></label>
      </div>
      <label>¿En qué podemos ayudarte?
        <select name="service" defaultValue="web">
          <option value="web">Diseño y desarrollo web</option>
          <option value="seo">Posicionamiento SEO</option>
          <option value="both">Desarrollo web + SEO</option>
          <option value="other">Otro proyecto / Necesito orientación</option>
        </select>
      </label>
      <label>Presupuesto estimado <span className="field-optional">OPCIONAL</span>
        <select name="budget" defaultValue="">
          <option value="">Prefiero conversarlo</option>
          <option value="Menos de USD 500">Menos de USD 500</option>
          <option value="USD 500–1.500">USD 500–1.500</option>
          <option value="USD 1.500–3.000">USD 1.500–3.000</option>
          <option value="Más de USD 3.000">Más de USD 3.000</option>
        </select>
      </label>
      <label>Contanos sobre tu proyecto
        <textarea name="message" placeholder="¿Qué necesitás? ¿Qué objetivo te gustaría alcanzar? Cualquier detalle nos ayuda a entender mejor tu idea." required minLength={20} maxLength={4000} rows={5} />
      </label>
      <label className="contact-consent"><input type="checkbox" name="consent" required /><span>Autorizo el uso de estos datos para que Lazo Sur pueda responder mi consulta.</span></label>
      <label className="trap" aria-hidden="true">Dejar vacío<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="btn contact-submit" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Enviando consulta…" : "Enviar consulta"} <span aria-hidden="true">↗</span>
      </button>
      <p className={`contact-feedback contact-feedback--${status}`} role="status" aria-live="polite">{message}</p>
      <small className="contact-privacy">Tus datos se utilizan únicamente para gestionar esta consulta. No compartimos esta información con terceros.</small>
    </form>
  );
}
