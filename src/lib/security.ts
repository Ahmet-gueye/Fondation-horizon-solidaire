import "server-only";
import { getSiteUrl } from "./env";

/**
 * Protection contre les requêtes falsifiées (CSRF) : les formulaires du site
 * envoient du JSON via `fetch`. On refuse toute requête dont l'origine n'est pas
 * le site lui-même. (Les navigateurs envoient toujours l'en-tête Origin sur un POST.)
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set<string>([new URL(getSiteUrl()).origin]);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? (getSiteUrl().startsWith("https") ? "https" : "http");
  if (host) allowed.add(`${proto}://${host}`);
  return allowed.has(origin);
}

export function isJson(request: Request) {
  return (request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");
}

export function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "inconnu";
}

/**
 * Limiteur de débit simple en mémoire (fenêtre glissante par clé).
 * Suffisant pour un serveur unique ; derrière plusieurs instances,
 * préférer une limite au niveau de l'hébergeur ou d'un pare-feu applicatif.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return true;
}

/**
 * Anti-spam discret : un champ caché (« pot de miel ») qui doit rester vide,
 * et un délai minimal entre l'affichage du formulaire et son envoi.
 */
export function looksLikeSpam(body: Record<string, unknown>, minDelayMs = 2500) {
  if (typeof body.website === "string" && body.website.trim() !== "") return true;
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt)) return true;
  const elapsed = Date.now() - startedAt;
  return elapsed < minDelayMs || elapsed > 1000 * 60 * 60 * 24;
}

export function jsonError(status: number, message: string, errors?: Record<string, string>) {
  return Response.json({ ok: false, message, ...(errors ? { errors } : {}) }, { status });
}

/** Journal sans données personnelles. */
export function logEvent(event: string, details: Record<string, string | number | boolean | null | undefined> = {}) {
  console.info(JSON.stringify({ at: new Date().toISOString(), event, ...details }));
}
