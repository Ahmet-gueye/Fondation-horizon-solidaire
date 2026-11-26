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
   * Logo officiel fourni par la fondation (fichiers dans `public/images/logo/`).
   * - `emblem` : l'emblème (mains, soleil, personnes) recadré tel quel depuis le
   *   visuel officiel, utilisé dans l'en-tête, le pied de page et l'icône du site ;
   * - `full` : le visuel officiel complet, recadré sans les bandes noires.
   * Indiquez toujours les dimensions RÉELLES des fichiers pour préserver les proportions.
   */
  logo: {
    src: "/images/logo/logo-embleme.png" as string | null,
    width: 294,
    height: 294,
    alt: "Logo de la Fondation Horizon Solidaire",
    full: { src: "/images/logo/logo-fondation-complet.png", width: 695, height: 703 },
  },

  /**
   * Image de partage personnalisée (1200 × 630 px conseillé), placée dans `public/`.
   * `null` = image générée automatiquement par `src/app/opengraph-image.tsx`.
   */
  shareImage: null as string | null, // ex. "/images/partage.jpg"

  /** Coordonnées officielles. `null` = non affiché, mention « À compléter ». */
  contact: {
    /** Adresses e-mail de contact (la première est l'adresse principale). */
    emails: ["seydigaye9@gmail.com", "gayetapha1@gmail.com"] as string[],
    phone: "+221 77 755 39 99" as string | null,
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
  { href: "/activites", label: "Activités" },
  { href: "/transparence", label: "Transparence" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
] as const;
