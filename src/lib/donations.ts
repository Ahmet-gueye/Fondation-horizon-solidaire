import "server-only";
import { randomBytes } from "node:crypto";
import { findOne, mutate } from "./store";
import type { DonationInput } from "./validation";
import type { PaymentMode } from "./env";

export type DonationStatus = "pending" | "paid" | "canceled" | "failed";

export type Donation = {
  ref: string;
  idempotencyKey: string;
  amount: number;
  currency: "XOF";
  allocation: string | null;
  frequency: "ponctuel" | "mensuel";
  donor: { name: string; email: string; phone: string; anonymous: boolean };
  status: DonationStatus;
  mode: PaymentMode;
  createdAt: string;
  updatedAt: string;
  paytechToken?: string;
  redirectUrl?: string;
  paymentMethod?: string;
  events: { type: string; at: string; source: "ipn" | "simulation" | "system" }[];
};

const COLLECTION = "donations";

export function newReference() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  return `FHS-${ymd}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * Crée un don « en attente », ou renvoie le don déjà créé avec la même clé
 * d'idempotence (double clic, rechargement) pour éviter les doublons.
 */
export async function createPendingDonation(input: DonationInput, mode: PaymentMode) {
  return mutate<Donation, { donation: Donation; existing: boolean }>(COLLECTION, (rows) => {
    const existing = rows.find((r) => r.idempotencyKey === input.idempotencyKey);
    if (existing) return { rows, result: { donation: existing, existing: true } };
    const now = new Date().toISOString();
    const donation: Donation = {
      ref: newReference(),
      idempotencyKey: input.idempotencyKey,
      amount: input.amount,
      currency: "XOF",
      allocation: input.allocation,
      frequency: input.frequency,
      donor: { name: input.name, email: input.email, phone: input.phone, anonymous: input.anonymous },
      status: "pending",
      mode,
      createdAt: now,
      updatedAt: now,
      events: [{ type: "created", at: now, source: "system" }],
    };
    return { rows: [...rows, donation], result: { donation, existing: false } };
  });
}

export async function attachPaymentSession(ref: string, token: string, redirectUrl: string) {
  return mutate<Donation, void>(COLLECTION, (rows) => ({
    rows: rows.map((r) => (r.ref === ref ? { ...r, paytechToken: token, redirectUrl, updatedAt: new Date().toISOString() } : r)),
    result: undefined,
  }));
}

export async function getDonation(ref: string) {
  return findOne<Donation>(COLLECTION, (r) => r.ref === ref);
}

/**
 * Change l'état d'un don. Règles :
 *  - un don « paid » ne redevient jamais « pending », « canceled » ou « failed » (notification rejouée) ;
 *  - un même événement reçu deux fois n'a pas d'effet supplémentaire.
 */
export async function transitionDonation(
  ref: string,
  next: DonationStatus,
  source: "ipn" | "simulation" | "system",
  extra: { paymentMethod?: string } = {},
) {
  return mutate<Donation, { changed: boolean; donation?: Donation }>(COLLECTION, (rows) => {
    const idx = rows.findIndex((r) => r.ref === ref);
    if (idx === -1) return { rows, result: { changed: false } };
    const current = rows[idx];
    if (current.status === next || current.status === "paid") return { rows, result: { changed: false, donation: current } };
    const now = new Date().toISOString();
    const updated: Donation = {
      ...current,
      status: next,
      updatedAt: now,
      ...(extra.paymentMethod ? { paymentMethod: extra.paymentMethod } : {}),
      events: [...current.events, { type: next, at: now, source }],
    };
    const copy = rows.slice();
    copy[idx] = updated;
    return { rows: copy, result: { changed: true, donation: updated } };
  });
}
