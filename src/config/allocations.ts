import { getPublicProgrammes } from "@/content/programmes";
import { getDonatableProjects } from "@/content/projets";

/**
 * Affectations possibles d'un don : général, un programme public, ou un projet
 * ouvert aux dons (jamais un exemple). Partagé par le formulaire et le serveur.
 */
export type AllocationOption = { value: string; label: string; group: "general" | "programme" | "projet" };

export function getAllocationOptions(): AllocationOption[] {
  return [
    { value: "general", label: "Don général (non affecté) : là où le besoin est le plus urgent", group: "general" },
    ...getPublicProgrammes().map((p) => ({ value: `programme:${p.slug}`, label: `Programme : ${p.title}`, group: "programme" as const })),
    ...getDonatableProjects().map((p) => ({ value: `projet:${p.slug}`, label: `Projet : ${p.title}`, group: "projet" as const })),
  ];
}

export function allocationLabel(value: string | null) {
  if (!value) return "Don général (non affecté)";
  return getAllocationOptions().find((o) => o.value === value)?.label ?? "Don général (non affecté)";
}
