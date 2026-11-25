import { donationConfig } from "@/config/donations";
import { allocationLabel, getAllocationOptions } from "@/config/allocations";
import { attachPaymentSession, createPendingDonation, transitionDonation } from "@/lib/donations";
import { getPaymentConfig } from "@/lib/env";
import { PaytechError, requestPayment } from "@/lib/paytech";
import { clientIp, isJson, isSameOrigin, jsonError, logEvent, looksLikeSpam, rateLimit } from "@/lib/security";
import { validateDonation } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Crée une demande de paiement côté serveur et renvoie l'URL de redirection. */
export async function POST(request: Request) {
  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, "Requête refusée.");
  if (!rateLimit(`don:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return jsonError(429, "Trop de tentatives. Merci de patienter quelques minutes avant de réessayer.");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "Données invalides.");
  }
  if (looksLikeSpam(body, 1500)) return jsonError(400, "Votre demande n'a pas pu être traitée. Rechargez la page et réessayez.");

  const result = validateDonation(body, {
    minAmount: donationConfig.minAmount,
    maxAmount: donationConfig.maxAmount,
    allowedAllocations: getAllocationOptions().filter((o) => o.value !== "general").map((o) => o.value),
    recurringEnabled: donationConfig.recurringEnabled,
    allowAnonymous: donationConfig.allowAnonymous,
    askPhone: donationConfig.askPhone,
  });
  if (!result.ok) return jsonError(422, "Merci de vérifier les champs signalés.", result.errors);

  const cfg = getPaymentConfig();
  let created;
  try {
    created = await createPendingDonation(result.data, cfg.mode);
  } catch (err) {
    logEvent("don.stockage.erreur", { message: (err as Error).message });
    return jsonError(503, "Le service de don est momentanément indisponible. Merci de réessayer plus tard.");
  }
  const { donation, existing } = created;

  if (existing && donation.status !== "pending") {
    return jsonError(409, "Ce don a déjà été traité. Rechargez la page pour faire un nouveau don.");
  }
  if (existing && donation.redirectUrl) {
    return Response.json({ ok: true, ref: donation.ref, redirectUrl: donation.redirectUrl, mode: cfg.mode });
  }

  logEvent("don.cree", { ref: donation.ref, montant: donation.amount, mode: cfg.mode, affectation: donation.allocation ?? "general" });

  if (cfg.mode === "simulation") {
    const redirectUrl = `/faire-un-don/simulation?ref=${encodeURIComponent(donation.ref)}`;
    await attachPaymentSession(donation.ref, "simulation", redirectUrl);
    return Response.json({ ok: true, ref: donation.ref, redirectUrl, mode: cfg.mode });
  }

  const label = donation.allocation ? `Don - ${allocationLabel(donation.allocation).replace(/^(Programme|Projet) : /, "")}` : "Don à la Fondation Horizon Solidaire";
  try {
    const session = await requestPayment(donation, label);
    await attachPaymentSession(donation.ref, session.token, session.redirectUrl);
    return Response.json({ ok: true, ref: donation.ref, redirectUrl: session.redirectUrl, mode: cfg.mode });
  } catch (err) {
    logEvent("paytech.requete.erreur", { ref: donation.ref, message: err instanceof PaytechError ? err.message : "erreur réseau" });
    await transitionDonation(donation.ref, "failed", "system").catch(() => undefined);
    return jsonError(502, "Le service de paiement ne répond pas pour le moment. Aucun montant n'a été débité. Merci de réessayer dans quelques instants.");
  }
}
