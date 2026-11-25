import { notFound } from "next/navigation";
import { SimulationPanel } from "@/components/SimulationPanel";
import { getDonation } from "@/lib/donations";
import { getPaymentConfig } from "@/lib/env";
import { formatFCFA } from "@/lib/format";
import { allocationLabel } from "@/config/allocations";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Simulation de paiement", description: "Simulation du parcours de paiement.", path: "/faire-un-don/simulation", noIndex: true });

export default async function SimulationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (getPaymentConfig().mode !== "simulation") notFound();
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const donation = ref ? await getDonation(ref) : undefined;
  if (!donation || donation.mode !== "simulation") notFound();

  return (
    <>
      <div className="sim-banner" role="note">Mode simulation : cette page remplace la page de paiement PayTech. Aucun argent n&apos;est échangé.</div>
      <section className="section">
        <div className="container">
          <div className="status-card">
            <span className="badge badge-example">Simulation</span>
            <h1 className="mt-2" style={{ fontSize: "1.8rem" }}>Page de paiement simulée</h1>
            <p>En production, le donateur serait redirigé ici vers la page sécurisée de PayTech pour choisir son moyen de paiement.</p>
            <dl className="info-list" style={{ textAlign: "left", margin: "20px 0" }}>
              <div><dt>Référence</dt><dd>{donation.ref}</dd></div>
              <div><dt>Montant</dt><dd>{formatFCFA(donation.amount)}</dd></div>
              <div><dt>Affectation</dt><dd>{allocationLabel(donation.allocation)}</dd></div>
              <div><dt>État actuel</dt><dd>{donation.status}</dd></div>
            </dl>
            <SimulationPanel reference={donation.ref} />
          </div>
        </div>
      </section>
    </>
  );
}
