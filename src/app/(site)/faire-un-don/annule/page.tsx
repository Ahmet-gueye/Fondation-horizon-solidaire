import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/ui";
import { i18n } from "@/i18n/server";

export const metadata = { title: "Paiement interrompu", robots: { index: false, follow: false } };

/** Retour depuis PayTech après abandon. Aucun changement d'état ici : seule la notification PayTech fait foi. */
export default async function CancelPage() {
  const { t } = await i18n();
  return (
    <>
      <PageHero title={t("Paiement interrompu", "Payment interrupted")} crumbs={[{ href: "/faire-un-don", label: t("Faire un don", "Donate") }, { label: t("Paiement interrompu", "Payment interrupted") }]} />
      <section className="section">
        <div className="container">
          <div className="status-card">
            <div className="status-icon accent-sun"><Icon name="alert" /></div>
            <h2>{t("Votre paiement n'a pas été finalisé", "Your payment was not completed")}</h2>
            <p>{t("Vous avez quitté la page de paiement avant la fin. Si vous n'avez pas validé le paiement, aucun montant n'est débité.", "You left the payment page before the end. If you did not confirm the payment, nothing is charged.")}</p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/faire-un-don" className="btn">{t("Réessayer", "Try again")}</Link>
              <Link href="/contact?type=projet" className="btn btn-outline">{t("Nous contacter", "Contact us")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
