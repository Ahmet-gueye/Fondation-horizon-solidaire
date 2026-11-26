/**
 * Dons en ligne — ÉTAT ACTUEL : DÉSACTIVÉS.
 *
 * Le compte PayTech de la fondation n'est pas encore activé. Le site n'affiche donc
 * aucun formulaire de paiement, aucun bouton « Payer » et aucun moyen de paiement.
 * `onlineDonationsEnabled` ne doit passer à true qu'après :
 *   1. l'activation du compte PayTech et la réception des clés ;
 *   2. l'ajout des routes de paiement et d'IPN (voir README) ;
 *   3. des essais complets en mode test PayTech.
 */
export const donationConfig = {
  onlineDonationsEnabled: false,

  /**
   * Devises prévues pour l'évolution future (codes acceptés par PayTech dans le
   * paramètre `currency`). AUCUNE n'est disponible tant que les dons sont désactivés.
   */
  plannedCurrencies: [
    { code: "XOF", label: "Franc CFA (FCFA)" },
    { code: "EUR", label: "Euro" },
    { code: "USD", label: "Dollar américain" },
    { code: "CAD", label: "Dollar canadien" },
    { code: "GBP", label: "Livre sterling" },
    { code: "MAD", label: "Dirham marocain" },
  ],

  /** Montants envisagés en FCFA (non utilisés tant que les dons sont désactivés). */
  suggestedAmountsXof: [2000, 5000, 10000, 25000, 50000],

  /**
   * Moyens de paiement CONFIRMÉS par PayTech pour le compte de la fondation.
   * Vide tant que rien n'est confirmé par écrit : aucun logo ne s'affiche.
   */
  confirmedPaymentMethods: [] as string[],
};
