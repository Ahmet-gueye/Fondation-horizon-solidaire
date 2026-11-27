import { site } from "@/config/site";
import type { Locale } from "@/i18n";
import { localizeImage, stock } from "./images";

/**
 * Actualités.
 * Les articles `isExample: true` sont des démonstrations fictives,
 * affichées avec la mention « Exemple fictif » si `site.showExamples` vaut true.
 * Ajoutez vos articles réels avec `isExample: false`.
 */

export type NewsCategory = "Vie de la fondation" | "Projets" | "Appels" | "Rapports";

export type Article = {
  slug: string;
  title: string;
  category: NewsCategory;
  date: string; // AAAA-MM-JJ
  summary: string;
  body: string[]; // paragraphes
  image: { src: string; alt: string; isIllustration: boolean; author?: string; source?: string; page?: string } | null;
  isExample: boolean;
  /** Version anglaise facultative (titre, résumé, paragraphes). Sans elle, l'article reste en français. */
  en?: { title: string; summary: string; body: string[] };
  /** Libellé de la catégorie dans la langue affichée (calculé). */
  categoryLabel?: string;
};

const categoryEn: Record<NewsCategory, string> = {
  "Vie de la fondation": "Foundation life",
  Projets: "Projects",
  Appels: "Calls for support",
  Rapports: "Reports",
};

const articles: Article[] = [
  {
    slug: "exemple-lancement-du-site",
    title: "Exemple d'article : présentation d'un nouveau programme",
    category: "Vie de la fondation",
    date: "2026-11-01",
    summary:
      "Cet article fictif montre la mise en page d'une actualité. Remplacez-le par une information réelle et datée.",
    body: [
      "Ce texte est un exemple de démonstration. Il ne relate aucune action réelle de la Fondation Horizon Solidaire.",
      "Une actualité efficace répond à quelques questions simples : que s'est-il passé, où, quand, avec qui, et quel en est le résultat vérifiable ? Ajoutez si possible une photo dont vous avez le droit d'usage et le consentement des personnes reconnaissables.",
    ],
    image: { ...stock.celebration, isIllustration: true },
    isExample: true,
    en: {
      title: "Sample article: presenting a new programme",
      summary: "This fictional article shows how a news item is laid out. Replace it with real, dated news.",
      body: [
        "This text is a demonstration example. It does not describe any real action of Fondation Horizon Solidaire.",
        "A good news item answers a few simple questions: what happened, where, when, with whom, and what is the verifiable result? If possible, add a photo you have the right to use, with the consent of anyone who can be recognised.",
      ],
    },
  },
  {
    slug: "exemple-appel-benevoles",
    title: "Exemple d'article : appel à bénévoles",
    category: "Appels",
    date: "2026-10-15",
    summary:
      "Exemple fictif d'appel à mobilisation. Il illustre comment relayer un besoin de bénévoles ou de compétences.",
    body: [
      "Ce texte est un exemple de démonstration et ne correspond à aucun appel réel.",
      "Précisez la mission, la durée, le lieu, les compétences recherchées et la manière de se porter volontaire.",
    ],
    image: { ...stock.pecheurs, isIllustration: true },
    isExample: true,
    en: {
      title: "Sample article: call for volunteers",
      summary: "Fictional example of a call for support. It shows how to share a need for volunteers or skills.",
      body: [
        "This text is a demonstration example and does not correspond to any real call.",
        "Describe the mission, its length, the place, the skills needed and how to volunteer.",
      ],
    },
  },
];

function localize(a: Article, locale: Locale): Article {
  if (locale !== "en") return { ...a, categoryLabel: a.category };
  return {
    ...a,
    ...(a.en ?? {}),
    categoryLabel: categoryEn[a.category],
    image: a.image ? localizeImage(a.image, locale) : null,
  };
}

export function getArticles(locale: Locale = "fr") {
  return articles
    .filter((a) => !a.isExample || site.showExamples)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((a) => localize(a, locale));
}

export function getArticle(slug: string, locale: Locale = "fr") {
  return getArticles(locale).find((a) => a.slug === slug);
}

export const newsCategories: NewsCategory[] = ["Vie de la fondation", "Projets", "Appels", "Rapports"];
export function newsCategoryLabel(c: NewsCategory, locale: Locale) {
  return locale === "en" ? categoryEn[c] : c;
}
