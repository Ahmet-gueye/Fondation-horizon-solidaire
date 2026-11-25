import { getDonation } from "@/lib/donations";
import { clientIp, jsonError, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Renvoie uniquement l'état d'un don (aucune donnée personnelle). */
export async function GET(request: Request) {
  if (!rateLimit(`statut:${clientIp(request)}`, 60, 60 * 1000)) return jsonError(429, "Trop de requêtes.");
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!/^FHS-\d{8}-[A-F0-9]{10}$/.test(ref)) return jsonError(400, "Référence invalide.");
  const donation = await getDonation(ref).catch(() => undefined);
  if (!donation) return jsonError(404, "Don introuvable.");
  return Response.json(
    { ok: true, ref: donation.ref, status: donation.status, amount: donation.amount, allocation: donation.allocation, mode: donation.mode },
    { headers: { "Cache-Control": "no-store" } },
  );
}
