/**
 * Responsables et membres de l'équipe : uniquement avec nom, rôle et accord de publication.
 * Photo facultative (dans `public/images/equipe/`).
 * Tant que la liste est vide, la section affiche « À compléter par la fondation ».
 */
export type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  bio?: string;
};

export const team: TeamMember[] = [];

/** Historique : étapes datées et vérifiées. */
export const history: { date: string; text: string }[] = [];
