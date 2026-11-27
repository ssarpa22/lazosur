import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const publicPages = [
  { path: "", priority: 1, changeFrequency: "monthly" as const },
  { path: "/servicios", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/servicios/diseno-web", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/servicios/seo", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/portfolio", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/nosotros", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/contacto", priority: 0.7, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, priority, changeFrequency }) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency,
    priority,
  }));
}
