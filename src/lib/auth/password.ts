import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Hachage des mots de passe avec scrypt (module natif de Node.js).
 * Format stocké : scrypt$N$r$p$sel$empreinte (base64). Le mot de passe lui-même n'est jamais conservé.
 */

const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))));
}

const opts = (n: number, r: number, p: number): ScryptOptions => ({ N: n, r, p, maxmem: 256 * n * r });

export const PASSWORD_MIN_LENGTH = 12;

export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  if (password.length > 200) return "Le mot de passe est trop long.";
  if (new Set(password).size < 5) return "Le mot de passe est trop simple.";
  return null;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, opts(N, R, P));
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const parts = typeof stored === "string" ? stored.split("$") : [];
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  if (!n || !r || !p || n > 1 << 20 || expected.length === 0) return false;
  const actual = await scrypt(String(password).normalize("NFKC"), salt, expected.length, opts(n, r, p));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Calcul factice de même durée, pour ne pas révéler si un compte existe. */
export async function dummyVerify() {
  await scrypt("x", Buffer.alloc(16), KEYLEN, opts(N, R, P));
  return false;
}
