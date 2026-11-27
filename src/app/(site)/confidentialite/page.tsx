import { EmailLinks, Notice, ValueOr } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({ title: t("Politique de confidentialité", "Privacy policy"), description: t("Comment la Fondation Horizon Solidaire protège vos données personnelles.", "How Fondation Horizon Solidaire protects your personal data."), path: "/confidentialite", locale });
}

export default async function PrivacyPage() {
  const { t } = await i18n();
  return (
    <>
      <PageHero title={t("Politique de confidentialité", "Privacy policy")} crumbs={[{ label: t("Confidentialité", "Privacy") }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="warn" title={t("Projet à valider", "Draft to be approved")}>
            <p>
              {t(
                "Ce texte est une base de travail. Il doit être validé par la fondation au regard de la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel et, le cas échéant, des formalités auprès de la Commission de protection des données personnelles (CDP).",
                "This text is a working draft. It must be approved by the foundation in the light of Senegalese Law No. 2008-12 on the protection of personal data and, where applicable, the formalities with the Personal Data Protection Commission (CDP).",
              )}
            </p>
          </Notice>
          <h2>{t("Responsable du traitement", "Data controller")}</h2>
          <p>{site.name}. {t("Contact :", "Contact:")} <EmailLinks emails={site.contact.emails} /></p>
          <h2>{t("Données collectées", "Data collected")}</h2>
          <ul>
            <li>
              <strong>{t("Dons :", "Donations:")}</strong>{" "}
              {t(
                "le don en ligne n'est pas encore ouvert. Le site ne collecte aucune donnée de carte bancaire ni code Mobile Money, et n'en collectera jamais : le jour où le paiement en ligne ouvrira, ces informations seront saisies uniquement sur la page sécurisée de PayTech.",
                "online giving is not open yet. The website does not collect any bank card data or Mobile Money code, and never will: when online payment opens, this information will only be entered on PayTech's secure page.",
              )}
            </li>
            <li>
              <strong>{t("Espace d'administration :", "Administration area:")}</strong>{" "}
              {t(
                "nom, adresse e-mail et rôle des personnes habilitées, et un historique des modifications (auteur, date, action).",
                "name, email address and role of authorised people, and a history of changes (author, date, action).",
              )}
            </li>
            <li>
              <strong>{t("Formulaires de contact, bénévolat et partenariat :", "Contact, volunteering and partnership forms:")}</strong>{" "}
              {t("nom, e-mail, téléphone facultatif, organisation, message.", "name, email, optional phone number, organisation, message.")}
            </li>
          </ul>
          <h2>{t("Finalités", "Purposes")}</h2>
          <p>
            {t(
              "Traiter les dons et en assurer le suivi comptable, répondre à vos demandes, organiser le bénévolat et les partenariats. Vos données ne sont ni vendues ni cédées à des tiers à des fins commerciales.",
              "Processing donations and keeping their accounts, answering your requests, organising volunteering and partnerships. Your data is never sold or passed on to third parties for commercial purposes.",
            )}
          </p>
          <h2>{t("Destinataires", "Recipients")}</h2>
          <p>
            {t(
              "Les personnes habilitées de la fondation et, techniquement, ses hébergeurs (site, base de données, stockage des fichiers). Le prestataire de paiement PayTech le sera aussi lorsque le don en ligne ouvrira.",
              "Authorised people at the foundation and, technically, its hosting providers (website, database, file storage). The payment provider PayTech will also be a recipient once online giving opens.",
            )}
          </p>
          <h2>{t("Durée de conservation", "Retention period")}</h2>
          <p><ValueOr value={null} label={t("Durées de conservation à définir par la fondation", "Retention periods to be set by the foundation")} /></p>
          <h2>{t("Cookies et mesure d'audience", "Cookies and audience measurement")}</h2>
          <p>
            {t(
              "Ce site n'utilise aucun cookie publicitaire, aucun traceur de réseau social et aucun outil de mesure d'audience. Seul un petit cookie technique mémorise la langue choisie (français ou anglais) si vous en changez. Les polices de caractères sont hébergées sur le site lui-même. Aucun bandeau de consentement n'est donc nécessaire. Si des outils de ce type étaient ajoutés, cette page serait mise à jour et votre consentement serait demandé au préalable.",
              "This website uses no advertising cookies, no social media trackers and no audience measurement tools. A small technical cookie only remembers the language you chose (French or English) if you change it. Fonts are hosted on the website itself. No consent banner is therefore needed. If such tools were ever added, this page would be updated and your consent would be asked first.",
            )}
          </p>
          <h2>{t("Vos droits", "Your rights")}</h2>
          <p>
            {t(
              "Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ou vous opposer à leur traitement, en écrivant à la fondation.",
              "You can ask to access, correct or delete your data, or object to its processing, by writing to the foundation.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}
