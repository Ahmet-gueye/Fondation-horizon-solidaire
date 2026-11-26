import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton de session signé (HMAC-SHA256 avec AUTH_SECRET), stocké dans un cookie HttpOnly.
 * Il ne contient aucun secret : seulement l'identifiant du compte, un numéro de session
 * (pour pouvoir déconnecter partout) et une date d'expiration.
 */

export type SessionPayload = { uid: string; sv: number; exp: number };

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(payload: SessionPayload, secret: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function readToken(token: string | undefined | null, secret: string, now = Date.now()): SessionPayload | null {
  if (!token || typeof token !== "string" || token.length > 600) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = Buffer.from(sign(data, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionPayload;
    if (typeof p.uid !== "string" || typeof p.sv !== "number" || typeof p.exp !== "number") return null;
    if (p.exp <= now) return null;
    return p;
  } catch {
    return null;
  }
}
