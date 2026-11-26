import { apiUser } from "@/lib/auth/session";
import { FicheError, allowedDomains, createFiche } from "@/lib/fiches/repo";
import { validateFicheInput } from "@/lib/fiches/validate";
import { isJson, jsonError, logEvent } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Création d'une fiche (toujours non publiée). */
export async function POST(request: Request) {
  const user = await apiUser(request, "fiche.creer");
  if (user instanceof Response) return user;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  const body = await request.json().catch(() => null);
  const result = validateFicheInput(body, { domains: allowedDomains() });
  if (!result.ok) return jsonError(422, "Merci de vérifier les champs signalés.", result.errors);
  try {
    const fiche = await createFiche(user, result.data);
    return Response.json({ ok: true, id: fiche.id });
  } catch (err) {
    if (err instanceof FicheError) return jsonError(err.status, err.message, err.errors);
    logEvent("fiche.creation.erreur", { message: (err as Error).message });
    return jsonError(500, "L'enregistrement a échoué. Réessayez.");
  }
}
