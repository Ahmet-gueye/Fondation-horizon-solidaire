const numberFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 25000 -> « 25 000 FCFA » (espaces insécables). */
export function formatFCFA(amount: number) {
  return `${numberFormatter.format(amount)} FCFA`;
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

/** « 2026-11-25 » -> « 25 novembre 2026 ». */
export function formatDate(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}
