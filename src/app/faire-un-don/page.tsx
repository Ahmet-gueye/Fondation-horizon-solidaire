import { DonationForm } from "@/components/DonationForm";
import { Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { getAllocationOptions } from "@/config/allocations";
import { getPaymentConfig } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Faire un don",
  description: "Soutenez les actions de la Fondation Horizon Solidaire au Sénégal par un don sécurisé en francs CFA.",
  path: "/faire-un-don",
});

export default async function DonatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const options = getAllocationOptions();
  const requested = typeof sp.affectation === "string" ? sp.affectation : "general";
  const initial = options.some((o) => o.value === requested) ? requested : "general";
  const { mode } = getPaymentConfig();

  return (
    <>
      {mode !== "prod" ? (
        <div className="sim-banner" role="note">
          {mode === "simulation"
            ? "Mode simulation : le parcours de don est démonstratif, aucun don réel n'est encaissé."
            : "Mode test PayTech : réservé aux essais internes, un petit montant de test est débité quel que soit le montant choisi."}
        </div>
      ) : null}
      <PageHero
        title="Faire un don"
        eyebrow="Soutenir nos actions"
        lead="Choisissez un montant, l'affectation de votre don, puis finalisez le paiement sur la page sécurisée de notre prestataire. Cela prend moins de deux minutes."
        crumbs={[{ label: "Faire un don" }]}
      />
      <section className="section">
        <div className="container">
          {requested !== "general" && initial === "general" ? (
            <div style={{ marginBottom: 20 }}>
              <Notice tone="info"><p>Le projet demandé n&apos;accepte pas de dons en ligne pour le moment. Vous pouvez faire un don général ou choisir un programme.</p></Notice>
            </div>
          ) : null}
          <DonationForm options={options} initialAllocation={initial} mode={mode} />
        </div>
      </section>
    </>
  );
}
