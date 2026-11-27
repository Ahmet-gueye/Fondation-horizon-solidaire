import { getPublicProgrammes } from "@/content/programmes";
import { currentUser } from "@/lib/auth/session";
import { StorageNotConfigured } from "@/lib/db/docstore";
import { getSiteUrl } from "@/lib/env";
import { getPublicFicheBySlug } from "@/lib/fiches/repo";
import { createDon, getDon, paymentMode, setDonToken } from "@/lib/payments/dons";
import { newDonationRef, validateDonation } from "@/lib/payments/donation-validate";
import { PaytechError, readPaytechConfig, requestPayment } from "@/lib/payments/paytech";
import { clientIp, isJson, isSameOrigin, jsonError, logEvent, looksLikeSpam, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée un don « en attente » puis demande à PayTech une page de paiement.
 * Le navigateur est ensuite redirigé vers PayTech : aucune donnée de paiement ne passe par le site.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const en = body?.locale === "en";
  const msg = (fr: string, english: string) => (en ? english : fr);

  if (!isSameOrigin(request) || !isJson(request)) return jsonError(403, msg("Requête refusée.", "Request refused."));
  const cfg = readPaytechConfig();
  const mode = paymentMode();
  if (!cfg || mode === "off") return jsonError(503, msg("Le don en ligne n'est pas ouvert.", "Online giving is not open."));
  // En mode test, seules les personnes connectées à l'administration peuvent essayer.
  if (mode === "test" && !(await currentUser())) return jsonError(403, msg("Le don en ligne n'est pas encore ouvert au public.", "Online giving is not open to the public yet."));
  if (!rateLimit(`dons:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return jsonError(429, msg("Trop de tentatives en peu de temps. Merci de réessayer dans quelques minutes.", "Too many attempts in a short time. Please try again in a few minutes."));
  }
  if (!body) return jsonError(400, msg("Données invalides.", "Invalid data."));
  if (looksLikeSpam(body, 1500)) return jsonError(400, msg("Merci de réessayer.", "Please try again."));

  const result = validateDonation(body, getPublicProgrammes().map((p) => p.slug));
  if (!result.ok) return jsonError(422, msg("Merci de vérifier les champs signalés.", "Please check the highlighted fields."), result.errors);
  const d = result.data;

  const fiche = d.campagne ? await getPublicFicheBySlug(d.campagne) : null;
  const programme = fiche?.domain ?? d.programme;
  const programmeTitle = getPublicProgrammes().find((p) => p.slug === programme)?.shortTitle ?? null;

  const base = getSiteUrl();
  if (!base.startsWith("https://") && cfg.env === "prod") {
    logEvent("paytech.config.url_non_https", {});
    return jsonError(503, msg("Le paiement est momentanément indisponible.", "Payment is temporarily unavailable."));
  }

  let ref = newDonationRef();
  try {
    for (let i = 0; i < 3 && (await getDon(ref)); i++) ref = newDonationRef();
    const don = await createDon({
      ref,
      amount: d.amount,
      currency: d.currency,
      programme,
      ficheId: fiche?.id ?? null,
      ficheTitle: fiche?.title ?? null,
      donorName: d.donorName,
      donorEmail: d.donorEmail,
      locale: d.locale,
      env: cfg.env,
    });
    const target = fiche ? fiche.title : programmeTitle ? `Programme ${programmeTitle}` : "Besoins prioritaires";
    const { token, redirectUrl } = await requestPayment(cfg, {
      ref,
      amount: d.amount,
      currency: d.currency,
      itemName: "Don à la Fondation Horizon Solidaire",
      commandName: `Don ${ref} : ${target}`,
      ipnUrl: `${base}/api/paytech/ipn`,
      successUrl: `${base}/faire-un-don/merci?ref=${ref}`,
      cancelUrl: `${base}/faire-un-don/annule?ref=${ref}`,
    });
    await setDonToken(don, token);
    logEvent("paytech.don.cree", { ref, env: cfg.env, devise: d.currency });
    return Response.json({ ok: true, redirectUrl });
  } catch (err) {
    if (err instanceof StorageNotConfigured) return jsonError(503, msg("Le site n'est pas encore relié à sa base de données.", "The website is not yet connected to its database."));
    logEvent("paytech.don.erreur", { ref, message: err instanceof PaytechError ? err.message : (err as Error).message });
    return jsonError(502, msg("PayTech n'a pas pu ouvrir la page de paiement. Merci de réessayer un peu plus tard.", "PayTech could not open the payment page. Please try again a little later."));
  }
}
