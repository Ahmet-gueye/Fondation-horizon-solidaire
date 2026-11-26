import Link from "next/link";
import { Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Conditions de don", description: "Conditions applicables aux dons faits à la Fondation Horizon Solidaire.", path: "/conditions-de-don" });

export default function DonationTermsPage() {
  return (
    <>
      <PageHero title="Conditions de don" crumbs={[{ label: "Conditions de don" }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="info" title="Dons en ligne pas encore ouverts">
            <p>Aucun don ne peut actuellement être encaissé sur ce site. Ces conditions seront complétées et validées par la fondation avant l&apos;ouverture du paiement en ligne.</p>
          </Notice>
          <h2>Objet</h2>
          <p>Les présentes conditions encadreront les dons effectués en ligne au profit de la {site.name}.</p>
          <h2>Paiement prévu</h2>
          <p>
            Le paiement en ligne passera par la plateforme sécurisée PayTech, une fois le compte de la fondation activé et testé.
            Les devises envisagées sont : {donationConfig.plannedCurrencies.map((c) => c.code).join(", ")}. Elles ne sont pas disponibles à ce jour.
            Un don ne sera considéré comme reçu qu&apos;après confirmation du paiement par PayTech au serveur de la fondation.
          </p>
          <h2>Sécurité</h2>
          <p>Le site ne demande et ne conserve jamais de coordonnées bancaires, de numéro de carte ni de code Mobile Money.</p>
          <h2>Reçus et fiscalité</h2>
          <p>La délivrance de reçus et les éventuels avantages fiscaux dépendent du statut juridique réel de la fondation et de la législation applicable. Aucun avantage fiscal n&apos;est garanti à ce stade.</p>
          <h2>Soutenir la fondation aujourd&apos;hui</h2>
          <p><Link href="/contact?type=projet">Contactez la fondation</Link> pour connaître les moyens de soutien possibles pour le moment.</p>
          <h2>Données personnelles</h2>
          <p>Voir la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
        </div>
      </section>
    </>
  );
}
