import Link from "next/link";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Política de privacidad",
  description: "Conocé qué datos recopila Lazo Sur cuando enviás una consulta, para qué se utilizan y cómo ejercer tus derechos.",
  path: "/privacidad",
});

const sections = [
  {
    title: "1. Quién administra este sitio",
    paragraphs: [
      "Este sitio es operado bajo el nombre comercial Lazo Sur. La identificación legal completa de la persona o entidad responsable y su domicilio deberán incorporarse antes del lanzamiento comercial del sitio.",
    ],
  },
  {
    title: "2. Qué información recopilamos",
    paragraphs: [
      "Cuando completás el formulario de contacto podemos recibir tu nombre y apellido, correo electrónico, teléfono, empresa o negocio, servicio de interés, presupuesto estimado y el contenido de tu mensaje.",
      "También se procesa información técnica limitada necesaria para proteger el formulario contra abusos. Para aplicar el límite de solicitudes, la dirección IP se transforma mediante un hash SHA-256 antes de almacenarse en el servicio de control de frecuencia; no guardamos la IP en texto plano en ese registro.",
    ],
  },
  {
    title: "3. Para qué usamos los datos",
    paragraphs: [
      "Utilizamos la información del formulario para recibir, evaluar y responder tu consulta, mantener el seguimiento de una posible relación comercial y proteger el sitio frente a envíos automatizados o abusivos.",
      "No utilizamos los datos del formulario para enviar comunicaciones promocionales no solicitadas ni vendemos información personal.",
    ],
  },
  {
    title: "4. Base y carácter del envío",
    paragraphs: [
      "El envío del formulario es voluntario. Los campos obligatorios se identifican en el propio formulario y son necesarios para poder comprender y responder la consulta. Al marcar la casilla de consentimiento y enviar el formulario, autorizás el tratamiento de los datos proporcionados para esa finalidad.",
    ],
  },
  {
    title: "5. Dónde se procesan y quiénes pueden intervenir",
    paragraphs: [
      "Los datos de las consultas se almacenan en una base de datos administrada mediante Supabase. El mecanismo de protección contra envíos abusivos utiliza Upstash Redis y conserva identificadores derivados mediante hash para aplicar el límite de solicitudes.",
      "Estos proveedores actúan como servicios de infraestructura tecnológica. El alojamiento y otros servicios técnicos que se incorporen podrán procesar información únicamente en la medida necesaria para operar, mantener y proteger el sitio. La ubicación de los servidores y las condiciones de transferencia internacional dependen de la configuración de cada proveedor.",
    ],
  },
  {
    title: "6. Conservación y seguridad",
    paragraphs: [
      "Conservamos los datos durante el tiempo necesario para gestionar la consulta, dar seguimiento a una posible relación comercial y atender obligaciones legales aplicables. No establecemos en esta política un plazo fijo mientras no exista un calendario formal de conservación y eliminación.",
      "Aplicamos medidas técnicas y organizativas razonables, como controles de acceso, permisos restringidos en la base de datos, validación del lado del servidor y limitación de solicitudes. Ningún sistema conectado a Internet puede garantizar seguridad absoluta.",
    ],
  },
  {
    title: "7. Tus derechos",
    paragraphs: [
      "Podés solicitar acceso a tus datos personales, su actualización o rectificación y, cuando corresponda, su supresión. También podés retirar el consentimiento para tratamientos futuros, sin afectar la licitud del tratamiento realizado previamente.",
      "Para realizar una solicitud, escribinos desde el formulario de contacto e indicá claramente que se trata de un pedido relacionado con tus datos personales. Podemos solicitar información razonable para verificar tu identidad antes de responder.",
      "En Argentina, la Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, tiene la atribución de atender denuncias y reclamos relacionados con la protección de datos personales.",
    ],
  },
  {
    title: "8. Cookies y tecnologías similares",
    paragraphs: [
      "El sitio público no incorpora actualmente herramientas de publicidad comportamental ni servicios de analítica de terceros. Las áreas privadas pueden utilizar tecnologías técnicas necesarias para mantener la sesión de autenticación y proteger el acceso.",
    ],
  },
  {
    title: "9. Cambios en esta política",
    paragraphs: [
      "Podemos actualizar esta política para reflejar cambios en el sitio, en los servicios utilizados o en las normas aplicables. La versión vigente estará publicada en esta página.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <section className="privacy-page">
      <div className="container privacy-container">
        <Link className="privacy-back" href="/">← Volver al inicio</Link>
        <header className="privacy-header">
          <span className="eyebrow">LAZO SUR · INFORMACIÓN LEGAL</span>
          <h1>Política de <em>privacidad.</em></h1>
          <p>Cómo tratamos la información que compartís cuando te ponés en contacto con nosotros.</p>
          <span className="privacy-updated">ÚLTIMA ACTUALIZACIÓN: 27 DE NOVIEMBRE DE 2026</span>
        </header>
        <div className="privacy-notice">
          <strong>Información importante</strong>
          <p>Lazo Sur es el nombre comercial utilizado en este sitio. Antes del lanzamiento comercial debe completarse la identificación legal del responsable, su domicilio y un canal directo para solicitudes de privacidad. Esta página describe el funcionamiento implementado actualmente y no reemplaza una revisión legal.</p>
        </div>
        <div className="privacy-content">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <div className="privacy-contact">
          <div><span className="eyebrow">¿TENÉS UNA CONSULTA?</span><h2>Estamos para <em>ayudarte.</em></h2></div>
          <Link className="btn" href="/contacto">Ir al formulario de contacto <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
