/**
 * Préparation multilingue.
 *
 * Le site est publié en français. Les langues `wo` (wolof) et `en` (anglais)
 * sont déclarées mais désactivées : elles apparaissent dans le sélecteur comme
 * « en préparation ». Pour activer une langue :
 *   1. traduire `fr.ts` dans `wo.ts` / `en.ts` (traduction humaine relue, jamais automatique) ;
 *   2. passer `enabled: true` ci-dessous ;
 *   3. ajouter le routage par préfixe (`/wo/...`) — voir le README.
 */
import { fr } from "./fr";

export const locales = [
  { code: "fr", label: "Français", enabled: true },
  { code: "wo", label: "Wolof", enabled: false },
  { code: "en", label: "English", enabled: false },
] as const;

export type Dictionary = typeof fr;

export const defaultLocale = "fr";

export function getDictionary(): Dictionary {
  return fr;
}
