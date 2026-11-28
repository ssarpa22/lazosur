import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site, nav } from "@/lib/site";
import JsonLd from "@/components/json-ld";


export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Lazo Sur — Diseño web y SEO", template: "%s | Lazo Sur" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_AR", siteName: site.name, title: "Lazo Sur — Diseño web y SEO", description: site.description, url: site.url },
  twitter: { card: "summary", title: "Lazo Sur — Diseño web y SEO", description: site.description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head><meta name="theme-color" content="#101713" /></head>
      <body>
        <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${site.url}/#organization`,
          name: site.name,
          url: site.url,
          description: site.description,
        }} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          publisher: { "@id": `${site.url}/#organization` },
          inLanguage: "es-AR",
        }} />
        <header className="header">
          <div className="container nav">
            <Link className="logo" href="/" aria-label="Lazo Sur, inicio">LAZO <i>SUR</i></Link>
            <nav aria-label="Navegación principal">
              {nav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
              <Link className="btn small" href="/contacto">Hablemos <span aria-hidden="true">↗</span></Link>
            </nav>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <Link className="logo" href="/" aria-label="Lazo Sur, inicio">LAZO <i>SUR</i></Link>
            <span>Ideas claras. Experiencias digitales que conectan.</span>
            <div className="footer-legal">
              <Link href="/privacidad">Política de privacidad</Link>
              <small>© {new Date().getFullYear()} Lazo Sur · Argentina</small>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
