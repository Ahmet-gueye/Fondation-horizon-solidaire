/**
 * Modèle des fiches (activités, événements, projets, campagnes).
 * Module PUR partagé entre le navigateur (formulaire) et le serveur (validation qui fait foi).
 */

export const ficheTypes = {
  activite: "Activité",
  evenement: "Événement",
  projet: "Projet",
  campagne: "Campagne",
} as const;
export type FicheType = keyof typeof ficheTypes;
export const ficheTypesEn: Record<FicheType, string> = { activite: "Activity", evenement: "Event", projet: "Project", campagne: "Campaign" };

export const ficheStatuses = {
  brouillon: "Brouillon",
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  archive: "Archivé",
} as const;
export type FicheStatus = keyof typeof ficheStatuses;
export const ficheStatusesEn: Record<FicheStatus, string> = { brouillon: "Draft", planifie: "Planned", en_cours: "In progress", termine: "Completed", archive: "Archived" };
/** Statuts qu'on choisit dans le formulaire (l'archivage passe par une action dédiée). */
export const editableStatuses: FicheStatus[] = ["brouillon", "planifie", "en_cours", "termine"];
/** Statuts compatibles avec une publication. */
export const publishableStatuses: FicheStatus[] = ["planifie", "en_cours", "termine"];

export const ctaKinds = {
  aucun: "Aucun bouton",
  participer: "Participer",
  benevole: "Devenir bénévole",
  en_savoir_plus: "En savoir plus",
  soutenir: "Soutenir la campagne",
} as const;
export type CtaKind = keyof typeof ctaKinds;
export const ctaKindsEn: Record<CtaKind, string> = { aucun: "No button", participer: "Take part", benevole: "Become a volunteer", en_savoir_plus: "Find out more", soutenir: "Support the campaign" };

/** Les 14 régions administratives du Sénégal. */
export const senegalRegions = [
  "Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda",
  "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor",
] as const;

export const imageRights = {
  aucune_personne: "Aucune personne reconnaissable sur l'image",
  autorisations: "Les personnes reconnaissables (et les parents ou tuteurs des mineurs) ont donné leur accord écrit",
} as const;
export type ImageRights = keyof typeof imageRights;

export type ImageRef = { mediaId: string; alt: string; caption: string; rights: ImageRights };
export type DocumentRef = { mediaId: string; title: string };
export type Step = { date: string; time: string; title: string; details: string };
export type Zone = { region: string; departement: string; commune: string; localite: string };
export type Schedule =
  | { kind: "a_definir" }
  | { kind: "ponctuel"; date: string; time: string; duration: string }
  | { kind: "periode"; startDate: string; endDate: string };
export type Budget = {
  planned: number | null;
  collected: number | null;
  spent: number | null;
  /** Montants vérifiés et validés par un administrateur : seule condition pour les afficher. */
  validated: boolean;
  validatedAt: string | null;
  validatedBy: string | null;
};
export type Cta = { kind: CtaKind; label: string; url: string };

/** Données saisies dans le formulaire. */
export type FicheInput = {
  title: string;
  summary: string;
  description: string;
  type: FicheType;
  domain: string;
  zone: Zone;
  schedule: Schedule;
  steps: Step[];
  budget: { planned: number | null; collected: number | null; spent: number | null; validated: boolean };
  status: FicheStatus;
  mainImage: ImageRef | null;
  gallery: ImageRef[];
  documents: DocumentRef[];
  cta: Cta;
};

/** Fiche enregistrée. */
export type FicheData = Omit<FicheInput, "budget"> & {
  slug: string;
  budget: Budget;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** Date de première publication (sert à interdire la suppression d'une fiche déjà publiée). */
  firstPublishedAt: string | null;
  createdBy: { id: string; name: string };
  updatedBy: { id: string; name: string };
};
export type Fiche = FicheData & { id: string; version: number };

export const LIMITS = {
  title: 140,
  summary: 320,
  description: 12000,
  steps: 40,
  gallery: 12,
  documents: 10,
  alt: 200,
  caption: 240,
};

export function emptyFicheInput(): FicheInput {
  return {
    title: "",
    summary: "",
    description: "",
    type: "activite",
    domain: "",
    zone: { region: "", departement: "", commune: "", localite: "" },
    schedule: { kind: "a_definir" },
    steps: [],
    budget: { planned: null, collected: null, spent: null, validated: false },
    status: "brouillon",
    mainImage: null,
    gallery: [],
    documents: [],
    cta: { kind: "aucun", label: "", url: "" },
  };
}

/* ---------------- Règles d'affichage ---------------- */

/** Une fiche n'est visible du public que publiée ET dans un statut publiable. */
export function isPublic(f: Pick<FicheData, "publishedAt" | "status">) {
  return f.publishedAt !== null && publishableStatuses.includes(f.status);
}

/** Dernier jour concerné par la fiche (AAAA-MM-JJ), ou null si les dates ne sont pas fixées. */
export function endDay(s: Schedule): string | null {
  if (s.kind === "ponctuel") return s.date || null;
  if (s.kind === "periode") return s.endDate || s.startDate || null;
  return null;
}
export function startDay(s: Schedule): string | null {
  if (s.kind === "ponctuel") return s.date || null;
  if (s.kind === "periode") return s.startDate || null;
  return null;
}

/** Date du jour au Sénégal (UTC+0, sans heure d'été). */
export function todaySenegal(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/** Les dates de la fiche sont-elles passées ? */
export function isPast(f: Pick<FicheData, "schedule">, today = todaySenegal()) {
  const end = endDay(f.schedule);
  return end !== null && end < today;
}

export type Timing = "passe" | "en_cours" | "a_venir" | "non_date";
export function timing(f: Pick<FicheData, "schedule" | "status">, today = todaySenegal()): Timing {
  if (f.status === "termine" || isPast(f, today)) return "passe";
  const start = startDay(f.schedule);
  if (start === null) return f.status === "en_cours" ? "en_cours" : "non_date";
  if (start > today) return "a_venir";
  return "en_cours";
}

/** Les montants ne sont affichés que s'ils ont été validés par un administrateur. */
export function publishedBudget(b: Budget) {
  if (!b.validated) return null;
  if (b.planned === null && b.collected === null && b.spent === null) return null;
  return b;
}

export function placeLabel(z: Zone) {
  return [z.localite, z.commune, z.departement, z.region].map((s) => s.trim()).filter(Boolean).join(", ");
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70)
      .replace(/-+$/g, "") || "fiche"
  );
}

/** Adresse du bouton d'appel à l'action. */
export function ctaHref(f: Pick<FicheData, "cta" | "title"> & { slug?: string }) {
  if (f.cta.kind === "aucun") return null;
  if (f.cta.url) return f.cta.url;
  const sujet = encodeURIComponent(f.title.slice(0, 100));
  switch (f.cta.kind) {
    case "benevole":
      return `/contact?type=benevolat&sujet=${sujet}`;
    case "soutenir":
      return f.slug ? `/faire-un-don?campagne=${encodeURIComponent(f.slug)}` : `/faire-un-don`;
    case "participer":
    case "en_savoir_plus":
    default:
      return `/contact?type=general&sujet=${sujet}`;
  }
}

export function ctaLabel(f: Pick<FicheData, "cta">, locale: "fr" | "en" = "fr") {
  return f.cta.label.trim() || (locale === "en" ? ctaKindsEn : ctaKinds)[f.cta.kind];
}
