import type { MetadataRoute } from "next";
import { getArticles } from "@/content/actualites";
import { getPublicProgrammes } from "@/content/programmes";
import { getProjects } from "@/content/projets";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticPaths = ["", "/qui-sommes-nous", "/programmes", "/projets", "/transparence", "/actualites", "/galerie", "/faire-un-don", "/engagez-vous", "/contact", "/faq", "/mentions-legales", "/confidentialite", "/conditions-de-don"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...getPublicProgrammes().map((p) => ({ url: `${base}/programmes/${p.slug}`, priority: 0.6 })),
    // Les exemples de démonstration sont exclus du sitemap.
    ...getProjects().filter((p) => !p.isExample).map((p) => ({ url: `${base}/projets/${p.slug}`, priority: 0.6 })),
    ...getArticles().filter((a) => !a.isExample).map((a) => ({ url: `${base}/actualites/${a.slug}`, lastModified: a.date, priority: 0.5 })),
  ];
}
