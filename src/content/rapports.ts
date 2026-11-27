/**
 * Documents de transparence. Ne publiez QUE des documents réels et validés.
 * Placez les fichiers PDF dans `public/documents/` et référencez-les ici.
 */

export type DocumentCategory =
  | "Rapports annuels"
  | "Bilans financiers"
  | "Budgets de projets"
  | "Politiques et statuts";

export type PublicDocument = {
  title: string;
  category: DocumentCategory;
  file: string; // ex. "/documents/rapport-annuel-2025.pdf"
  sizeLabel?: string; // ex. "PDF, 1,2 Mo"
  publishedAt: string; // AAAA-MM-JJ
  updatedAt?: string; // AAAA-MM-JJ
  description?: string;
};

export const documentCategories: { name: DocumentCategory; description: string; nameEn: string; descriptionEn: string }[] = [
  { name: "Rapports annuels", description: "Activités de l'année, résultats et perspectives.", nameEn: "Annual reports", descriptionEn: "The year's activities, results and outlook." },
  { name: "Bilans financiers", description: "Comptes annuels et, le cas échéant, rapport de vérification.", nameEn: "Financial statements", descriptionEn: "Annual accounts and, where applicable, the audit report." },
  { name: "Budgets de projets", description: "Budget prévisionnel et dépenses réalisées par projet.", nameEn: "Project budgets", descriptionEn: "Planned budget and actual spending for each project." },
  { name: "Politiques et statuts", description: "Statuts, politique de dons, charte de protection, gouvernance.", nameEn: "Policies and statutes", descriptionEn: "Statutes, donation policy, safeguarding charter, governance." },
];

export const documents: PublicDocument[] = [];

/** Date de dernière mise à jour de la page Transparence (AAAA-MM-JJ), ou null. */
export const transparencyUpdatedAt: string | null = null;
