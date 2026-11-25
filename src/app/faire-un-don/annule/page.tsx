import { DonationStatus } from "@/components/DonationStatus";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Paiement interrompu", description: "Votre paiement n'a pas été finalisé.", path: "/faire-un-don/annule", noIndex: true });

export default async function CanceledPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : null;
  return (
    <section className="section">
      <div className="container">
        <h1 className="visually-hidden">Paiement interrompu</h1>
        <DonationStatus reference={ref} context="annule" />
      </div>
    </section>
  );
}
