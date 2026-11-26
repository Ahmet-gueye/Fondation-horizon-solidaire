import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { databaseKind } from "@/lib/db/docstore";
import { getAuthSecret } from "@/lib/env";
import { isSameOrigin, jsonError } from "@/lib/security";
import { can, type Permission } from "./roles";
import { createToken, readToken } from "./token";
import { getUser, type User } from "./users";

export const SESSION_COOKIE = "fhs_admin";
const SESSION_HOURS = 8;

/** L'espace d'administration est-il utilisable (secret et base de données configurés) ? */
export function adminReady() {
  return Boolean(getAuthSecret()) && databaseKind() !== null;
}

export async function openSession(user: User) {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET manquant");
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createToken({ uid: user.id, sv: user.sessionVersion, exp }, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
    priority: "high",
  });
}

export async function closeSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Compte connecté, ou null (cookie absent, invalide, expiré, compte désactivé…). */
export async function currentUser(): Promise<User | null> {
  const secret = getAuthSecret();
  if (!secret || databaseKind() === null) return null;
  const jar = await cookies();
  const payload = readToken(jar.get(SESSION_COOKIE)?.value, secret);
  if (!payload) return null;
  try {
    const user = await getUser(payload.uid);
    if (!user || !user.active || user.sessionVersion !== payload.sv) return null;
    return user;
  } catch {
    return null;
  }
}

/** Pour les pages d'administration : redirige vers la connexion si besoin. */
export async function requireUser(permission?: Permission): Promise<User> {
  if (!adminReady()) redirect("/admin/configuration");
  const user = await currentUser();
  if (!user) redirect("/admin/connexion");
  if (permission && !can(user.role, permission)) redirect("/admin?refus=1");
  return user;
}

/**
 * Pour les routes d'API d'administration : vérifie l'origine (anti-CSRF),
 * la session et, si demandé, un droit précis. Renvoie le compte ou une réponse d'erreur.
 */
export async function apiUser(request: Request, permission?: Permission): Promise<User | Response> {
  if (request.method !== "GET" && !isSameOrigin(request)) return jsonError(403, "Requête refusée.");
  if (!adminReady()) return jsonError(503, "L'espace d'administration n'est pas encore configuré.");
  const user = await currentUser();
  if (!user) return jsonError(401, "Votre session a expiré. Reconnectez-vous.");
  if (permission && !can(user.role, permission)) return jsonError(403, "Votre rôle ne permet pas cette action.");
  return user;
}
