import { EmailLinks, Notice, ValueOr } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({ title: t("Mentions légales", "Legal notice"), description: t("Mentions légales du site de la Fondation Horizon Solidaire.", "Legal notice of the Fondation Horizon Solidaire website."), path: "/mentions-legales", locale });
}

export default async function LegalPage() {
  const { t } = await i18n();
  const { legal, contact } = site;
  const tc = t("À compléter par la fondation", "To be provided by the foundation");
  return (
    <>
      <PageHero title={t("Mentions légales", "Legal notice")} crumbs={[{ label: t("Mentions légales", "Legal notice") }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="warn" title={t("Page à compléter", "Page to be completed")}>
            <p>{t("Les informations ci-dessous doivent être renseignées à partir des documents officiels de la fondation et relues par un conseil juridique.", "The information below must be filled in from the foundation's official documents and reviewed by a legal adviser.")}</p>
          </Notice>
          <h2>{t("Éditeur du site", "Website publisher")}</h2>
          <dl className="info-list">
            <div><dt>{t("Dénomination", "Name")}</dt><dd>{site.name}</dd></div>
            <div><dt>{t("Forme juridique", "Legal form")}</dt><dd><ValueOr value={legal.legalForm} label={tc} /></dd></div>
            <div><dt>{t("N° d'enregistrement", "Registration number")}</dt><dd><ValueOr value={legal.registrationNumber} label={tc} /></dd></div>
            <div><dt>NINEA</dt><dd><ValueOr value={legal.ninea} label={tc} /></dd></div>
            <div><dt>{t("Siège", "Head office")}</dt><dd><ValueOr value={legal.headquarters} label={tc} /></dd></div>
            <div><dt>{t("Contact", "Contact")}</dt><dd><EmailLinks emails={contact.emails} /></dd></div>
            <div><dt>{t("Directeur de la publication", "Publication director")}</dt><dd><ValueOr value={legal.publicationDirector} label={tc} /></dd></div>
          </dl>
          <h2>{t("Hébergement", "Hosting")}</h2>
          <p><ValueOr value={legal.host} label={t("Nom et adresse de l'hébergeur à compléter", "Host name and address to be added")} /></p>
          <h2>{t("Propriété intellectuelle", "Intellectual property")}</h2>
          <p>
            {t(
              `Les textes, le logo et les éléments graphiques de ce site sont la propriété de la ${site.name} ou utilisés avec autorisation. Toute reproduction sans accord préalable est interdite. Les photographies sont publiées avec l'accord des personnes concernées.`,
              `The texts, logo and graphic elements of this website are the property of ${site.name} or used with permission. Any reproduction without prior consent is prohibited. Photographs are published with the consent of the people concerned.`,
            )}
          </p>
          <h2>{t("Paiements", "Payments")}</h2>
          <p>
            {t(
              "Les paiements en ligne sont traités par le prestataire PayTech. Le site de la fondation ne collecte ni ne conserve aucune donnée de carte bancaire ou code de paiement mobile.",
              "Online payments are handled by the provider PayTech. The foundation's website does not collect or store any bank card data or mobile payment code.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}
