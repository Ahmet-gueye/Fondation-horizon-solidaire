/**
 * Dons en ligne via PayTech.
 *
 * Le don en ligne s'active AUTOMATIQUEMENT quand les variables PAYTECH_API_KEY, PAYTECH_API_SECRET
 * et PAYTECH_ENV sont définies sur l'hébergeur (voir README, « Dons en ligne avec PayTech ») :
 *   - PAYTECH_ENV=test : formulaire visible UNIQUEMENT par les personnes connectées à /admin
 *     (PayTech débite alors un petit montant de test ; jamais ouvert au public) ;
 *   - PAYTECH_ENV=prod : formulaire ouvert à tous (compte PayTech activé par PayTech).
 * Sans ces variables, la page « Nous soutenir » invite simplement à contacter la fondation.
 *
 * Aucune donnée de carte ou de Mobile Money ne transite par le site : le paiement se fait
 * sur la page sécurisée de PayTech. Un don n'est marqué « payé » qu'après la notification
 * signée de PayTech au serveur (IPN), jamais sur la base d'un retour dans le navigateur.
 */

export type CurrencyCode = "XOF" | "EUR" | "USD" | "CAD" | "GBP" | "MAD";

export const donationConfig = {
  /** Devises acceptées par l'API PayTech (paramètre `currency`). */
  currencies: [
    { code: "XOF", label: "Franc CFA (FCFA)", labelEn: "CFA franc (FCFA)", min: 500, max: 10_000_000 },
    { code: "EUR", label: "Euro", labelEn: "Euro", min: 1, max: 20_000 },
    { code: "USD", label: "Dollar américain", labelEn: "US dollar", min: 1, max: 20_000 },
    { code: "CAD", label: "Dollar canadien", labelEn: "Canadian dollar", min: 1, max: 20_000 },
    { code: "GBP", label: "Livre sterling", labelEn: "Pound sterling", min: 1, max: 20_000 },
    { code: "MAD", label: "Dirham marocain", labelEn: "Moroccan dirham", min: 10, max: 200_000 },
  ] as { code: CurrencyCode; label: string; labelEn: string; min: number; max: number }[],

  /** Montants proposés en un clic (le visiteur peut aussi saisir un autre montant). */
  suggestedAmounts: {
    XOF: [2000, 5000, 10000, 25000, 50000],
    EUR: [10, 20, 50, 100],
    USD: [10, 20, 50, 100],
    CAD: [10, 20, 50, 100],
    GBP: [10, 20, 50, 100],
    MAD: [100, 200, 500, 1000],
  } as Record<CurrencyCode, number[]>,

  /**
   * Moyens de paiement CONFIRMÉS par PayTech pour le compte de la fondation.
   * Vide tant que rien n'est confirmé par écrit : aucun logo ne s'affiche.
   */
  confirmedPaymentMethods: [] as string[],
};

