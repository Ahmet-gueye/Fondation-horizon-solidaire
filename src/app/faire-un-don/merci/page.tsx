import { DonationStatus } from "@/components/DonationStatus";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Confirmation de don", description: "État de votre don à la Fondation Horizon Solidaire.", path: "/faire-un-don/merci", noIndex: true });

export default async function ThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : null;
  return (
    <section className="section">
      <div className="container">
        <h1 className="visually-hidden">Confirmation de votre don</h1>
        <DonationStatus reference={ref} context="merci" />
      </div>
    </section>
  );
}
