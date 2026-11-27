/**
 * Langues du site public : français (langue principale) et anglais.
 *
 * La langue choisie par le visiteur est mémorisée dans le cookie `fhs_lang`
 * (aucune donnée personnelle, aucun suivi). Les adresses des pages restent les mêmes.
 * L'espace d'administration reste en français.
 *
 * Les contenus saisis dans l'administration (fiches d'activités) sont publiés
 * dans la langue où ils ont été rédigés.
 */
export type Locale = "fr" | "en";

export const locales: { code: Locale; label: string; short: string }[] = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English", short: "EN" },
];

export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "fhs_lang";

export function isLocale(v: unknown): v is Locale {
  return v === "fr" || v === "en";
}

/** Fonction de traduction : t("Texte français", "English text"). */
export type T = (fr: string, en: string) => string;
export function makeT(locale: Locale): T {
  return (fr, en) => (locale === "en" ? en : fr);
}

/** Texte bilingue stocké dans les fichiers de contenu. */
export type Bi = { fr: string; en: string };
export function pick(locale: Locale, v: Bi | string): string {
  return typeof v === "string" ? v : v[locale];
}
