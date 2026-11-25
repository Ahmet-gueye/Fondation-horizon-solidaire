import { Notice, ValueOr } from "@/components/Markers";
import { EmailLinks } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Politique de confidentialité", description: "Comment la Fondation Horizon Solidaire protège vos données personnelles.", path: "/confidentialite" });

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Politique de confidentialité" crumbs={[{ label: "Confidentialité" }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="warn" title="Projet à valider">
            <p>Ce texte est une base de travail. Il doit être validé par la fondation au regard de la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel et, le cas échéant, des formalités auprès de la Commission de protection des données personnelles (CDP).</p>
          </Notice>
          <h2>Responsable du traitement</h2>
          <p>{site.name}. Contact : <EmailLinks emails={site.contact.emails} /></p>
          <h2>Données collectées</h2>
          <ul>
            <li><strong>Formulaire de don :</strong> montant, affectation, nom et adresse e-mail (sauf don anonyme), état du paiement et référence. Aucune donnée de carte bancaire ni code de paiement mobile n&apos;est collecté par le site : ils sont saisis uniquement sur la page sécurisée de PayTech.</li>
            <li><strong>Formulaires de contact, bénévolat et partenariat :</strong> nom, e-mail, téléphone facultatif, organisation, message.</li>
          </ul>
          <h2>Finalités</h2>
          <p>Traiter les dons et en assurer le suivi comptable, répondre à vos demandes, organiser le bénévolat et les partenariats. Vos données ne sont ni vendues ni cédées à des tiers à des fins commerciales.</p>
          <h2>Destinataires</h2>
          <p>Les personnes habilitées de la fondation et le prestataire de paiement PayTech, pour la seule exécution du paiement.</p>
          <h2>Durée de conservation</h2>
          <p><ValueOr value={null} label="Durées de conservation à définir par la fondation" /></p>
          <h2>Cookies et mesure d&apos;audience</h2>
          <p>Ce site n&apos;utilise aucun cookie publicitaire, aucun traceur de réseau social et aucun outil de mesure d&apos;audience. Les polices de caractères sont hébergées sur le site lui-même. Aucun bandeau de consentement n&apos;est donc nécessaire. Si des outils de ce type étaient ajoutés, cette page serait mise à jour et votre consentement serait demandé au préalable.</p>
          <h2>Vos droits</h2>
          <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données, ou vous opposer à leur traitement, en écrivant à la fondation.</p>
        </div>
      </section>
    </>
  );
}
