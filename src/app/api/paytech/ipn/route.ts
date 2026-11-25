import { getDonation, transitionDonation } from "@/lib/donations";
import { getPaymentConfig } from "@/lib/env";
import { verifyIpn, type IpnPayload } from "@/lib/paytech-signature";
import { logEvent } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Notification de paiement instantanée (IPN) envoyée par PayTech, serveur à serveur.
 * C'est la SEULE source qui peut marquer un don comme payé.
 */
async function readPayload(request: Request): Promise<IpnPayload> {
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  if (type.includes("application/json")) {
    const json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, v == null ? undefined : String(v)]));
  }
  const form = await request.formData().catch(() => null);
  const out: IpnPayload = {};
  form?.forEach((v, k) => {
    if (typeof v === "string") out[k] = v;
  });
  return out;
}

const KO = (status: number) => new Response("IPN KO", { status, headers: { "Content-Type": "text/plain" } });
const OK = () => new Response("IPN OK", { status: 200, headers: { "Content-Type": "text/plain" } });

export async function POST(request: Request) {
  const cfg = getPaymentConfig();
  if (cfg.mode === "simulation") return KO(404);

  const payload = await readPayload(request);
  const check = verifyIpn(payload, cfg.apiKey, cfg.apiSecret);
  if (!check.valid) {
    logEvent("ipn.rejetee", { raison: check.reason });
    return KO(401);
  }

  const ref = payload.ref_command ?? "";
  const donation = await getDonation(ref);
  if (!donation) {
    logEvent("ipn.ref.inconnue", { ref: ref.slice(0, 40) });
    return KO(404);
  }

  // Cohérence : environnement, devise et montant attendus.
  if (payload.env && payload.env !== cfg.mode) {
    logEvent("ipn.env.incoherent", { ref, env: payload.env });
    return KO(400);
  }
  if (payload.currency && payload.currency.toUpperCase() !== donation.currency) {
    logEvent("ipn.devise.incoherente", { ref });
    return KO(400);
  }
  const announced = Number(payload.initial_item_price || payload.item_price);
  if (!Number.isFinite(announced) || Math.round(announced) !== donation.amount) {
    logEvent("ipn.montant.incoherent", { ref });
    return KO(400);
  }

  const event = payload.type_event;
  if (event === "sale_complete") {
    const { changed } = await transitionDonation(ref, "paid", "ipn", { paymentMethod: payload.payment_method?.slice(0, 40) });
    logEvent("ipn.paiement.confirme", { ref, methode: check.method, nouveau: changed });
  } else if (event === "sale_canceled") {
    const { changed } = await transitionDonation(ref, "canceled", "ipn");
    logEvent("ipn.paiement.annule", { ref, nouveau: changed });
  } else {
    logEvent("ipn.evenement.ignore", { ref, type: (event ?? "absent").slice(0, 30) });
  }
  return OK();
}
