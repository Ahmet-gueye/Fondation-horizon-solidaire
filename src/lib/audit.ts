import "server-only";
import { randomUUID } from "node:crypto";
import { getStore } from "@/lib/db/docstore";
import { logEvent } from "@/lib/security";

/**
 * Historique minimal des modifications : qui, quand, quelle action, sur quoi.
 * Aucune donnée sensible (pas de mot de passe, pas d'adresse IP, pas de contenu de message).
 */

export type AuditAction =
  | "fiche.creation"
  | "fiche.modification"
  | "fiche.publication"
  | "fiche.depublication"
  | "fiche.archivage"
  | "fiche.desarchivage"
  | "fiche.suppression"
  | "budget.validation"
  | "compte.creation"
  | "compte.modification"
  | "compte.mot_de_passe"
  | "installation";

export const auditLabels: Record<AuditAction, string> = {
  "fiche.creation": "Création de fiche",
  "fiche.modification": "Modification de fiche",
  "fiche.publication": "Publication",
  "fiche.depublication": "Retrait de la publication",
  "fiche.archivage": "Archivage",
  "fiche.desarchivage": "Sortie des archives",
  "fiche.suppression": "Suppression",
  "budget.validation": "Validation des montants",
  "compte.creation": "Création de compte",
  "compte.modification": "Modification de compte",
  "compte.mot_de_passe": "Changement de mot de passe",
  installation: "Création du premier administrateur",
};

export type AuditEntry = {
  at: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  targetId: string;
  targetLabel: string;
  details?: string;
};

export async function audit(actor: { id: string; name: string }, action: AuditAction, target: { id: string; label: string }, details?: string) {
  const entry: AuditEntry = {
    at: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.name,
    action,
    targetId: target.id,
    targetLabel: target.label.slice(0, 160),
    ...(details ? { details: details.slice(0, 200) } : {}),
  };
  try {
    await getStore().insert<AuditEntry>("historique", `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`, entry);
  } catch (err) {
    logEvent("historique.erreur", { message: (err as Error).message });
  }
}

export async function listAudit(limit = 300) {
  const rows = await getStore().list<AuditEntry>("historique");
  return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
