/**
 * Règles du parcours de don (non secrètes, partagées entre le navigateur et le serveur).
 * Les clés PayTech, elles, sont lues UNIQUEMENT côté serveur (voir `src/lib/env.ts`).
 */

export const donationConfig = {
  currency: "XOF" as const,
  currencyLabel: "FCFA",
  /** Montants suggérés, en francs CFA. */
  suggestedAmounts: [2000, 5000, 10000, 25000, 50000],
  defaultAmount: 10000,
  /** Bornes de validation (vérifiées aussi côté serveur). */
  minAmount: 500,
  maxAmount: 5_000_000,

  /**
   * Don périodique : la documentation officielle PayTech consultée (docs.intech.sn)
   * ne décrit pas de paiement récurrent. L'option reste donc affichée comme
   * « non disponible » tant que `recurringEnabled` vaut false.
   */
  recurringEnabled: false,

  /**
   * Don anonyme : à confirmer par la fondation selon ses obligations légales.
   * Si true, le donateur peut ne pas renseigner son nom ni son e-mail.
   */
  allowAnonymous: true,

  /** Téléphone demandé sur le site ? PayTech le demande lui-même sur sa page de paiement. */
  askPhone: false,

  /**
   * Texte sur les frais, affiché dans le résumé AVANT paiement.
   * À valider par la fondation après lecture du contrat PayTech.
   */
  feesNotice:
    "Information sur les frais éventuels à confirmer par la fondation avant la mise en ligne. Le montant exact à régler est affiché par PayTech avant toute validation.",

  /**
   * Moyens de paiement CONFIRMÉS par PayTech pour le compte de la fondation.
   * Laisser vide tant que la liste n'est pas confirmée par écrit : rien ne s'affiche.
   * Valeurs possibles (doc. PayTech) : "Orange Money", "Wave", "Free Money",
   * "Carte Bancaire", "Emoney", "Wizall", …
   */
  confirmedPaymentMethods: [] as string[],
};

export type DonationFrequency = "ponctuel" | "mensuel";
