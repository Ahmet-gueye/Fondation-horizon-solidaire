import { site } from "@/config/site";
import { stock } from "./images";

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
  },
];

export function getArticles() {
  return articles
    .filter((a) => !a.isExample || site.showExamples)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string) {
  return getArticles().find((a) => a.slug === slug);
}

export const newsCategories: NewsCategory[] = ["Vie de la fondation", "Projets", "Appels", "Rapports"];
