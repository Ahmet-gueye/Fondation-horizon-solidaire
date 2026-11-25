/**
 * Programmes de la fondation.
 *
 * Les textes d'introduction décrivent le domaine d'action de manière générale.
 * Les champs factuels (zones, calendrier, budget, résultats, photos) restent vides
 * tant que la fondation ne les a pas fournis : ils s'affichent alors comme
 * « À compléter par la fondation ».
 *
 * `confirmed: false` = domaine non encore confirmé par la fondation :
 * il est masqué du site public (voir `getPublicProgrammes`).
 */

export type Programme = {
  slug: string;
  title: string;
  shortTitle: string;
  icon: "education" | "sante" | "urgence" | "solidarite" | "autonomie" | "developpement" | "eau";
  accent: "green" | "sun" | "blue" | "red" | "teal";
  summary: string;
  objective: string;
  audiences: string[];
  zones: string[];
  activities: string[];
  timeline: string | null;
  budget: number | null; // en FCFA
  verifiedResults: string[];
  photos: { src: string; alt: string; caption?: string; consent: boolean }[];
  confirmed: boolean;
};

export const programmes: Programme[] = [
  {
    slug: "education",
    title: "Éducation et réussite scolaire",
    shortTitle: "Éducation",
    icon: "education",
    accent: "blue",
    summary:
      "Favoriser l'accès à l'école, le maintien des élèves en classe et de bonnes conditions d'apprentissage.",
    objective:
      "Permettre à chaque enfant et à chaque jeune de suivre une scolarité dans de bonnes conditions, quel que soit le revenu de sa famille.",
    audiences: ["Élèves", "Familles", "Établissements scolaires"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "sante",
    title: "Santé et prévention",
    shortTitle: "Santé",
    icon: "sante",
    accent: "red",
    summary:
      "Rapprocher les soins essentiels des familles et encourager les gestes de prévention au quotidien.",
    objective:
      "Améliorer l'accès aux soins de base et à l'information sanitaire, en lien avec les structures de santé existantes.",
    audiences: ["Familles", "Femmes enceintes et jeunes enfants", "Personnes âgées"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "aide-humanitaire",
    title: "Aide humanitaire et réponse aux urgences",
    shortTitle: "Urgences",
    icon: "urgence",
    accent: "sun",
    summary:
      "Apporter une aide rapide et digne aux familles touchées par une crise : inondation, incendie, période de soudure.",
    objective:
      "Répondre aux besoins vitaux des ménages en situation d'urgence, en coordination avec les autorités et les acteurs locaux.",
    audiences: ["Ménages sinistrés", "Personnes déplacées"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "solidarite",
    title: "Solidarité communautaire et protection des personnes vulnérables",
    shortTitle: "Solidarité",
    icon: "solidarite",
    accent: "teal",
    summary:
      "Renforcer l'entraide de proximité et accompagner les personnes isolées ou en situation de fragilité.",
    objective:
      "Protéger et soutenir les personnes vulnérables en s'appuyant sur les liens de solidarité qui font la force des communautés.",
    audiences: ["Personnes en situation de handicap", "Orphelins et enfants vulnérables", "Personnes âgées isolées"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "autonomisation",
    title: "Autonomisation économique des femmes et des jeunes",
    shortTitle: "Autonomisation",
    icon: "autonomie",
    accent: "sun",
    summary:
      "Accompagner les femmes et les jeunes vers des revenus stables : formation, accompagnement, petits équipements.",
    objective:
      "Donner aux femmes et aux jeunes les moyens de créer ou de développer une activité génératrice de revenus.",
    audiences: ["Femmes", "Jeunes", "Groupements et coopératives"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "developpement-local",
    title: "Développement local et projets durables",
    shortTitle: "Développement",
    icon: "developpement",
    accent: "green",
    summary:
      "Soutenir des initiatives portées par les communautés elles-mêmes, pensées pour durer et respecter l'environnement.",
    objective:
      "Contribuer à des projets locaux utiles et durables, conçus et suivis avec les habitants.",
    audiences: ["Communautés locales", "Associations de quartier", "Collectivités"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    confirmed: true,
  },
  {
    slug: "eau-hygiene-assainissement",
    title: "Accès à l'eau, à l'hygiène et à l'assainissement",
    shortTitle: "Eau et hygiène",
    icon: "eau",
    accent: "blue",
    summary:
      "Faciliter l'accès à une eau sûre et à des installations d'hygiène adaptées.",
    objective:
      "Améliorer durablement l'accès à l'eau potable et à l'assainissement pour les familles et les écoles.",
    audiences: ["Familles", "Écoles", "Structures de santé"],
    zones: [],
    activities: [],
    timeline: null,
    budget: null,
    verifiedResults: [],
    photos: [],
    // À passer à `true` uniquement si ce domaine fait partie des activités confirmées.
    confirmed: false,
  },
];

export function getPublicProgrammes() {
  return programmes.filter((p) => p.confirmed);
}

export function getProgramme(slug: string) {
  return getPublicProgrammes().find((p) => p.slug === slug);
}
