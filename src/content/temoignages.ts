/**
 * Témoignages. Ne publiez que des témoignages RÉELS, recueillis avec un
 * consentement écrit (`consentDate` obligatoire). Sinon un appel à témoignages s'affiche.
 */
export type Testimonial = {
  quote: string;
  author: string; // prénom ou initiales selon le consentement
  role?: string; // ex. « Bénévole », « Partenaire »
  consentDate: string; // AAAA-MM-JJ
};

export const testimonials: Testimonial[] = [];
