import Link from "next/link";
import { Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({ title: t("Conditions de don", "Donation terms"), description: t("Conditions applicables aux dons faits à la Fondation Horizon Solidaire.", "Terms applying to donations made to Fondation Horizon Solidaire."), path: "/conditions-de-don", locale });
}

export default async function DonationTermsPage() {
  const { t } = await i18n();
  const codes = donationConfig.plannedCurrencies.map((c) => c.code).join(", ");
  return (
    <>
      <PageHero title={t("Conditions de don", "Donation terms")} crumbs={[{ label: t("Conditions de don", "Donation terms") }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="info" title={t("Dons en ligne pas encore ouverts", "Online giving not open yet")}>
            <p>
              {t(
                "Aucun don ne peut actuellement être encaissé sur ce site. Ces conditions seront complétées et validées par la fondation avant l'ouverture du paiement en ligne.",
                "No donation can currently be collected on this website. These terms will be completed and approved by the foundation before online payment opens.",
              )}
            </p>
          </Notice>
          <h2>{t("Objet", "Purpose")}</h2>
          <p>{t(`Les présentes conditions encadreront les dons effectués en ligne au profit de la ${site.name}.`, `These terms will govern online donations made to ${site.name}.`)}</p>
          <h2>{t("Paiement prévu", "Planned payment")}</h2>
          <p>
            {t(
              `Le paiement en ligne passera par la plateforme sécurisée PayTech, une fois le compte de la fondation activé et testé. Les devises envisagées sont : ${codes}. Elles ne sont pas disponibles à ce jour. Un don ne sera considéré comme reçu qu'après confirmation du paiement par PayTech au serveur de la fondation.`,
              `Online payment will go through the secure PayTech platform, once the foundation's account has been activated and tested. The currencies being considered are: ${codes}. They are not available yet. A donation will only be considered received after PayTech confirms the payment to the foundation's server.`,
            )}
          </p>
          <h2>{t("Sécurité", "Security")}</h2>
          <p>{t("Le site ne demande et ne conserve jamais de coordonnées bancaires, de numéro de carte ni de code Mobile Money.", "The website never asks for or stores bank details, card numbers or Mobile Money codes.")}</p>
          <h2>{t("Reçus et fiscalité", "Receipts and tax")}</h2>
          <p>
            {t(
              "La délivrance de reçus et les éventuels avantages fiscaux dépendent du statut juridique réel de la fondation et de la législation applicable. Aucun avantage fiscal n'est garanti à ce stade.",
              "Whether receipts can be issued, and any tax benefit, depends on the foundation's actual legal status and on the applicable law. No tax benefit is guaranteed at this stage.",
            )}
          </p>
          <h2>{t("Soutenir la fondation aujourd'hui", "Supporting the foundation today")}</h2>
          <p>
            <Link href="/contact?type=projet">{t("Contactez la fondation", "Contact the foundation")}</Link>{" "}
            {t("pour connaître les moyens de soutien possibles pour le moment.", "to find out the ways you can help for now.")}
          </p>
          <h2>{t("Données personnelles", "Personal data")}</h2>
          <p>{t("Voir la", "See the")} <Link href="/confidentialite">{t("politique de confidentialité", "privacy policy")}</Link>.</p>
        </div>
      </section>
    </>
  );
}
