import { timingSafeEqual } from "node:crypto";
import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { adminReady, openSession } from "@/lib/auth/session";
import { countUsers, createUser } from "@/lib/auth/users";
import { getSetupToken } from "@/lib/env";
import { clientIp, isJson, isSameOrigin, jsonError, logEvent, rateLimit } from "@/lib/security";
import { cleanText, isEmail } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Création du PREMIER compte administrateur.
 * Possible uniquement si aucun compte n'existe ET avec le code ADMIN_SETUP_TOKEN
 * défini dans les variables d'environnement de l'hébergeur.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, "Requête refusée.");
  if (!adminReady()) return jsonError(503, "L'espace d'administration n'est pas encore configuré.");
  if (!rateLimit(`setup:${clientIp(request)}`, 5, 15 * 60_000)) return jsonError(429, "Trop de tentatives. Patientez 15 minutes.");
  const expected = getSetupToken();
  if (!expected) return jsonError(403, "Installation fermée : la variable ADMIN_SETUP_TOKEN n'est pas définie.");
  if ((await countUsers()) > 0) return jsonError(409, "Un administrateur existe déjà. Connectez-vous.");

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const token = typeof body?.token === "string" ? body.token : "";
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    logEvent("admin.installation.code_invalide");
    return jsonError(403, "Code d'installation incorrect.");
  }

  const errors: Record<string, string> = {};
  const name = cleanText(body?.name, 80);
  const email = cleanText(body?.email, 254).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  if (name.length < 2) errors.name = "Indiquez votre nom.";
  if (!isEmail(email)) errors.email = "Adresse e-mail invalide.";
  const pb = passwordProblem(password);
  if (pb) errors.password = pb;
  if (Object.keys(errors).length) return jsonError(422, "Merci de vérifier les champs signalés.", errors);

  // Seconde vérification juste avant l'écriture.
  if ((await countUsers()) > 0) return jsonError(409, "Un administrateur existe déjà. Connectez-vous.");
  const user = await createUser({ email, name, role: "admin", passwordHash: await hashPassword(password) });
  await audit(user, "installation", { id: user.id, label: user.name });
  await openSession(user);
  return Response.json({ ok: true });
}
