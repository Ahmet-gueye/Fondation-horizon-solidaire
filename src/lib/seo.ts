import type { Metadata } from "next";
import { site } from "@/config/site";

/** Construit les métadonnées d'une page (titre, description, Open Graph, URL canonique). */
export function pageMetadata({
  title,
  description,
  path,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: "fr_SN",
      type: "website",
      ...(site.shareImage ? { images: [{ url: site.shareImage, width: 1200, height: 630 }] } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
