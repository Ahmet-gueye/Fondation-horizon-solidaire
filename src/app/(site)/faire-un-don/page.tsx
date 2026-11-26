import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EmailLinks, Notice, ToComplete } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Soutenir la fondation",
  description: "Le paiement en ligne sera bientôt disponible. Découvrez comment soutenir dès maintenant la Fondation Horizon Solidaire.",
  path: "/faire-un-don",
});

export default function DonatePage() {
  const phone = site.contact.phone;
  return (
    <>
      <PageHero
        title="Soutenir la fondation"
        eyebrow="Faire un don"
        lead="Merci de votre envie de soutenir nos actions au Sénégal. Le don en ligne est en cours de préparation."
        crumbs={[{ label: "Soutenir la fondation" }]}
      />
      <section className="section">
        <div className="container container-narrow stack">
          <Notice tone="info" title="Le paiement en ligne sera bientôt disponible">
            <p>
              Aucun don ne peut actuellement être encaissé sur ce site. Le site ne vous demandera jamais vos
              coordonnées bancaires, votre numéro de carte ou votre code Mobile Money.
            </p>
          </Notice>

          <div className="card">
            <div className="icon-tile accent-green"><Icon name="mail" /></div>
            <h2 style={{ fontSize: "1.35rem" }}>Vous souhaitez nous soutenir dès maintenant ?</h2>
            <p>
              Contactez directement la fondation : l&apos;équipe vous indiquera les moyens de soutien possibles pour le moment
              (don, dons en nature, mécénat de compétences, partenariat).
            </p>
            <ul className="contact-list">
              {phone ? (
                <li><Icon name="phone" /><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
              ) : (
                <li><Icon name="phone" /><ToComplete label="Téléphone à compléter" /></li>
              )}
              <li><Icon name="mail" /><EmailLinks emails={site.contact.emails} /></li>
            </ul>
            <div className="row-wrap mt-2">
              <Link href="/contact?type=projet" className="btn"><Icon name="mail" />Écrire à la fondation</Link>
              <Link href="/engagez-vous" className="btn btn-outline">Donner de son temps</Link>
            </div>
            <p className="small muted mb-0">
              Pour votre sécurité : la fondation ne publie aucune coordonnée de paiement sur ce site pour le moment. Méfiez-vous
              de toute demande de paiement qui ne viendrait pas des contacts officiels ci-dessus.
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1.2rem" }}>Ce qui est prévu</h2>
            <p>
              Le don en ligne passera par la plateforme de paiement sécurisée PayTech, dès que le compte de la fondation sera
              activé et testé. Les devises envisagées sont :{" "}
              {donationConfig.plannedCurrencies.map((c) => `${c.label} (${c.code})`).join(", ")}.
            </p>
            <p className="small muted mb-0">
              Ces devises et moyens de paiement ne sont pas encore disponibles. Cette page sera mise à jour lorsque le paiement en
              ligne sera ouvert.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
