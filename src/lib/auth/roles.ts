/**
 * Rôles de l'espace d'administration et droits associés.
 * Module partagé (navigateur et serveur) : il ne contient aucun secret.
 * Le serveur vérifie TOUJOURS les droits ; l'interface ne fait que masquer les boutons.
 */

export type Role = "admin" | "editeur";

export const roleLabels: Record<Role, string> = { admin: "Administrateur", editeur: "Éditeur" };

export type Permission =
  | "fiche.creer"
  | "fiche.modifier_non_publiee"
  | "fiche.modifier_publiee"
  | "fiche.publier"
  | "fiche.archiver"
  | "fiche.supprimer"
  | "budget.valider"
  | "comptes.gerer"
  | "historique.voir"
  | "messages.voir"
  | "dons.voir";

const rights: Record<Role, Permission[]> = {
  editeur: ["fiche.creer", "fiche.modifier_non_publiee"],
  admin: [
    "fiche.creer",
    "fiche.modifier_non_publiee",
    "fiche.modifier_publiee",
    "fiche.publier",
    "fiche.archiver",
    "fiche.supprimer",
    "budget.valider",
    "comptes.gerer",
    "historique.voir",
    "messages.voir",
    "dons.voir",
  ],
};

export function can(role: Role | null | undefined, permission: Permission) {
  return Boolean(role && rights[role]?.includes(permission));
}

export function isRole(value: unknown): value is Role {
  return value === "admin" || value === "editeur";
}
