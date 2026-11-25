/**
 * Configuration générale de la Fondation Horizon Solidaire.
 *
 * RÈGLE D'OR : ne renseignez ici que des informations vérifiées.
 * Toute valeur laissée à `null` (ou tableau vide) est automatiquement
 * masquée ou remplacée par la mention « À compléter par la fondation ».
 */

export type SocialLink = { label: string; url: string };

export type ImpactIndicator = {
  /** Libellé affiché, ex. « Élèves accompagnés » */
  label: string;
  /** Valeur vérifiée (nombre). `null` = « Données à renseigner ». */
  value: number | null;
  /** Suffixe éventuel, ex. « + » ou « % » */
  suffix?: string;
  /** Source ou période de référence, ex. « Rapport annuel 2025 » */
  source?: string;
};

export const site = {
  name: "Fondation Horizon Solidaire",
  shortName: "Horizon Solidaire",
  motto: "Ensemble, construisons un avenir durable",
  country: "Sénégal",
  description:
    "La Fondation Horizon Solidaire agit au Sénégal pour l'éducation, la santé, l'aide humanitaire, la solidarité et le développement durable des communautés.",

  /** URL publique du site, utilisée pour le SEO et le sitemap. Surchargée par NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * Logo officiel fourni par la fondation.
   * 1. Déposez le fichier dans `public/images/` (ex. `public/images/logo.png`).
   * 2. Renseignez `src`, puis la largeur et la hauteur RÉELLES du fichier
   *    (en pixels) afin de préserver ses proportions.
   * Tant que `src` vaut `null`, un emplacement « Logo à intégrer » est affiché.
   */
  logo: {
    src: null as string | null, // ex. "/images/logo.png"
    width: 0, // ex. 600
    height: 0, // ex. 600
    alt: "Logo de la Fondation Horizon Solidaire",
  },

  /**
   * Image de partage personnalisée (1200 × 630 px conseillé), placée dans `public/`.
   * `null` = image générée automatiquement par `src/app/opengraph-image.tsx`.
   */
  shareImage: null as string | null, // ex. "/images/partage.jpg"

  /** Coordonnées officielles. `null` = non affiché, mention « À compléter ». */
  contact: {
    email: null as string | null,
    phone: null as string | null,
    whatsapp: null as string | null,
    address: null as string | null,
    openingHours: null as string | null,
  },

  /** Réseaux sociaux officiels. Laisser vide tant que les comptes ne sont pas confirmés. */
  socials: [] as SocialLink[],
  // Exemple de format : { label: "Facebook", url: "https://facebook.com/votre-page" }

  /** Statut juridique : à remplir UNIQUEMENT à partir de documents officiels. */
  legal: {
    legalForm: null as string | null, // ex. forme juridique exacte
    registrationNumber: null as string | null, // n° d'enregistrement / récépissé
    registrationAuthority: null as string | null,
    ninea: null as string | null,
    foundedOn: null as string | null, // date de création (AAAA-MM-JJ)
    headquarters: null as string | null,
    publicationDirector: null as string | null,
    host: null as string | null, // hébergeur du site (nom, adresse)
  },

  /** Zones d'intervention confirmées (régions/communes). Vide = « À compléter ». */
  interventionZones: [] as string[],

  /**
   * Indicateurs d'impact. Mettez `value` à un nombre vérifié pour l'afficher.
   * Si `showImpactWhenEmpty` vaut false, la section est masquée tant qu'aucun chiffre n'est renseigné.
   */
  showImpactWhenEmpty: true,
  impact: [
    { label: "Personnes accompagnées", value: null },
    { label: "Projets menés", value: null },
    { label: "Communes ou quartiers touchés", value: null },
    { label: "Bénévoles mobilisés", value: null },
  ] as ImpactIndicator[],

  /**
   * Afficher les contenus de démonstration (projets, actualités, galerie)
   * marqués « Exemple à remplacer ». Passez à `false` avant la mise en production
   * ou dès que vos vrais contenus sont saisis.
   */
  showExamples: true,
} as const;

export const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/qui-sommes-nous", label: "Qui sommes-nous ?" },
  { href: "/programmes", label: "Nos programmes" },
  { href: "/projets", label: "Projets" },
  { href: "/transparence", label: "Transparence" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
] as const;
