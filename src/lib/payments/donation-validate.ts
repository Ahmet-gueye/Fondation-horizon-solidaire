/**
 * Validation des demandes de don (module PUR, testable avec `npm test`).
 * Le serveur est seul juge : le navigateur ne fixe jamais le montant d'un don déjà créé.
 */
import { randomInt } from "node:crypto";
import { donationConfig, type CurrencyCode } from "../../config/donations.ts";

export type DonationInput = {
  amount: number;
  currency: CurrencyCode;
  /** Programme choisi (slug) ou null = « là où c'est le plus utile ». */
  programme: string | null;
  /** Campagne ou activité soutenue (slug d'une fiche publiée), facultatif. */
  campagne: string | null;
  donorName: string;
  donorEmail: string;
  locale: "fr" | "en";
};

export type DonationErrors = Partial<Record<"amount" | "currency" | "programme" | "donorName" | "donorEmail" | "terms", string>>;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");

export function validateDonation(
  body: Record<string, unknown>,
  allowedProgrammes: string[],
): { ok: true; data: DonationInput } | { ok: false; errors: DonationErrors } {
  const errors: DonationErrors = {};
  const en = body.locale === "en";
  const currency = donationConfig.currencies.find((c) => c.code === body.currency);
  if (!currency) errors.currency = en ? "Choose a currency." : "Choisissez une devise.";

  const amount = typeof body.amount === "number" ? body.amount : Number(String(body.amount ?? "").replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    errors.amount = en ? "Enter a whole amount, without decimals." : "Indiquez un montant entier, sans centimes.";
  } else if (currency && (amount < currency.min || amount > currency.max)) {
    errors.amount = en
      ? `The amount must be between ${currency.min} and ${currency.max} ${currency.code}.`
      : `Le montant doit être compris entre ${currency.min} et ${currency.max} ${currency.code}.`;
  }

  const programmeRaw = str(body.programme, 60);
  const programme = programmeRaw || null;
  if (programme && !allowedProgrammes.includes(programme)) errors.programme = en ? "Unknown programme." : "Programme inconnu.";

  const campagne = str(body.campagne, 80) || null;
  if (campagne && !/^[a-z0-9-]{1,80}$/.test(campagne)) errors.programme = en ? "Unknown campaign." : "Campagne inconnue.";

  const donorName = str(body.donorName, 100);
  const donorEmail = str(body.donorEmail, 160).toLowerCase();
  if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(donorEmail)) errors.donorEmail = en ? "This email address is not valid." : "Cette adresse e-mail n'est pas valide.";

  if (body.terms !== true) errors.terms = en ? "Please accept the donation terms." : "Merci d'accepter les conditions de don.";

  if (Object.keys(errors).length || !currency) return { ok: false, errors };
  return { ok: true, data: { amount, currency: currency.code, programme, campagne, donorName, donorEmail, locale: en ? "en" : "fr" } };
}

/** Référence unique transmise à PayTech (ref_command) : FHS-AAAAMMJJ-XXXXXXXXXX. */
export function newDonationRef(now = new Date()) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 10; i++) suffix += alphabet[randomInt(alphabet.length)];
  return `FHS-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

export function isDonationRef(v: unknown): v is string {
  return typeof v === "string" && /^FHS-\d{8}-[A-Z2-9]{10}$/.test(v);
}

/** Le montant annoncé par PayTech correspond-il au don enregistré ? (comparaison numérique) */
export function sameAmount(expected: number, ...reported: (string | undefined)[]) {
  return reported.some((r) => r !== undefined && r !== "" && Math.abs(Number(r) - expected) < 0.005);
}
