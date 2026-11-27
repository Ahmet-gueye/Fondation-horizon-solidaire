/**
 * Vérification de l'authenticité des notifications IPN PayTech.
 *
 * D'après la documentation officielle (https://docs.intech.sn/doc_paytech.php, section IPN) :
 *  - Méthode recommandée (HMAC-SHA256) :
 *      hmac_compute = HMAC_SHA256(clé = API_SECRET, message = `${montant}|${ref_command}|${API_KEY}`)
 *    où `montant` = item_price ou final_item_price (la documentation varie), digest hexadécimal.
 *  - Méthode classique : sha256(API_KEY) === api_key_sha256 ET sha256(API_SECRET) === api_secret_sha256.
 *
 * Module pur (sans dépendance Next.js) pour pouvoir être testé avec `npm test`.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type IpnPayload = Record<string, string | undefined>;

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a.trim().toLowerCase(), "utf8");
  const bb = Buffer.from(b.trim().toLowerCase(), "utf8");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return timingSafeEqual(ba, bb);
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function computeIpnHmac(amount: string, refCommand: string, apiKey: string, apiSecret: string) {
  return createHmac("sha256", apiSecret).update(`${amount}|${refCommand}|${apiKey}`, "utf8").digest("hex");
}

export type VerificationResult = { valid: true; method: "hmac" | "sha256" } | { valid: false; reason: string };

export function verifyIpn(payload: IpnPayload, apiKey: string, apiSecret: string): VerificationResult {
  if (!apiKey || !apiSecret) return { valid: false, reason: "identifiants-absents" };

  const ref = payload.ref_command ?? "";
  // La documentation écrit `item_price` dans la formule, mais ses exemples de code utilisent
  // `final_item_price` (prix après promotion) : on accepte l'un ou l'autre.
  const amounts = [payload.final_item_price, payload.item_price].filter((v): v is string => Boolean(v));

  if (payload.hmac_compute) {
    if (!ref || amounts.length === 0) return { valid: false, reason: "champs-manquants" };
    const ok = amounts.some((amount) => safeEqualHex(computeIpnHmac(amount, ref, apiKey, apiSecret), payload.hmac_compute!));
    return ok ? { valid: true, method: "hmac" } : { valid: false, reason: "hmac-invalide" };
  }

  if (payload.api_key_sha256 && payload.api_secret_sha256) {
    const okKey = safeEqualHex(sha256Hex(apiKey), payload.api_key_sha256);
    const okSecret = safeEqualHex(sha256Hex(apiSecret), payload.api_secret_sha256);
    return okKey && okSecret ? { valid: true, method: "sha256" } : { valid: false, reason: "empreintes-invalides" };
  }

  return { valid: false, reason: "signature-absente" };
}
