import { notFound } from "next/navigation";
import { FicheDetail, TimingBadge } from "@/components/fiches";
import { PageHero } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { getFiche } from "@/lib/fiches/repo";
import { ficheTypes, isPublic } from "@/lib/fiches/model";

export const metadata = { title: "Aperçu" };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const fiche = await getFiche((await params).id);
  if (!fiche) notFound();
  return (
    <div className="admin-preview">
      <div className={`notice ${isPublic(fiche) ? "notice-success" : "notice-warn"}`} role="status">
        <p className="mb-0">Aperçu {isPublic(fiche) ? "de la version en ligne." : ": cette fiche n'est PAS visible par les visiteurs."}</p>
      </div>
      <PageHero title={fiche.title} eyebrow={ficheTypes[fiche.type]} lead={fiche.summary} crumbs={[{ href: "/activites", label: "Activités et campagnes" }, { label: fiche.title }]}>
        <div className="row-wrap mt-2"><TimingBadge fiche={fiche} /></div>
      </PageHero>
      <FicheDetail fiche={fiche} />
    </div>
  );
}
