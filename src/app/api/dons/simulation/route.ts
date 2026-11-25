import { transitionDonation, getDonation } from "@/lib/donations";
import { isSimulationAllowed } from "@/lib/env";
import { isJson, isSameOrigin, jsonError, logEvent } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * MODE SIMULATION UNIQUEMENT : simule l'issue d'un paiement pour tester le parcours.
 * Désactivé automatiquement dès que PAYTECH_MODE vaut « test » ou « prod » avec identifiants.
 */
export async function POST(request: Request) {
  if (!isSimulationAllowed()) return jsonError(404, "Indisponible.");
  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, "Requête refusée.");
  const body = (await request.json().catch(() => ({}))) as { ref?: string; outcome?: string };
  const ref = String(body.ref ?? "");
  const map = { paid: "paid", canceled: "canceled", failed: "failed" } as const;
  const outcome = map[body.outcome as keyof typeof map];
  if (!outcome) return jsonError(400, "Issue inconnue.");
  const donation = await getDonation(ref);
  if (!donation || donation.mode !== "simulation") return jsonError(404, "Don introuvable.");
  await transitionDonation(ref, outcome, "simulation");
  logEvent("don.simulation", { ref, issue: outcome });
  const next = outcome === "paid" ? "merci" : "annule";
  return Response.json({ ok: true, redirectUrl: `/faire-un-don/${next}?ref=${encodeURIComponent(ref)}${outcome === "failed" ? "&echec=1" : ""}` });
}
