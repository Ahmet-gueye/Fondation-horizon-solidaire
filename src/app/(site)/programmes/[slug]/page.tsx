import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { MediaSlot, ToComplete, ValueOr } from "@/components/Markers";
import { Picture } from "@/components/Picture";
import { FicheCard } from "@/components/fiches";
import { PageHero } from "@/components/ui";
import { getProgramme, getPublicProgrammes } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { formatFCFA } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgramme(slug);
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.summary, path: `/programmes/${p.slug}` });
}

function List({ items, label }: { items: string[]; label: string }) {
  return items.length > 0 ? (
    <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
  ) : (
    <ToComplete label={label} />
  );
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgramme(slug);
  if (!p) notFound();
  const fiches = (await listPublicFiches()).filter((f) => f.domain === p.slug);

  return (
    <>
      <PageHero title={p.title} eyebrow="Programme" lead={p.summary} crumbs={[{ href: "/programmes", label: "Nos programmes" }, { label: p.shortTitle }]}>
        <div className="hero-actions">
          <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />Soutenir ce programme</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <div className="prose">
            <h2>Objectif</h2>
            <p>{p.objective}</p>
            <h2>Publics concernés</h2>
            <List items={p.audiences} label="Publics à préciser" />
            <h2>Activités</h2>
            <List items={p.activities} label="Activités à décrire par la fondation" />
            <h2>Résultats vérifiés</h2>
            <List items={p.verifiedResults} label="Résultats à publier après vérification" />
          </div>
          <aside className="stack">
            <dl className="info-list">
              <div><dt>Zones d&apos;intervention</dt><dd><ValueOr value={p.zones.length ? p.zones.join(", ") : null} /></dd></div>
              <div><dt>Calendrier</dt><dd><ValueOr value={p.timeline} /></dd></div>
              <div><dt>Budget</dt><dd><ValueOr value={p.budget !== null ? formatFCFA(p.budget) : null} /></dd></div>
            </dl>
            {p.photos.filter((ph) => ph.consent).length > 0 ? (
              p.photos.filter((ph) => ph.consent).map((ph) => (
                <figure key={ph.src} className="mt-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.src} alt={ph.alt} loading="lazy" style={{ borderRadius: 14 }} />
                  {ph.caption ? <figcaption className="small muted">{ph.caption}</figcaption> : null}
                </figure>
              ))
            ) : p.cover ? (
              <div className="rounded-media"><Picture image={{ ...p.cover, isIllustration: true }} ratio="4 / 3" /></div>
            ) : (
              <MediaSlot label="Photos du programme à fournir (avec consentement)" />
            )}
          </aside>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="projets-programme">
        <div className="container">
          <h2 id="projets-programme">Activités et campagnes de ce programme</h2>
          {fiches.length > 0 ? (
            <div className="grid grid-3 mt-3">
              {fiches.map((f) => <FicheCard key={f.id} fiche={f} />)}
            </div>
          ) : (
            <p className="muted">Aucune activité publiée pour ce programme pour le moment.</p>
          )}
          <p className="mt-4 row-wrap">
            <Link href={`/activites?domaine=${p.slug}`} className="btn btn-outline">Voir toutes les activités</Link>
            <Link href="/faire-un-don" className="btn"><Icon name="heart" />Soutenir ce programme</Link>
          </p>
        </div>
      </section>
    </>
  );
}
