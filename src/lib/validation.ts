/**
 * Validation des données des formulaires — module pur, utilisé côté serveur
 * (et testable avec `npm test`). Le navigateur fait une pré-validation, mais
 * seule la validation serveur fait foi.
 */

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const PHONE_RE = /^\+?[0-9 ().-]{8,20}$/;

export function cleanText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // Supprime les caractères de contrôle (sauf retours à la ligne) et normalise.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function isEmail(value: string) {
  return EMAIL_RE.test(value);
}

export function isPhone(value: string) {
  return PHONE_RE.test(value);
}

export const contactTypes = {
  general: "Demande générale",
  benevolat: "Bénévolat",
  partenariat: "Partenariat",
  projet: "Soutenir la fondation ou un projet",
} as const;

export type ContactType = keyof typeof contactTypes;

export type ContactInput = {
  type: ContactType;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  availability: string;
  message: string;
};

export function validateContact(body: Record<string, unknown>): { ok: true; data: ContactInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const type = (Object.keys(contactTypes) as ContactType[]).includes(body.type as ContactType) ? (body.type as ContactType) : null;
  if (!type) errors.type = "Choisissez l'objet de votre message.";

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 254).toLowerCase();
  const phone = cleanText(body.phone, 20);
  const organisation = cleanText(body.organisation, 160);
  const availability = cleanText(body.availability, 300);
  const message = cleanText(body.message, 4000);

  if (name.length < 2) errors.name = "Indiquez votre nom.";
  if (!isEmail(email)) errors.email = "Indiquez une adresse e-mail valide.";
  if (phone && !isPhone(phone)) errors.phone = "Le numéro de téléphone n'est pas valide.";
  if (type === "partenariat" && organisation.length < 2) errors.organisation = "Indiquez le nom de votre organisation.";
  if (message.length < 10) errors.message = "Votre message doit contenir au moins 10 caractères.";
  if (body.consent !== true) errors.consent = "Merci d'accepter le traitement de vos données pour que nous puissions vous répondre.";

  if (Object.keys(errors).length > 0 || !type) return { ok: false, errors };
  return { ok: true, data: { type, name, email, phone, organisation, availability, message } };
}
