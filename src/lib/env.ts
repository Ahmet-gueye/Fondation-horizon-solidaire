import "server-only";

/**
 * Lecture des variables d'environnement côté serveur UNIQUEMENT.
 * Ce module ne doit jamais être importé par un composant client
 * (`server-only` provoque une erreur de build si c'est le cas).
 */

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Hébergement sans disque persistant (Vercel) : le stockage local n'y est pas utilisable. */
export function isEphemeralHost() {
  return Boolean(process.env.VERCEL);
}

/** Dossier local des données (développement ou serveur avec disque persistant). */
export function getDataDir() {
  return process.env.DATA_DIR || "./data";
}

/** URL de connexion PostgreSQL (Neon, Supabase, Vercel Postgres…). */
export function getDatabaseUrl() {
  const url = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  return url || null;
}

/** Jeton du magasin de fichiers Vercel Blob (connexion classique). */
export function getBlobToken() {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
  return token || null;
}

/**
 * Identifiant du magasin Vercel Blob (connexion récente sans jeton : Vercel
 * authentifie alors le site automatiquement, via OIDC).
 */
export function getBlobStoreId() {
  const id = (process.env.BLOB_STORE_ID || "").trim();
  return id || null;
}

/** Secret de signature des sessions d'administration (32 caractères minimum). */
export function getAuthSecret() {
  const secret = (process.env.AUTH_SECRET || "").trim();
  return secret.length >= 32 ? secret : null;
}

/** Code d'installation, utilisé une seule fois pour créer le premier administrateur. */
export function getSetupToken() {
  const token = (process.env.ADMIN_SETUP_TOKEN || "").trim();
  return token.length >= 16 ? token : null;
}

/** URL facultative vers laquelle transférer les messages des formulaires (webhook HTTPS). */
export function getFormsWebhook() {
  const url = process.env.FORMS_WEBHOOK_URL?.trim();
  return url ? url : null;
}
