import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { isRole, roleLabels } from "@/lib/auth/roles";
import { apiUser } from "@/lib/auth/session";
import { getUser, listUsers, saveUser, type UserData } from "@/lib/auth/users";
import { VersionConflict } from "@/lib/db/docstore";
import { isJson, jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Modifier le rôle, activer/désactiver, ou définir un nouveau mot de passe provisoire. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiUser(request, "comptes.gerer");
  if (admin instanceof Response) return admin;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  const target = await getUser((await params).id);
  if (!target) return jsonError(404, "Compte introuvable.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const changes: Partial<UserData> = {};
  const notes: string[] = [];
  if (body?.role !== undefined) {
    if (!isRole(body.role)) return jsonError(422, "Rôle invalide.");
    changes.role = body.role;
    notes.push(`rôle : ${roleLabels[body.role]}`);
  }
  if (body?.active !== undefined) {
    changes.active = body.active === true;
    notes.push(changes.active ? "compte réactivé" : "compte désactivé");
  }
  if (body?.password !== undefined) {
    const pb = passwordProblem(body.password);
    if (pb) return jsonError(422, pb, { password: pb });
    changes.passwordHash = await hashPassword(body.password as string);
    notes.push("nouveau mot de passe provisoire");
  }
  if (!notes.length) return jsonError(400, "Aucune modification.");
  if (changes.active === false || changes.passwordHash || changes.role) changes.sessionVersion = target.sessionVersion + 1;

  // Garde-fou : il doit toujours rester au moins un administrateur actif.
  const losesAdmin = target.role === "admin" && target.active && (changes.active === false || (changes.role && changes.role !== "admin"));
  if (losesAdmin) {
    const activeAdmins = (await listUsers()).filter((u) => u.role === "admin" && u.active);
    if (activeAdmins.length <= 1) return jsonError(409, "Il doit rester au moins un administrateur actif.");
  }
  try {
    await saveUser(target, changes);
  } catch (err) {
    if (err instanceof VersionConflict) return jsonError(409, "Ce compte vient d'être modifié. Rechargez la page.");
    throw err;
  }
  await audit(admin, changes.passwordHash ? "compte.mot_de_passe" : "compte.modification", { id: target.id, label: target.name }, notes.join(", "));
  return Response.json({ ok: true });
}
