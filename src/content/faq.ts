/**
 * Questions fréquentes. Les réponses restent générales et ne promettent rien
 * qui n'ait été vérifié (fiscalité, reçus, délais). À relire par la fondation.
 */
export const faq: { question: string; answer: string }[] = [
  {
    question: "Comment mon don est-il utilisé ?",
    answer:
      "Chaque don est enregistré, affecté au projet choisi ou aux besoins prioritaires de la fondation s'il n'est pas affecté, puis suivi jusqu'à son utilisation. La page Transparence détaille ces étapes et regroupe les rapports publiés.",
  },
  {
    question: "Puis-je faire un don en ligne ?",
    answer:
      "Le paiement en ligne n'est pas encore ouvert : aucun don ne peut être encaissé sur le site pour le moment. Il passera par la plateforme sécurisée PayTech. Le site de la fondation ne demande ni ne conserve jamais vos coordonnées bancaires, votre numéro de carte ou vos codes Mobile Money.",
  },
  {
    question: "Puis-je choisir le projet que je soutiens ?",
    answer:
      "Les modalités seront précisées à l'ouverture du don en ligne. En attendant, contactez la fondation pour échanger sur le projet que vous souhaitez soutenir.",
  },
  {
    question: "Vais-je recevoir un reçu fiscal ?",
    answer:
      "La délivrance d'un reçu et les éventuels avantages fiscaux dépendent du statut juridique de la fondation et de la législation applicable. Ces informations seront précisées par la fondation. ",
  },
  {
    question: "Comment devenir bénévole ?",
    answer:
      "Remplissez le formulaire de la page « Engagez-vous » en indiquant vos disponibilités et vos compétences. L'équipe vous recontacte pour échanger sur les missions possibles.",
  },
  {
    question: "Mon organisation souhaite devenir partenaire. Que faire ?",
    answer:
      "Présentez votre organisation et votre idée de collaboration via le formulaire de partenariat. Nous étudions chaque proposition au regard de nos programmes et de nos valeurs.",
  },
];

/** Version anglaise (même ordre que la version française). */
export const faqEn: { question: string; answer: string }[] = [
  {
    question: "How is my donation used?",
    answer:
      "Every donation is recorded, allocated to the chosen project (or to the foundation's priority needs if no project is chosen), and then tracked until it is spent. The Transparency page explains these steps and gathers the published reports.",
  },
  {
    question: "Can I donate online?",
    answer:
      "Online payment is not open yet: no donation can be collected on the website for the moment. It will go through the secure PayTech platform. The foundation's website never asks for or stores your bank details, card number or Mobile Money codes.",
  },
  {
    question: "Can I choose the project I support?",
    answer:
      "The details will be given when online giving opens. In the meantime, contact the foundation to discuss the project you would like to support.",
  },
  {
    question: "Will I receive a tax receipt?",
    answer:
      "Whether a receipt can be issued, and any tax benefit, depends on the foundation's legal status and on the applicable law. The foundation will provide this information.",
  },
  {
    question: "How can I become a volunteer?",
    answer:
      "Fill in the form on the “Get involved” page, telling us when you are available and what your skills are. The team will get back to you to discuss possible missions.",
  },
  {
    question: "My organisation would like to become a partner. What should we do?",
    answer:
      "Introduce your organisation and your idea for working together through the partnership form. We look at every proposal in the light of our programmes and our values.",
  },
];

/** Réponse à « Puis-je faire un don en ligne ? » une fois le paiement PayTech ouvert au public. */
const onlineOpen = {
  fr: "Oui, depuis la page « Nous soutenir ». Le paiement se fait sur la page sécurisée de la plateforme PayTech. Le site de la fondation ne demande ni ne conserve jamais vos coordonnées bancaires, votre numéro de carte ou vos codes Mobile Money.",
  en: "Yes, from the “Support us” page. Payment is made on the secure page of the PayTech platform. The foundation's website never asks for or stores your bank details, card number or Mobile Money codes.",
};

export function getFaq(locale: "fr" | "en", donationsOpen = false) {
  const list = (locale === "en" ? faqEn : faq).map((q) => ({ ...q }));
  if (donationsOpen) list[1].answer = onlineOpen[locale];
  return list;
}
