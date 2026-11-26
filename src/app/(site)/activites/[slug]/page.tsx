import { notFound } from "next/navigation";
import { FicheDetail, TimingBadge } from "@/components/fiches";
import { PageHero } from "@/components/ui";
import { getPublicFicheBySlug } from "@/lib/fiches/repo";
import { ficheTypes } from "@/lib/fiches/model";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const fiche = await getPublicFicheBySlug((await params).slug);
  if (!fiche) return {};
  return pageMetadata({ title: fiche.title, description: fiche.summary, path: `/activites/${fiche.slug}` });
}

export default async function FichePage({ params }: { params: Promise<{ slug: string }> }) {
  const fiche = await getPublicFicheBySlug((await params).slug);
  if (!fiche) notFound();
  return (
    <>
      <PageHero title={fiche.title} eyebrow={ficheTypes[fiche.type]} lead={fiche.summary} crumbs={[{ href: "/activites", label: "Activités et campagnes" }, { label: fiche.title }]}>
        <div className="row-wrap mt-2"><TimingBadge fiche={fiche} /></div>
      </PageHero>
      <FicheDetail fiche={fiche} />
    </>
  );
}
