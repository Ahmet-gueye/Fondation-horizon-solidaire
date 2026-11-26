import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { apiUser, openSession } from "@/lib/auth/session";
import { saveUser } from "@/lib/auth/users";
import { isJson, jsonError, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Changement de son propre mot de passe (déconnecte les autres appareils). */
export async function POST(request: Request) {
  const user = await apiUser(request);
  if (user instanceof Response) return user;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  if (!rateLimit(`pwd:${user.id}`, 5, 15 * 60_000)) return jsonError(429, "Trop de tentatives. Patientez 15 minutes.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const current = typeof body?.current === "string" ? body.current : "";
  const next = typeof body?.next === "string" ? body.next : "";
  if (!(await verifyPassword(current, user.passwordHash))) return jsonError(422, "Mot de passe actuel incorrect.", { current: "Mot de passe actuel incorrect." });
  const pb = passwordProblem(next);
  if (pb) return jsonError(422, pb, { next: pb });
  if (next === current) return jsonError(422, "Choisissez un mot de passe différent de l'actuel.", { next: "Identique à l'actuel." });
  const saved = await saveUser(user, { passwordHash: await hashPassword(next), sessionVersion: user.sessionVersion + 1 });
  await openSession(saved);
  await audit(user, "compte.mot_de_passe", { id: user.id, label: user.name });
  return Response.json({ ok: true });
}
