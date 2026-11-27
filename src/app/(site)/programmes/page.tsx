import { DonateBand, PageHero, ProgrammeCard } from "@/components/ui";
import { getPublicProgrammes } from "@/content/programmes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nos programmes",
  description: "Éducation, santé, urgences, solidarité, autonomisation et développement local : les programmes de la Fondation Horizon Solidaire au Sénégal.",
  path: "/programmes",
});

export default function ProgrammesPage() {
  const programmes = getPublicProgrammes();
  return (
    <>
      <PageHero
        title="Nos programmes"
        eyebrow="Domaines d'action"
        lead="Nos programmes regroupent des actions concrètes. Pour chacune, nous publions les dates, les lieux, les photos et, une fois validés, les budgets."
        crumbs={[{ label: "Nos programmes" }]}
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.slug} programme={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-tight">
        <div className="container"><DonateBand /></div>
      </section>
    </>
  );
}
