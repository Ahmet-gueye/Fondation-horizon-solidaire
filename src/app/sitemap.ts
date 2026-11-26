import type { MetadataRoute } from "next";
import { getArticles } from "@/content/actualites";
import { getPublicProgrammes } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = ["", "/qui-sommes-nous", "/programmes", "/activites", "/transparence", "/actualites", "/galerie", "/faire-un-don", "/engagez-vous", "/contact", "/faq", "/mentions-legales", "/confidentialite", "/conditions-de-don"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...getPublicProgrammes().map((p) => ({ url: `${base}/programmes/${p.slug}`, priority: 0.6 })),
    // Seules les fiches publiées figurent dans le sitemap (jamais les brouillons ni les archives).
    ...(await listPublicFiches()).map((f) => ({ url: `${base}/activites/${f.slug}`, lastModified: f.updatedAt, priority: 0.6 })),
    ...getArticles().filter((a) => !a.isExample).map((a) => ({ url: `${base}/actualites/${a.slug}`, lastModified: a.date, priority: 0.5 })),
  ];
}
