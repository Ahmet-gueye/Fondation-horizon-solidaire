import { site } from "@/config/site";
import { stock } from "./images";

/**
 * Fiches projets.
 *
 * - `isExample: true` : fiche de démonstration, affichée avec la mention
 *   « Exemple à remplacer » et seulement si `site.showExamples` vaut true.
 *   Un exemple n'accepte JAMAIS de don et n'affiche jamais de chiffres.
 * - Les montants (`budget`, `collected`) ne sont affichés que s'ils sont
 *   renseignés ET accompagnés d'une date `financialsUpdatedAt`.
 * - `featured: true` met le projet en avant sur l'accueil (projet réel uniquement).
 */

export type ProjectStatus = "en-preparation" | "en-cours" | "termine";

export type Project = {
  slug: string;
  title: string;
  programme: string; // slug du programme
  region: string | null;
  commune: string | null;
  status: ProjectStatus;
  summary: string;
  need: string | null;
  beneficiaries: string | null;
  objectives: string[];
  steps: { label: string; done: boolean }[];
  budget: number | null; // FCFA
  collected: number | null; // FCFA, montant reçu vérifié
  financialsUpdatedAt: string | null; // AAAA-MM-JJ
  startDate: string | null;
  endDate: string | null;
  results: string[];
  image: { src: string; alt: string; isIllustration: boolean; author?: string; page?: string } | null;
  acceptsDonations: boolean;
  featured: boolean;
  isExample: boolean;
};

export const statusLabels: Record<ProjectStatus, string> = {
  "en-preparation": "En préparation",
  "en-cours": "En cours",
  termine: "Terminé",
};

const projects: Project[] = [
  {
    slug: "exemple-fournitures-scolaires",
    title: "Kits scolaires pour la rentrée",
    programme: "education",
    region: "Kaolack",
    commune: null,
    status: "en-preparation",
    summary:
      "Fiche de démonstration montrant comment présenter un projet éducatif. Elle ne décrit pas une action réelle de la fondation.",
    need: "Exemple : description du besoin identifié avec les acteurs locaux.",
    beneficiaries: "Exemple : nombre et profil des bénéficiaires visés.",
    objectives: ["Exemple d'objectif mesurable", "Deuxième objectif à préciser"],
    steps: [
      { label: "Diagnostic avec l'équipe pédagogique", done: false },
      { label: "Achat et préparation des kits", done: false },
      { label: "Distribution et suivi", done: false },
    ],
    budget: null,
    collected: null,
    financialsUpdatedAt: null,
    startDate: null,
    endDate: null,
    results: [],
    image: { ...stock.regle, isIllustration: true },
    acceptsDonations: false,
    featured: false,
    isExample: true,
  },
  {
    slug: "exemple-sante-communautaire",
    title: "Journées de sensibilisation à la santé",
    programme: "sante",
    region: "Thiès",
    commune: null,
    status: "en-cours",
    summary:
      "Fiche de démonstration d'un projet de prévention. Elle ne décrit pas une action réelle de la fondation.",
    need: "Exemple : constat partagé avec le poste de santé local.",
    beneficiaries: "Exemple : publics visés par les séances.",
    objectives: ["Exemple d'objectif de prévention"],
    steps: [
      { label: "Préparation avec les relais communautaires", done: false },
      { label: "Organisation des séances", done: false },
    ],
    budget: null,
    collected: null,
    financialsUpdatedAt: null,
    startDate: null,
    endDate: null,
    results: [],
    image: { ...stock.consultation, isIllustration: true },
    acceptsDonations: false,
    featured: false,
    isExample: true,
  },
  {
    slug: "exemple-groupement-femmes",
    title: "Équipement d'un groupement de femmes",
    programme: "autonomisation",
    region: "Saint-Louis",
    commune: null,
    status: "termine",
    summary:
      "Fiche de démonstration d'un projet d'autonomisation économique. Elle ne décrit pas une action réelle de la fondation.",
    need: "Exemple : besoin exprimé par le groupement.",
    beneficiaries: "Exemple : membres du groupement.",
    objectives: ["Exemple : renforcer une activité de transformation locale"],
    steps: [
      { label: "Formation en gestion", done: false },
      { label: "Remise du matériel", done: false },
      { label: "Suivi à six mois", done: false },
    ],
    budget: null,
    collected: null,
    financialsUpdatedAt: null,
    startDate: null,
    endDate: null,
    results: [],
    image: { ...stock.cultures, isIllustration: true },
    acceptsDonations: false,
    featured: false,
    isExample: true,
  },
];

export function getProjects() {
  return projects.filter((p) => !p.isExample || site.showExamples);
}

export function getProject(slug: string) {
  return getProjects().find((p) => p.slug === slug);
}

/** Projets pouvant recevoir un don affecté (jamais les exemples). */
export function getDonatableProjects() {
  return projects.filter((p) => p.acceptsDonations && !p.isExample);
}

/** Les chiffres d'un projet sont-ils publiables ? */
export function hasVerifiedFinancials(p: Project) {
  return (
    !p.isExample &&
    p.budget !== null &&
    p.budget > 0 &&
    p.collected !== null &&
    p.collected >= 0 &&
    p.financialsUpdatedAt !== null
  );
}

export function getFeaturedProject() {
  return projects.find((p) => p.featured && !p.isExample && hasVerifiedFinancials(p));
}
