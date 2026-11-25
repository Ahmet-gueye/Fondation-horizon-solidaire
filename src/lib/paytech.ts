import "server-only";
import { getPaymentConfig, getSiteUrl } from "./env";
import type { Donation } from "./donations";

/**
 * Client PayTech côté serveur.
 * Référence : https://docs.intech.sn/doc_paytech.php
 *   POST {apiBase}/payment/request-payment
 *   En-têtes : API_KEY, API_SECRET
 *   Réponse  : { success: 1, token, redirect_url }
 */

export class PaytechError extends Error {}

export async function requestPayment(donation: Donation, label: string) {
  const cfg = getPaymentConfig();
  if (cfg.mode === "simulation") throw new PaytechError("Mode simulation : aucun appel PayTech.");

  const site = getSiteUrl();
  const body: Record<string, string | number> = {
    item_name: label.slice(0, 120),
    item_price: donation.amount,
    currency: donation.currency,
    ref_command: donation.ref,
    command_name: `Don ${donation.ref} - Fondation Horizon Solidaire`,
    env: cfg.mode, // "test" ou "prod"
    ipn_url: `${site}/api/paytech/ipn`,
    success_url: `${site}/faire-un-don/merci?ref=${encodeURIComponent(donation.ref)}`,
    cancel_url: `${site}/faire-un-don/annule?ref=${encodeURIComponent(donation.ref)}`,
    // Aucune donnée personnelle dans custom_field : uniquement la référence interne.
    custom_field: JSON.stringify({ ref: donation.ref }),
  };
  if (cfg.targetPayment) body.target_payment = cfg.targetPayment;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${cfg.apiBase}/payment/request-payment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        API_KEY: cfg.apiKey,
        API_SECRET: cfg.apiSecret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as
      | { success?: number | string; token?: string; redirect_url?: string; redirectUrl?: string; message?: string }
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
  } finally {
    clearTimeout(timer);
  }
}
