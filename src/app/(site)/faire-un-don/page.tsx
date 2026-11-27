import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EmailLinks, Notice, ToComplete } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Soutenir la fondation", "Support the foundation"),
    description: t(
      "Le paiement en ligne sera bientôt disponible. Découvrez comment soutenir dès maintenant la Fondation Horizon Solidaire.",
      "Online payment will be available soon. Find out how you can support Fondation Horizon Solidaire right now.",
    ),
    path: "/faire-un-don",
    locale,
  });
}

export default async function DonatePage() {
  const { locale, t } = await i18n();
  const phone = site.contact.phone;
  return (
    <>
      <PageHero
        title={t("Soutenir la fondation", "Support the foundation")}
        eyebrow={t("Faire un don", "Donate")}
        lead={t(
          "Merci de votre envie de soutenir nos actions au Sénégal. Le don en ligne est en cours de préparation.",
          "Thank you for wanting to support our work in Senegal. Online giving is being prepared.",
        )}
        crumbs={[{ label: t("Soutenir la fondation", "Support the foundation") }]}
      />
      <section className="section">
        <div className="container container-narrow stack">
          <Notice tone="info" title={t("Le paiement en ligne sera bientôt disponible", "Online payment will be available soon")}>
            <p>
              {t(
                "Aucun don ne peut actuellement être encaissé sur ce site. Le site ne vous demandera jamais vos coordonnées bancaires, votre numéro de carte ou votre code Mobile Money.",
                "No donation can currently be collected on this website. The website will never ask for your bank details, your card number or your Mobile Money code.",
              )}
            </p>
          </Notice>

          <div className="card">
            <div className="icon-tile accent-green"><Icon name="mail" /></div>
            <h2 style={{ fontSize: "1.35rem" }}>{t("Vous souhaitez nous soutenir dès maintenant ?", "Would you like to support us now?")}</h2>
            <p>
              {t(
                "Contactez directement la fondation : l'équipe vous indiquera les moyens de soutien possibles pour le moment (don, dons en nature, mécénat de compétences, partenariat).",
                "Contact the foundation directly: the team will tell you the ways you can help for now (donation, in-kind donations, skills sponsorship, partnership).",
              )}
            </p>
            <ul className="contact-list">
              {phone ? (
                <li><Icon name="phone" /><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
              ) : (
                <li><Icon name="phone" /><ToComplete label={t("Téléphone à compléter", "Phone number to be added")} /></li>
              )}
              <li><Icon name="mail" /><EmailLinks emails={site.contact.emails} /></li>
            </ul>
            <div className="row-wrap mt-2">
              <Link href="/contact?type=projet" className="btn"><Icon name="mail" />{t("Écrire à la fondation", "Write to the foundation")}</Link>
              <Link href="/engagez-vous" className="btn btn-outline">{t("Donner de son temps", "Give your time")}</Link>
            </div>
            <p className="small muted mb-0">
              {t(
                "Pour votre sécurité : la fondation ne publie aucune coordonnée de paiement sur ce site pour le moment. Méfiez-vous de toute demande de paiement qui ne viendrait pas des contacts officiels ci-dessus.",
                "For your safety: the foundation does not publish any payment details on this website for the moment. Be wary of any payment request that does not come from the official contacts above.",
              )}
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1.2rem" }}>{t("Ce qui est prévu", "What is planned")}</h2>
            <p>
              {t(
                "Le don en ligne passera par la plateforme de paiement sécurisée PayTech, dès que le compte de la fondation sera activé et testé. Les devises envisagées sont :",
                "Online giving will go through the secure PayTech payment platform, as soon as the foundation's account has been activated and tested. The currencies being considered are:",
              )}{" "}
              {donationConfig.plannedCurrencies.map((c) => `${locale === "en" ? c.labelEn : c.label} (${c.code})`).join(", ")}.
            </p>
            <p className="small muted mb-0">
              {t(
                "Ces devises et moyens de paiement ne sont pas encore disponibles. Cette page sera mise à jour lorsque le paiement en ligne sera ouvert.",
                "These currencies and payment methods are not available yet. This page will be updated when online payment opens.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
