import "server-only";
import { getStore, VersionConflict, type Doc } from "@/lib/db/docstore";
import { logEvent } from "@/lib/security";
import type { CurrencyCode } from "@/config/donations";
import { readPaytechConfig } from "./paytech";
import { sameAmount } from "./donation-validate";
import { verifyIpn, type IpnPayload } from "./paytech-signature";

/**
 * Dons enregistrés (collection « dons », identifiant = référence FHS-…).
 * Seule la notification IPN signée par PayTech fait passer un don à « payé ».
 */

export type DonStatus = "en_attente" | "paye" | "annule" | "rembourse";

export const donStatusLabels: Record<DonStatus, string> = {
  en_attente: "En attente",
  paye: "Payé",
  annule: "Annulé",
  rembourse: "Remboursé",
};

export type DonData = {
  ref: string;
  amount: number;
  currency: CurrencyCode;
  programme: string | null;
  ficheId: string | null;
  ficheTitle: string | null;
  donorName: string;
  donorEmail: string;
  locale: "fr" | "en";
  env: "test" | "prod";
  status: DonStatus;
  token: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  paymentMethod: string | null;
  /** Montant réellement débité selon PayTech, converti en FCFA (information). */
  amountXof: number | null;
};
export type Don = Doc<DonData>;

const C = "dons";

/** Mode de paiement en vigueur, déduit des variables d'environnement. */
export function paymentMode(): "off" | "test" | "prod" {
  const cfg = readPaytechConfig();
  return cfg ? cfg.env : "off";
}

export async function getDon(ref: string) {
  return getStore().get<DonData>(C, ref);
}

export async function listDons() {
  return (await getStore().list<DonData>(C)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createDon(data: Omit<DonData, "status" | "token" | "createdAt" | "updatedAt" | "paidAt" | "paymentMethod" | "amountXof">) {
  const now = new Date().toISOString();
  return getStore().insert<DonData>(C, data.ref, { ...data, status: "en_attente", token: null, createdAt: now, updatedAt: now, paidAt: null, paymentMethod: null, amountXof: null });
}

async function save(don: Don, changes: Partial<DonData>) {
  const { id, version, ...data } = don;
  return getStore().update<DonData>(C, id, { ...data, ...changes, updatedAt: new Date().toISOString() }, version);
}

export async function setDonToken(don: Don, token: string) {
  return save(don, { token });
}

export type IpnOutcome = { status: 200 | 400 | 403 | 404 | 409; body: string };

/**
 * Traite une notification PayTech. Contrôles : signature (HMAC ou empreintes SHA-256),
 * référence connue, environnement, devise et montant identiques au don enregistré.
 * Idempotent : une notification rejouée ne change rien.
 */
export async function handleIpn(payload: IpnPayload): Promise<IpnOutcome> {
  const cfg = readPaytechConfig();
  if (!cfg) return { status: 403, body: "Forbidden" };
  const check = verifyIpn(payload, cfg.apiKey, cfg.apiSecret);
  if (!check.valid) {
    logEvent("paytech.ipn.refusee", { raison: check.reason });
    return { status: 403, body: "Forbidden" };
  }
  const ref = payload.ref_command ?? "";
  const event = payload.type_event ?? "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const don = ref ? await getDon(ref) : null;
    if (!don) {
      logEvent("paytech.ipn.reference_inconnue", { event });
      return { status: 404, body: "Unknown reference" };
    }
    if (payload.env && payload.env !== don.env) {
      logEvent("paytech.ipn.env_incoherent", { ref, recu: payload.env, attendu: don.env });
      return { status: 400, body: "Bad env" };
    }
    if (payload.currency && payload.currency.toUpperCase() !== don.currency) {
      logEvent("paytech.ipn.devise_incoherente", { ref });
      return { status: 400, body: "Bad currency" };
    }
    if (!sameAmount(don.amount, payload.item_price, payload.initial_item_price)) {
      logEvent("paytech.ipn.montant_incoherent", { ref });
      return { status: 400, body: "Bad amount" };
    }
    try {
      if (event === "sale_complete") {
        if (don.status === "paye") return { status: 200, body: "OK" };
        const xof = Number(payload.final_item_price_xof || payload.item_price_xof);
        await save(don, {
          status: "paye",
          paidAt: new Date().toISOString(),
          paymentMethod: (payload.payment_method ?? "").slice(0, 60) || null,
          amountXof: Number.isFinite(xof) && xof > 0 ? Math.round(xof) : null,
        });
        logEvent("paytech.don.paye", { ref, methode: check.method, env: don.env });
      } else if (event === "sale_canceled") {
        if (don.status === "en_attente") await save(don, { status: "annule" });
        logEvent("paytech.don.annule", { ref });
      } else if (event === "refund_complete") {
        if (don.status === "paye") await save(don, { status: "rembourse" });
        logEvent("paytech.don.rembourse", { ref });
      } else {
        logEvent("paytech.ipn.evenement_ignore", { ref, event });
      }
      return { status: 200, body: "OK" };
    } catch (err) {
      if (err instanceof VersionConflict) continue; // deux notifications simultanées : on relit et on recommence
      throw err;
    }
  }
  return { status: 409, body: "Conflict" };
}
