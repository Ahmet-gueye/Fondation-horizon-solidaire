import { closeSession, adminReady, openSession } from "@/lib/auth/session";
import { dummyVerify, verifyPassword } from "@/lib/auth/password";
import { getUserByEmail, saveUser } from "@/lib/auth/users";
import { clientIp, isJson, isSameOrigin, jsonError, logEvent, rateLimit } from "@/lib/security";
import { cleanText } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Connexion à l'espace d'administration. */
export async function POST(request: Request) {
  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, "Requête refusée.");
  if (!adminReady()) return jsonError(503, "L'espace d'administration n'est pas encore configuré.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = cleanText(body?.email, 254).toLowerCase();
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";

  const ip = clientIp(request);
  if (!rateLimit(`login-ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`login-mail:${email}`, 5, 15 * 60_000)) {
    return jsonError(429, "Trop de tentatives. Patientez 15 minutes avant de réessayer.");
  }

  const user = email ? await getUserByEmail(email) : null;
  const ok = user && user.active ? await verifyPassword(password, user.passwordHash) : await dummyVerify();
  if (!user || !ok || !user.active) {
    logEvent("admin.connexion.echec");
    return jsonError(401, "Adresse e-mail ou mot de passe incorrect.");
  }
  const fresh = await saveUser(user, { lastLoginAt: new Date().toISOString() }).catch(() => user);
  await openSession(fresh);
  logEvent("admin.connexion", { role: user.role });
  return Response.json({ ok: true });
}

/** Déconnexion. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, "Requête refusée.");
  await closeSession();
  return Response.json({ ok: true });
}
