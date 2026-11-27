import Link from "next/link";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { EmailLinks, ToComplete } from "./Markers";

export async function Footer() {
  const { locale, t } = await i18n();
  const year = new Date().getFullYear();
  const { contact } = site;
  const en = locale === "en";
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand">
              <Logo />
              <span className="brand-name">
                <strong>{site.name}</strong>
                <small>{t(`Au service des communautés du ${site.country}`, `Serving communities in ${site.en.country}`)}</small>
              </span>
            </Link>
            <p className="footer-motto">{en ? `“${site.en.motto}”` : `« ${site.motto} »`}</p>
            <p className="small">{en ? site.en.description : site.description}</p>
          </div>

          <div>
            <p className="footer-title">{t("La fondation", "The foundation")}</p>
            <ul>
              <li><Link href="/qui-sommes-nous">{t("Qui sommes-nous ?", "About us")}</Link></li>
              <li><Link href="/programmes">{t("Nos programmes", "Our programmes")}</Link></li>
              <li><Link href="/activites">{t("Activités et campagnes", "Activities and campaigns")}</Link></li>
              <li><Link href="/transparence">{t("Transparence et rapports", "Transparency and reports")}</Link></li>
              <li><Link href="/actualites">{t("Actualités", "News")}</Link></li>
              <li><Link href="/galerie">{t("Galerie", "Gallery")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-title">{t("Agir avec nous", "Get involved")}</p>
            <ul>
              <li><Link href="/faire-un-don">{t("Nous soutenir", "Support us")}</Link></li>
              <li><Link href="/engagez-vous#benevolat">{t("Devenir bénévole", "Become a volunteer")}</Link></li>
              <li><Link href="/engagez-vous#partenariat">{t("Proposer un partenariat", "Propose a partnership")}</Link></li>
              <li><Link href="/contact">{t("Nous écrire", "Write to us")}</Link></li>
              <li><Link href="/faq">{t("Questions fréquentes", "FAQ")}</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-title">{t("Contact", "Contact")}</p>
            <ul>
              <li className="row-wrap">
                <Icon name="mail" />
                <EmailLinks emails={contact.emails} label={t("E-mail à compléter", "Email to be added")} />
              </li>
              <li className="row-wrap">
                <Icon name="phone" />
                {contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : <ToComplete label={t("Téléphone à compléter", "Phone number to be added")} />}
              </li>
              <li className="row-wrap">
                <Icon name="pin" />
                {contact.address ? <span>{contact.address}</span> : <ToComplete label={t("Adresse à compléter", "Address to be added")} />}
              </li>
            </ul>
            <p className="footer-title mt-3">{t("Réseaux sociaux", "Social media")}</p>
            {site.socials.length > 0 ? (
              <ul>
                {site.socials.map((s) => (
                  <li key={s.url}><a href={s.url} rel="noopener noreferrer" target="_blank">{s.label}<span className="visually-hidden"> {t("(nouvel onglet)", "(new tab)")}</span></a></li>
                ))}
              </ul>
            ) : (
              <ToComplete label={t("Comptes officiels à renseigner", "Official accounts to be added")} />
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">
            © {year} {site.name}. {t("Tous droits réservés.", "All rights reserved.")}{" "}
            {t("Ce site n'utilise aucun traceur publicitaire ni cookie de mesure d'audience.", "This website uses no advertising trackers and no audience measurement cookies.")}
          </p>
          <ul>
            <li><Link href="/mentions-legales">{t("Mentions légales", "Legal notice")}</Link></li>
            <li><Link href="/confidentialite">{t("Confidentialité", "Privacy")}</Link></li>
            <li><Link href="/conditions-de-don">{t("Conditions de don", "Donation terms")}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
