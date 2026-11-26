import {
  LIMITS,
  ctaKinds,
  editableStatuses,
  ficheTypes,
  imageRights,
  type CtaKind,
  type DocumentRef,
  type FicheInput,
  type FicheStatus,
  type FicheType,
  type ImageRef,
  type ImageRights,
  type Schedule,
  type Step,
} from "./model.ts";

/**
 * Validation SERVEUR des fiches (module pur, testé avec `npm test`).
 * Tout ce qui vient du navigateur est considéré comme non fiable.
 */

export type FieldErrors = Record<string, string>;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL, "").replace(/\r\n?/g, "\n").trim().slice(0, max);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MEDIA_RE = /^[a-z0-9-]{10,40}$/;

export function isValidDate(s: string) {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s && s >= "2000-01-01" && s <= "2100-12-31";
}

function amount(value: unknown, key: string, errors: FieldErrors): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/[\s ]/g, ""));
  if (!Number.isInteger(n) || n < 0 || n > 100_000_000_000) {
    errors[key] = "Indiquez un montant entier positif en FCFA.";
    return null;
  }
  return n;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/** Lien du bouton : chemin interne (« /contact ») ou adresse https. */
export function safeUrl(value: string) {
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function imageRef(raw: unknown, key: string, errors: FieldErrors): ImageRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const mediaId = typeof r.mediaId === "string" && MEDIA_RE.test(r.mediaId) ? r.mediaId : null;
  if (!mediaId) {
    errors[key] = "Image invalide. Importez-la de nouveau.";
    return null;
  }
  const alt = text(r.alt, LIMITS.alt);
  const caption = text(r.caption, LIMITS.caption);
  const rights = oneOf<ImageRights>(r.rights, Object.keys(imageRights) as ImageRights[]);
  if (alt.length < 5) errors[`${key}.alt`] = "Décrivez l'image en quelques mots (texte alternatif, 5 caractères minimum).";
  if (!rights) errors[`${key}.rights`] = "Confirmez les autorisations liées à cette image.";
  return { mediaId, alt, caption, rights: rights ?? "aucune_personne" };
}

export type ValidateOptions = { domains: string[] };

export function validateFicheInput(body: unknown, opts: ValidateOptions): { ok: true; data: FicheInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const title = text(b.title, LIMITS.title);
  if (title.length < 3) errors.title = "Indiquez un titre (3 caractères minimum).";
  const summary = text(b.summary, LIMITS.summary);
  if (summary.length < 10) errors.summary = "Rédigez un résumé (10 caractères minimum).";
  const description = text(b.description, LIMITS.description);

  const type = oneOf<FicheType>(b.type, Object.keys(ficheTypes) as FicheType[]);
  if (!type) errors.type = "Choisissez le type de contenu.";

  const domain = text(b.domain, 60);
  if (!opts.domains.includes(domain)) errors.domain = "Choisissez le domaine d'action.";

  const z = (b.zone && typeof b.zone === "object" ? b.zone : {}) as Record<string, unknown>;
  const zone = { region: text(z.region, 80), departement: text(z.departement, 80), commune: text(z.commune, 80), localite: text(z.localite, 120) };

  const s = (b.schedule && typeof b.schedule === "object" ? b.schedule : {}) as Record<string, unknown>;
  let schedule: Schedule = { kind: "a_definir" };
  if (s.kind === "ponctuel") {
    const date = text(s.date, 10);
    const time = text(s.time, 5);
    const duration = text(s.duration, 60);
    if (!isValidDate(date)) errors["schedule.date"] = "Indiquez une date valide.";
    if (time && !TIME_RE.test(time)) errors["schedule.time"] = "Heure invalide (format HH:MM).";
    schedule = { kind: "ponctuel", date, time, duration };
  } else if (s.kind === "periode") {
    const startDate = text(s.startDate, 10);
    const endDate = text(s.endDate, 10);
    if (!isValidDate(startDate)) errors["schedule.startDate"] = "Indiquez une date de début valide.";
    if (endDate && !isValidDate(endDate)) errors["schedule.endDate"] = "Date de fin invalide.";
    else if (endDate && isValidDate(startDate) && endDate < startDate) errors["schedule.endDate"] = "La date de fin doit suivre la date de début.";
    schedule = { kind: "periode", startDate, endDate };
  }

  const rawSteps = Array.isArray(b.steps) ? b.steps.slice(0, LIMITS.steps) : [];
  const steps: Step[] = [];
  rawSteps.forEach((raw, i) => {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const step = { date: text(r.date, 10), time: text(r.time, 5), title: text(r.title, 160), details: text(r.details, 600) };
    if (!step.title && !step.date && !step.details) return; // ligne vide ignorée
    if (!step.title) errors[`steps.${i}.title`] = "Donnez un intitulé à cette étape.";
    if (step.date && !isValidDate(step.date)) errors[`steps.${i}.date`] = "Date invalide.";
    if (step.time && !TIME_RE.test(step.time)) errors[`steps.${i}.time`] = "Heure invalide (HH:MM).";
    steps.push(step);
  });

  const bu = (b.budget && typeof b.budget === "object" ? b.budget : {}) as Record<string, unknown>;
  const budget = {
    planned: amount(bu.planned, "budget.planned", errors),
    collected: amount(bu.collected, "budget.collected", errors),
    spent: amount(bu.spent, "budget.spent", errors),
    validated: bu.validated === true,
  };

  const status = oneOf<FicheStatus>(b.status, editableStatuses) ?? "brouillon";

  const mainImage = b.mainImage ? imageRef(b.mainImage, "mainImage", errors) : null;
  const gallery: ImageRef[] = [];
  (Array.isArray(b.gallery) ? b.gallery.slice(0, LIMITS.gallery) : []).forEach((g, i) => {
    const ref = imageRef(g, `gallery.${i}`, errors);
    if (ref) gallery.push(ref);
  });
  const documents: DocumentRef[] = [];
  (Array.isArray(b.documents) ? b.documents.slice(0, LIMITS.documents) : []).forEach((d, i) => {
    const r = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
    const mediaId = typeof r.mediaId === "string" && MEDIA_RE.test(r.mediaId) ? r.mediaId : null;
    const docTitle = text(r.title, 140);
    if (!mediaId) errors[`documents.${i}`] = "Document invalide. Importez-le de nouveau.";
    else if (docTitle.length < 3) errors[`documents.${i}.title`] = "Donnez un titre au document.";
    if (mediaId) documents.push({ mediaId, title: docTitle });
  });
  const ids = [mainImage?.mediaId, ...gallery.map((g) => g.mediaId), ...documents.map((d) => d.mediaId)].filter(Boolean);
  if (new Set(ids).size !== ids.length) errors.media = "Un même fichier est utilisé deux fois.";

  const c = (b.cta && typeof b.cta === "object" ? b.cta : {}) as Record<string, unknown>;
  const kind = oneOf<CtaKind>(c.kind, Object.keys(ctaKinds) as CtaKind[]) ?? "aucun";
  const url = safeUrl(text(c.url, 300));
  if (url === null) errors["cta.url"] = "Lien invalide : utilisez une adresse commençant par https:// ou par / (page du site).";
  const cta = { kind, label: text(c.label, 40), url: kind === "aucun" ? "" : url ?? "" };

  if (Object.keys(errors).length > 0 || !type) return { ok: false, errors };
  return { ok: true, data: { title, summary, description, type, domain, zone, schedule, steps, budget, status, mainImage, gallery, documents, cta } };
}

/** Conditions supplémentaires pour publier une fiche. */
export function publicationProblems(f: Pick<FicheInput, "status" | "description" | "zone" | "schedule">): string[] {
  const problems: string[] = [];
  if (f.status === "brouillon") problems.push("Choisissez un statut (planifié, en cours ou terminé) : un brouillon ne peut pas être publié.");
  if (f.description.trim().length < 30) problems.push("Rédigez une description détaillée (30 caractères minimum).");
  if (!f.zone.region && !f.zone.commune && !f.zone.localite) problems.push("Indiquez la zone d'intervention (au moins la région ou la commune).");
  if (f.schedule.kind === "a_definir") problems.push("Indiquez la date ou la période.");
  return problems;
}
