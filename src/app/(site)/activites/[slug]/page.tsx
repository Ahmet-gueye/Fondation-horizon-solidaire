import { notFound } from "next/navigation";
import { FicheDetail, ficheTypeLabel, TimingBadge } from "@/components/fiches";
import { PageHero } from "@/components/ui";
import { getPublicFicheBySlug } from "@/lib/fiches/repo";
import { pageMetadata } from "@/lib/seo";
import { i18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const fiche = await getPublicFicheBySlug((await params).slug);
  if (!fiche) return {};
  const { locale } = await i18n();
  return pageMetadata({ title: fiche.title, description: fiche.summary, path: `/activites/${fiche.slug}`, locale });
}

export default async function FichePage({ params }: { params: Promise<{ slug: string }> }) {
  const fiche = await getPublicFicheBySlug((await params).slug);
  if (!fiche) notFound();
  const { locale, t } = await i18n();
  return (
    <>
      <PageHero title={fiche.title} eyebrow={ficheTypeLabel(fiche.type, locale)} lead={fiche.summary} crumbs={[{ href: "/activites", label: t("Activités et campagnes", "Activities and campaigns") }, { label: fiche.title }]}>
        <div className="row-wrap mt-2"><TimingBadge fiche={fiche} /></div>
      </PageHero>
      <FicheDetail fiche={fiche} />
    </>
  );
}
