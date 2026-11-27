import type { Metadata } from "next";

export const site = {
  name: "Lazo Sur",
  description: "Diseño y desarrollo web y posicionamiento SEO para negocios y profesionales.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, site.url).toString();
  const socialTitle = `${title} | ${site.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "es_AR", siteName: site.name, title: socialTitle, description, url },
    twitter: { card: "summary", title: socialTitle, description },
  };
}

export const nav = [
  { href: "/servicios", label: "Servicios" },
  { href: "/portfolio", label: "Proyectos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];
