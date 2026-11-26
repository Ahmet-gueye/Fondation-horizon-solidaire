import { apiUser } from "@/lib/auth/session";
import { VersionConflict } from "@/lib/db/docstore";
import { FicheError, allowedDomains, applyAction, deleteFiche, getFiche, updateFiche, type FicheAction } from "@/lib/fiches/repo";
import { validateFicheInput } from "@/lib/fiches/validate";
import { isJson, jsonError, logEvent } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function fail(err: unknown, what: string) {
  if (err instanceof VersionConflict) return jsonError(409, "Cette fiche a été modifiée par quelqu'un d'autre entre-temps. Rechargez la page avant de recommencer.");
  if (err instanceof FicheError) return jsonError(err.status, err.message, err.errors);
  logEvent(`fiche.${what}.erreur`, { message: (err as Error).message });
  return jsonError(500, "L'opération a échoué. Réessayez.");
}

/** Modification du contenu. */
export async function PUT(request: Request, { params }: Ctx) {
  const user = await apiUser(request, "fiche.modifier_non_publiee");
  if (user instanceof Response) return user;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  const fiche = await getFiche((await params).id);
  if (!fiche) return jsonError(404, "Fiche introuvable.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const version = Number(body?.version);
  if (!Number.isInteger(version)) return jsonError(400, "Version manquante. Rechargez la page.");
  const result = validateFicheInput(body?.fiche, { domains: allowedDomains() });
  if (!result.ok) return jsonError(422, "Merci de vérifier les champs signalés.", result.errors);
  try {
    const saved = await updateFiche(user, fiche, result.data, version);
    return Response.json({ ok: true, version: saved.version });
  } catch (err) {
    return fail(err, "modification");
  }
}

/** Publier, retirer de la publication, archiver, sortir des archives. */
export async function POST(request: Request, { params }: Ctx) {
  const user = await apiUser(request);
  if (user instanceof Response) return user;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  const fiche = await getFiche((await params).id);
  if (!fiche) return jsonError(404, "Fiche introuvable.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action as FicheAction;
  if (!["publier", "depublier", "archiver", "desarchiver"].includes(action)) return jsonError(400, "Action inconnue.");
  const version = Number(body?.version);
  if (!Number.isInteger(version)) return jsonError(400, "Version manquante. Rechargez la page.");
  try {
    const saved = await applyAction(user, fiche, action, version);
    return Response.json({ ok: true, version: saved.version });
  } catch (err) {
    return fail(err, "action");
  }
}

/** Suppression définitive (fiche jamais publiée), avec confirmation du titre. */
export async function DELETE(request: Request, { params }: Ctx) {
  const user = await apiUser(request, "fiche.supprimer");
  if (user instanceof Response) return user;
  const fiche = await getFiche((await params).id);
  if (!fiche) return jsonError(404, "Fiche introuvable.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (body?.confirm !== "SUPPRIMER") return jsonError(400, "Confirmation manquante.");
  try {
    await deleteFiche(user, fiche);
    return Response.json({ ok: true });
  } catch (err) {
    return fail(err, "suppression");
  }
}
