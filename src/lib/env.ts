import "server-only";

/**
 * Lecture des variables d'environnement côté serveur UNIQUEMENT.
 * Ce module ne doit jamais être importé par un composant client
 * (`server-only` provoque une erreur de build si c'est le cas).
 */

export type PaymentMode = "simulation" | "test" | "prod";

function readMode(): PaymentMode {
  const raw = (process.env.PAYTECH_MODE ?? "simulation").trim().toLowerCase();
  if (raw === "test" || raw === "prod") return raw;
  return "simulation";
}

export function getPaymentConfig() {
  const mode = readMode();
  const apiKey = process.env.PAYTECH_API_KEY?.trim() ?? "";
  const apiSecret = process.env.PAYTECH_API_SECRET?.trim() ?? "";
  const hasCredentials = apiKey.length > 0 && apiSecret.length > 0;

  // Sécurité : sans identifiants, on reste en simulation, quel que soit le mode demandé.
  const effectiveMode: PaymentMode = mode !== "simulation" && !hasCredentials ? "simulation" : mode;

  return {
    mode: effectiveMode,
    requestedMode: mode,
    hasCredentials,
    apiKey,
    apiSecret,
    apiBase: (process.env.PAYTECH_API_BASE ?? "https://paytech.sn/api").replace(/\/$/, ""),
    /** Moyens de paiement à proposer (target_payment). Vide = tous ceux activés sur le compte. */
    targetPayment: process.env.PAYTECH_TARGET_PAYMENT?.trim() ?? "",
  };
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  // Sur Vercel, seul /tmp est inscriptible (et il n'est PAS persistant) :
  // suffisant pour une démonstration en mode simulation, pas pour la production.
  if (process.env.VERCEL) return "/tmp/fhs-data";
  return "./data";
}

/** URL facultative vers laquelle transférer les messages des formulaires (webhook HTTPS). */
export function getFormsWebhook() {
  const url = process.env.FORMS_WEBHOOK_URL?.trim();
  return url ? url : null;
}

export function isSimulationAllowed() {
  return getPaymentConfig().mode === "simulation";
}
