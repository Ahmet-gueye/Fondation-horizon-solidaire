import type { Locale } from "@/i18n";

const tag = (l: Locale) => (l === "en" ? "en-GB" : "fr-FR");

/** 25000 -> « 25 000 FCFA » (fr) ou « 25,000 FCFA » (en). */
export function formatFCFA(amount: number, locale: Locale = "fr") {
  return `${formatNumber(amount, locale)} FCFA`;
}

export function formatNumber(value: number, locale: Locale = "fr") {
  return new Intl.NumberFormat(tag(locale), { maximumFractionDigits: 0 }).format(value);
}

/** « 2026-11-25 » -> « 25 novembre 2026 » / « 25 November 2026 ». */
export function formatDate(iso: string, locale: Locale = "fr") {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(tag(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}
