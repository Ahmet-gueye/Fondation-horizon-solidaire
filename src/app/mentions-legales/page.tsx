import { Notice, ValueOr } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Mentions légales", description: "Mentions légales du site de la Fondation Horizon Solidaire.", path: "/mentions-legales" });

export default function LegalPage() {
  const { legal, contact } = site;
  return (
    <>
      <PageHero title="Mentions légales" crumbs={[{ label: "Mentions légales" }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="warn" title="Page à compléter"><p>Les informations ci-dessous doivent être renseignées à partir des documents officiels de la fondation et relues par un conseil juridique.</p></Notice>
          <h2>Éditeur du site</h2>
          <dl className="info-list">
            <div><dt>Dénomination</dt><dd>{site.name}</dd></div>
            <div><dt>Forme juridique</dt><dd><ValueOr value={legal.legalForm} /></dd></div>
            <div><dt>N° d&apos;enregistrement</dt><dd><ValueOr value={legal.registrationNumber} /></dd></div>
            <div><dt>NINEA</dt><dd><ValueOr value={legal.ninea} /></dd></div>
            <div><dt>Siège</dt><dd><ValueOr value={legal.headquarters} /></dd></div>
            <div><dt>Contact</dt><dd><ValueOr value={contact.email} /></dd></div>
            <div><dt>Directeur de la publication</dt><dd><ValueOr value={legal.publicationDirector} /></dd></div>
          </dl>
          <h2>Hébergement</h2>
          <p><ValueOr value={legal.host} label="Nom et adresse de l'hébergeur à compléter" /></p>
          <h2>Propriété intellectuelle</h2>
          <p>Les textes, le logo et les éléments graphiques de ce site sont la propriété de la {site.name} ou utilisés avec autorisation. Toute reproduction sans accord préalable est interdite. Les photographies sont publiées avec l&apos;accord des personnes concernées.</p>
          <h2>Paiements</h2>
          <p>Les paiements en ligne sont traités par le prestataire PayTech. Le site de la fondation ne collecte ni ne conserve aucune donnée de carte bancaire ou code de paiement mobile.</p>
        </div>
      </section>
    </>
  );
}
