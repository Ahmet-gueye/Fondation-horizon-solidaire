import "server-only";

/**
 * Client PayTech — PRÉPARÉ, NON BRANCHÉ.
 *
 * Aucun écran ni route du site n'appelle ce module tant que le compte PayTech de la
 * fondation n'est pas activé et testé (voir README, « Activer PayTech plus tard »).
 *
 * Référence : https://docs.intech.sn/doc_paytech.php
 *   POST {apiBase}/payment/request-payment
 *   En-têtes : API_KEY, API_SECRET (lus côté serveur uniquement)
 *   Réponse  : { success: 1, token, redirect_url }
 */

export class PaytechError extends Error {}

export type PaytechEnv = "test" | "prod";

export type PaytechConfig = {
  apiKey: string;
  apiSecret: string;
  env: PaytechEnv;
  apiBase: string;
  /** Moyens de paiement à proposer (target_payment). Vide = tous ceux activés sur le compte. */
  targetPayment: string;
};

/** Lit la configuration PayTech dans les variables d'environnement. `null` si incomplète. */
export function readPaytechConfig(): PaytechConfig | null {
  const apiKey = process.env.PAYTECH_API_KEY?.trim() ?? "";
  const apiSecret = process.env.PAYTECH_API_SECRET?.trim() ?? "";
  const env = (process.env.PAYTECH_ENV ?? "").trim().toLowerCase();
  if (!apiKey || !apiSecret || (env !== "test" && env !== "prod")) return null;
  return {
    apiKey,
    apiSecret,
    env,
    apiBase: (process.env.PAYTECH_API_BASE ?? "https://paytech.sn/api").replace(/\/$/, ""),
    targetPayment: process.env.PAYTECH_TARGET_PAYMENT?.trim() ?? "",
  };
}

export type PaymentRequest = {
  ref: string;
  amount: number;
  currency: string;
  itemName: string;
  commandName: string;
  ipnUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export async function requestPayment(cfg: PaytechConfig, req: PaymentRequest) {
  const body: Record<string, string | number> = {
    item_name: req.itemName.slice(0, 120),
    item_price: req.amount,
    currency: req.currency,
    ref_command: req.ref,
    command_name: req.commandName.slice(0, 200),
    env: cfg.env,
    ipn_url: req.ipnUrl,
    success_url: req.successUrl,
    cancel_url: req.cancelUrl,
    // Aucune donnée personnelle dans custom_field : uniquement la référence interne.
    custom_field: JSON.stringify({ ref: req.ref }),
  };
  if (cfg.targetPayment) body.target_payment = cfg.targetPayment;

  const res = await fetch(`${cfg.apiBase}/payment/request-payment`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", API_KEY: cfg.apiKey, API_SECRET: cfg.apiSecret },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as
    | { success?: number | string; token?: string; redirect_url?: string; redirectUrl?: string }
    | null;
  const redirect = data?.redirect_url ?? data?.redirectUrl;
  if (!res.ok || !data || Number(data.success) !== 1 || !data.token || !redirect) {
    throw new PaytechError(`Réponse PayTech invalide (HTTP ${res.status})`);
  }
  const url = new URL(redirect);
  if (url.protocol !== "https:" || !(url.hostname === "paytech.sn" || url.hostname.endsWith(".paytech.sn"))) {
    throw new PaytechError("URL de redirection inattendue");
  }
  return { token: data.token, redirectUrl: url.toString() };
}
