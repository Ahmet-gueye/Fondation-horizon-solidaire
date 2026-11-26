import Link from "next/link";
import { site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { ToComplete } from "./Markers";
import { EmailLinks } from "./Markers";

const t = getDictionary();

export function Footer() {
  const year = new Date().getFullYear();
  const { contact } = site;
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand">
              <Logo />
              <span className="brand-name">
                <strong>{site.name}</strong>
                <small>Au service des communautés du {site.country}</small>
              </span>
            </Link>
            <p className="footer-motto">« {site.motto} »</p>
            <p className="small">{site.description}</p>
          </div>

          <div>
            <p className="footer-title">{t.footer.about}</p>
            <ul>
              <li><Link href="/qui-sommes-nous">Qui sommes-nous ?</Link></li>
              <li><Link href="/programmes">Nos programmes</Link></li>
              <li><Link href="/activites">Activités et campagnes</Link></li>
              <li><Link href="/transparence">Transparence et rapports</Link></li>
              <li><Link href="/actualites">Actualités</Link></li>
              <li><Link href="/galerie">Galerie</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-title">{t.footer.act}</p>
            <ul>
              <li><Link href="/faire-un-don">Nous soutenir</Link></li>
              <li><Link href="/engagez-vous#benevolat">Devenir bénévole</Link></li>
              <li><Link href="/engagez-vous#partenariat">Proposer un partenariat</Link></li>
              <li><Link href="/contact">Nous écrire</Link></li>
              <li><Link href="/faq">{t.footer.faq}</Link></li>
            </ul>
          </div>

          <div>
            <p className="footer-title">{t.footer.contact}</p>
            <ul>
              <li className="row-wrap">
                <Icon name="mail" />
                <EmailLinks emails={contact.emails} />
              </li>
              <li className="row-wrap">
                <Icon name="phone" />
                {contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : <ToComplete label="Téléphone à compléter" />}
              </li>
              <li className="row-wrap">
                <Icon name="pin" />
                {contact.address ? <span>{contact.address}</span> : <ToComplete label="Adresse à compléter" />}
              </li>
            </ul>
            <p className="footer-title mt-3">Réseaux sociaux</p>
            {site.socials.length > 0 ? (
              <ul>
                {site.socials.map((s) => (
                  <li key={s.url}><a href={s.url} rel="noopener noreferrer" target="_blank">{s.label}<span className="visually-hidden"> (nouvel onglet)</span></a></li>
                ))}
              </ul>
            ) : (
              <ToComplete label="Comptes officiels à renseigner" />
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">© {year} {site.name}. {t.footer.rights} {t.footer.noTracking}</p>
          <ul>
            <li><Link href="/mentions-legales">{t.footer.legal}</Link></li>
            <li><Link href="/confidentialite">{t.footer.privacy}</Link></li>
            <li><Link href="/conditions-de-don">{t.footer.donationTerms}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
