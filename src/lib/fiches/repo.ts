import "server-only";
import { randomUUID } from "node:crypto";
import { audit } from "@/lib/audit";
import { can } from "@/lib/auth/roles";
import type { User } from "@/lib/auth/users";
import { StorageNotConfigured, getStore } from "@/lib/db/docstore";
import { getPublicProgrammes } from "@/content/programmes";
import { logEvent } from "@/lib/security";
import { attachMedia, deleteMedia, getMedia } from "./media";
import { isPublic, publishableStatuses, slugify, timing, type Fiche, type FicheData, type FicheInput } from "./model";
import { publicationProblems, type FieldErrors } from "./validate";

const C = "fiches";

export class FicheError extends Error {
  constructor(message: string, public status = 400, public errors?: FieldErrors) {
    super(message);
  }
}

export function allowedDomains() {
  return getPublicProgrammes().map((p) => p.slug);
}

export async function listFiches(): Promise<Fiche[]> {
  const rows = await getStore().list<FicheData>(C);
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getFiche(id: string) {
  if (!/^[a-z0-9-]{10,40}$/.test(id)) return null;
  return getStore().get<FicheData>(C, id);
}

/**
 * Fiches visibles du public, triées : en cours et à venir d'abord (par date), puis passées.
 * Si aucune base n'est configurée, renvoie une liste vide (le site reste consultable).
 */
export async function listPublicFiches(): Promise<Fiche[]> {
  let rows: Fiche[];
  try {
    rows = await getStore().list<FicheData>(C);
  } catch (err) {
    if (!(err instanceof StorageNotConfigured)) logEvent("fiches.lecture.erreur", { message: (err as Error).message });
    return [];
  }
  const order = { en_cours: 0, a_venir: 1, non_date: 2, passe: 3 } as const;
  return rows
    .filter(isPublic)
    .sort((a, b) => {
      const ta = order[timing(a)];
      const tb = order[timing(b)];
      if (ta !== tb) return ta - tb;
      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    });
}

export async function getPublicFicheBySlug(slug: string) {
  return (await listPublicFiches()).find((f) => f.slug === slug) ?? null;
}

async function uniqueSlug(title: string, exceptId?: string) {
  const base = slugify(title);
  const taken = new Set((await getStore().list<FicheData>(C)).filter((f) => f.id !== exceptId).map((f) => f.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 500; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${randomUUID().slice(0, 6)}`;
}

function mediaIds(input: Pick<FicheInput, "mainImage" | "gallery" | "documents">) {
  return {
    images: [input.mainImage?.mediaId, ...input.gallery.map((g) => g.mediaId)].filter((x): x is string => Boolean(x)),
    documents: input.documents.map((d) => d.mediaId),
  };
}

/** Vérifie que chaque fichier référencé existe, est du bon type et n'appartient pas à une autre fiche. */
async function checkMedia(input: FicheInput, ficheId: string) {
  const { images, documents } = mediaIds(input);
  const all = [...images.map((id) => ({ id, kind: "image" as const })), ...documents.map((id) => ({ id, kind: "document" as const }))];
  const found = [];
  for (const ref of all) {
    const m = await getMedia(ref.id);
    if (!m || m.kind !== ref.kind || (m.ficheId !== null && m.ficheId !== ficheId)) {
      throw new FicheError("Un fichier joint est introuvable. Importez-le de nouveau.", 422, { media: "Fichier introuvable." });
    }
    found.push(m);
  }
  return found;
}

async function syncMedia(before: FicheInput | null, after: FicheInput, ficheId: string, attached: Awaited<ReturnType<typeof checkMedia>>) {
  for (const m of attached) await attachMedia(m, ficheId);
  if (!before) return;
  const keep = new Set([...mediaIds(after).images, ...mediaIds(after).documents]);
  const old = [...mediaIds(before).images, ...mediaIds(before).documents].filter((id) => !keep.has(id));
  for (const id of old) {
    const m = await getMedia(id);
    if (m && m.ficheId === ficheId) await deleteMedia(m);
  }
}

function nextBudget(user: User, input: FicheInput, previous: FicheData["budget"] | null): FicheData["budget"] {
  const sameAmounts =
    previous !== null && previous.planned === input.budget.planned && previous.collected === input.budget.collected && previous.spent === input.budget.spent;
  if (can(user.role, "budget.valider")) {
    if (!input.budget.validated) return { planned: input.budget.planned, collected: input.budget.collected, spent: input.budget.spent, validated: false, validatedAt: null, validatedBy: null };
    if (sameAmounts && previous?.validated) return previous;
    return { planned: input.budget.planned, collected: input.budget.collected, spent: input.budget.spent, validated: true, validatedAt: new Date().toISOString(), validatedBy: user.name };
  }
  // Un éditeur ne peut pas valider : toute modification des montants annule une validation antérieure.
  if (sameAmounts && previous) return previous;
  return { planned: input.budget.planned, collected: input.budget.collected, spent: input.budget.spent, validated: false, validatedAt: null, validatedBy: null };
}

export async function createFiche(user: User, input: FicheInput) {
  const id = randomUUID();
  const attached = await checkMedia(input, id);
  const now = new Date().toISOString();
  const budget = nextBudget(user, input, null);
  const data: FicheData = {
    ...input,
    budget,
    slug: await uniqueSlug(input.title),
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    firstPublishedAt: null,
    createdBy: { id: user.id, name: user.name },
    updatedBy: { id: user.id, name: user.name },
  };
  const fiche = await getStore().insert<FicheData>(C, id, data);
  await syncMedia(null, input, id, attached);
  await audit(user, "fiche.creation", { id, label: input.title });
  if (budget.validated) await audit(user, "budget.validation", { id, label: input.title });
  return fiche;
}

export function canEdit(user: User, fiche: Fiche) {
  if (fiche.status === "archive") return false;
  return fiche.publishedAt ? can(user.role, "fiche.modifier_publiee") : can(user.role, "fiche.modifier_non_publiee");
}

export async function updateFiche(user: User, fiche: Fiche, input: FicheInput, expectedVersion: number) {
  if (!canEdit(user, fiche)) {
    throw new FicheError(
      fiche.status === "archive"
        ? "Cette fiche est archivée : sortez-la des archives avant de la modifier."
        : "Seul un administrateur peut modifier une fiche déjà publiée.",
      403,
    );
  }
  if (fiche.publishedAt) {
    const problems = publicationProblems(input);
    if (problems.length) throw new FicheError(`Cette fiche est en ligne : ${problems[0]}`, 422);
  }
  const attached = await checkMedia(input, fiche.id);
  const budget = nextBudget(user, input, fiche.budget);
  const { id, version: _v, ...current } = fiche;
  const data: FicheData = {
    ...current,
    ...input,
    budget,
    // L'adresse publique reste stable une fois la fiche publiée.
    slug: fiche.firstPublishedAt ? fiche.slug : await uniqueSlug(input.title, id),
    updatedAt: new Date().toISOString(),
    updatedBy: { id: user.id, name: user.name },
  };
  const saved = await getStore().update<FicheData>(C, id, data, expectedVersion);
  await syncMedia(fiche, input, id, attached);
  await audit(user, "fiche.modification", { id, label: input.title });
  if (budget.validated && budget.validatedAt !== fiche.budget.validatedAt) await audit(user, "budget.validation", { id, label: input.title });
  return saved;
}

export type FicheAction = "publier" | "depublier" | "archiver" | "desarchiver";

export async function applyAction(user: User, fiche: Fiche, action: FicheAction, expectedVersion: number) {
  const now = new Date().toISOString();
  const { id, version: _v, ...data } = fiche;
  let next: FicheData;
  switch (action) {
    case "publier": {
      if (!can(user.role, "fiche.publier")) throw new FicheError("Seul un administrateur peut publier.", 403);
      if (fiche.status === "archive") throw new FicheError("Sortez d'abord la fiche des archives.", 409);
      const problems = publicationProblems(fiche);
      if (!publishableStatuses.includes(fiche.status) && !problems.length) problems.push("Statut incompatible avec une publication.");
      if (problems.length) throw new FicheError(problems.join(" "), 422);
      next = { ...data, publishedAt: now, firstPublishedAt: fiche.firstPublishedAt ?? now, updatedAt: now, updatedBy: { id: user.id, name: user.name } };
      break;
    }
    case "depublier":
      if (!can(user.role, "fiche.publier")) throw new FicheError("Seul un administrateur peut retirer une publication.", 403);
      next = { ...data, publishedAt: null, updatedAt: now, updatedBy: { id: user.id, name: user.name } };
      break;
    case "archiver":
      if (!can(user.role, "fiche.archiver")) throw new FicheError("Seul un administrateur peut archiver.", 403);
      next = { ...data, status: "archive", publishedAt: null, updatedAt: now, updatedBy: { id: user.id, name: user.name } };
      break;
    case "desarchiver":
      if (!can(user.role, "fiche.archiver")) throw new FicheError("Seul un administrateur peut sortir une fiche des archives.", 403);
      if (fiche.status !== "archive") throw new FicheError("Cette fiche n'est pas archivée.", 409);
      // La fiche revient en brouillon, non publiée : il faudra la relire puis la republier.
      next = { ...data, status: "brouillon", publishedAt: null, updatedAt: now, updatedBy: { id: user.id, name: user.name } };
      break;
  }
  const saved = await getStore().update<FicheData>(C, id, next, expectedVersion);
  const labels = { publier: "fiche.publication", depublier: "fiche.depublication", archiver: "fiche.archivage", desarchiver: "fiche.desarchivage" } as const;
  await audit(user, labels[action], { id, label: fiche.title });
  return saved;
}

/** Suppression définitive : réservée aux fiches JAMAIS publiées. Les autres s'archivent. */
export async function deleteFiche(user: User, fiche: Fiche) {
  if (!can(user.role, "fiche.supprimer")) throw new FicheError("Seul un administrateur peut supprimer une fiche.", 403);
  if (fiche.firstPublishedAt) throw new FicheError("Cette fiche a déjà été publiée : archivez-la plutôt que de la supprimer.", 409);
  const { images, documents } = mediaIds(fiche);
  for (const mid of [...images, ...documents]) {
    const m = await getMedia(mid);
    if (m && m.ficheId === fiche.id) await deleteMedia(m);
  }
  await getStore().remove(C, fiche.id);
  await audit(user, "fiche.suppression", { id: fiche.id, label: fiche.title });
}
