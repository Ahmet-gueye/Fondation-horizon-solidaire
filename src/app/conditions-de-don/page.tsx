import Link from "next/link";
import { Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { formatFCFA } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Conditions de don", description: "Conditions applicables aux dons en ligne faits à la Fondation Horizon Solidaire.", path: "/conditions-de-don" });

export default function DonationTermsPage() {
  return (
    <>
      <PageHero title="Conditions de don" crumbs={[{ label: "Conditions de don" }]} />
      <section className="section">
        <div className="container prose">
          <Notice tone="warn" title="Projet à valider"><p>Ces conditions doivent être relues et validées par la fondation avant la mise en ligne des dons réels.</p></Notice>
          <h2>Objet</h2>
          <p>Les présentes conditions encadrent les dons effectués en ligne au profit de la {site.name}.</p>
          <h2>Montants et devise</h2>
          <p>Les dons sont exprimés en francs CFA (XOF). Le montant minimum en ligne est de {formatFCFA(donationConfig.minAmount)} et le montant maximum de {formatFCFA(donationConfig.maxAmount)}.</p>
          <h2>Paiement</h2>
          <p>Le paiement est réalisé sur la plateforme sécurisée PayTech. Un don n&apos;est considéré comme reçu qu&apos;après confirmation du paiement par PayTech au serveur de la fondation. {donationConfig.feesNotice}</p>
          <h2>Affectation</h2>
          <p>Le donateur peut affecter son don à un programme ou à un projet ouvert aux dons, ou faire un don général. Si un projet est entièrement financé, annulé ou ne peut être réalisé, la fondation pourra réaffecter le don à un projet de même nature. <em>Règle à confirmer par la fondation.</em></p>
          <h2>Don anonyme</h2>
          <p>{donationConfig.allowAnonymous ? "Le donateur peut choisir de ne pas communiquer son nom et son e-mail. Il ne pourra alors pas être recontacté à propos de son don." : "Les dons anonymes ne sont pas acceptés en ligne."}</p>
          <h2>Reçus et fiscalité</h2>
          <p>La délivrance de reçus et les éventuels avantages fiscaux dépendent du statut juridique réel de la fondation et de la législation applicable. Aucun avantage fiscal n&apos;est garanti à ce stade.</p>
          <h2>Remboursement</h2>
          <p>Un don est en principe définitif. En cas d&apos;erreur manifeste (montant ou doublon), contactez la fondation en indiquant la référence du don. <em>Procédure à confirmer.</em></p>
          <h2>Données personnelles</h2>
          <p>Voir la <Link href="/confidentialite">politique de confidentialité</Link>.</p>
        </div>
      </section>
    </>
  );
}
