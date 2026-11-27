import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/ui";
import { getPublicProgrammes } from "@/content/programmes";
import { i18n } from "@/i18n/server";
import { formatDate, formatNumber } from "@/lib/format";
import { isDonationRef } from "@/lib/payments/donation-validate";
import { getDon } from "@/lib/payments/dons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merci", robots: { index: false, follow: false } };

/**
 * Page de retour après PayTech. Elle affiche l'état du don LU SUR LE SERVEUR :
 * le simple fait d'arriver ici ne prouve pas que le paiement a réussi.
 */
export default async function ThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, t } = await i18n();
  const ref = (await searchParams).ref;
  const don = isDonationRef(ref) ? await getDon(ref).catch(() => null) : null;
  const amount = don ? `${formatNumber(don.amount, locale)} ${don.currency === "XOF" ? "FCFA" : don.currency}` : "";
  const target = don?.ficheTitle ?? getPublicProgrammes(locale).find((p) => p.slug === don?.programme)?.title ?? t("les besoins prioritaires de la fondation", "the foundation's priority needs");

  return (
    <>
      <PageHero title={t("Votre don", "Your donation")} crumbs={[{ href: "/faire-un-don", label: t("Faire un don", "Donate") }, { label: t("Confirmation", "Confirmation") }]} />
      <section className="section">
        <div className="container">
          {!don ? (
            <div className="status-card">
              <div className="status-icon accent-sun"><Icon name="search" /></div>
              <h2>{t("Don introuvable", "Donation not found")}</h2>
              <p>{t("Nous ne retrouvons pas cette référence de don. Si vous avez été débité, contactez-nous en indiquant la date et le montant.", "We cannot find this donation reference. If you were charged, contact us with the date and amount.")}</p>
              <Link href="/contact?type=projet" className="btn">{t("Nous contacter", "Contact us")}</Link>
            </div>
          ) : don.status === "paye" ? (
            <div className="status-card" role="status">
              <div className="status-icon accent-green"><Icon name="check" /></div>
              <h2>{t("Merci pour votre générosité !", "Thank you for your generosity!")}</h2>
              <p>
                {t(`Votre don de ${amount} pour ${target} a bien été reçu.`, `Your donation of ${amount} for ${target} has been received.`)}
                {don.paidAt ? ` ${t("Confirmé par PayTech le", "Confirmed by PayTech on")} ${formatDate(don.paidAt, locale)}.` : ""}
              </p>
              <p className="small muted">{t("Référence :", "Reference:")} <strong>{don.ref}</strong>. {t("Gardez-la si vous contactez la fondation à propos de ce don.", "Keep it if you contact the foundation about this donation.")}</p>
              <div className="hero-actions" style={{ justifyContent: "center" }}>
                <Link href="/activites" className="btn">{t("Voir nos actions", "See our actions")}</Link>
                <Link href="/transparence" className="btn btn-outline">{t("Comment les dons sont utilisés", "How donations are used")}</Link>
              </div>
            </div>
          ) : don.status === "en_attente" ? (
            <div className="status-card" role="status" aria-live="polite">
              <div className="status-icon accent-sun"><span className="spinner" aria-hidden="true" /></div>
              <h2>{t("Paiement en cours de confirmation", "Payment being confirmed")}</h2>
              <p>
                {t(
                  `Merci ! Nous attendons la confirmation de PayTech pour votre don de ${amount}. Cela prend en général quelques secondes ; cette page se met à jour toute seule.`,
                  `Thank you! We are waiting for PayTech to confirm your donation of ${amount}. This usually takes a few seconds; this page updates by itself.`,
                )}
              </p>
              <p className="small muted">
                {t(
                  "Si vous avez quitté la page de paiement sans payer, aucun montant n'est débité.",
                  "If you left the payment page without paying, nothing is charged.",
                )}{" "}
                {t("Référence :", "Reference:")} <strong>{don.ref}</strong>
              </p>
              <AutoRefresh />
            </div>
          ) : (
            <div className="status-card" role="status">
              <div className="status-icon accent-sun"><Icon name="alert" /></div>
              <h2>{don.status === "rembourse" ? t("Don remboursé", "Donation refunded") : t("Paiement non abouti", "Payment not completed")}</h2>
              <p>{don.status === "rembourse" ? t("Ce don a été remboursé.", "This donation has been refunded.") : t("Ce paiement a été annulé : aucun montant n'a été encaissé par la fondation.", "This payment was cancelled: the foundation has not received any money.")}</p>
              <Link href="/faire-un-don" className="btn">{t("Faire un nouveau don", "Make a new donation")}</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
