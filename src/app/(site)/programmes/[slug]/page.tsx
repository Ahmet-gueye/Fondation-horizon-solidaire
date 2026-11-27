import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Picture } from "@/components/Picture";
import { FicheCard, ProgrammeVisual, scheduleLabel } from "@/components/fiches";
import { PageHero } from "@/components/ui";
import { getProgramme } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { publishedBudget, startDay, timing, type Fiche } from "@/lib/fiches/model";
import { formatFCFA } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgramme(slug);
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.summary, path: `/programmes/${p.slug}` });
}

/**
 * Chiffres du programme calculés à partir des fiches publiées par l'administration.
 * Rien n'est affiché tant qu'aucune donnée réelle n'existe : pas de mention « à compléter ».
 */
function overview(fiches: Fiche[]) {
  const active = fiches.filter((f) => ["a_venir", "en_cours"].includes(timing(f)));
  const regions = [...new Set(fiches.map((f) => f.zone.region.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
  const next = fiches
    .filter((f) => timing(f) === "a_venir")
    .sort((a, b) => (startDay(a.schedule) ?? "").localeCompare(startDay(b.schedule) ?? ""))[0];
  const budgets = fiches.map((f) => publishedBudget(f.budget)).filter((b) => b !== null && b.planned !== null);
  const planned = budgets.length ? budgets.reduce((s, b) => s + (b!.planned ?? 0), 0) : null;
  return { active: active.length, regions, next, planned };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProgramme(slug);
  if (!p) notFound();
  const fiches = (await listPublicFiches()).filter((f) => f.domain === p.slug);
  const o = overview(fiches);
  const zones = p.zones.length ? p.zones : o.regions;
  const photos = p.photos.filter((ph) => ph.consent);

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
            {p.audiences.length ? (
              <>
                <h2>Pour qui ?</h2>
                <ul className="chip-list">{p.audiences.map((a) => <li key={a}><Icon name="users" />{a}</li>)}</ul>
              </>
            ) : null}

            <h2>Nos actions</h2>
            {p.activities.length ? (
              <ul>{p.activities.map((a) => <li key={a}>{a}</li>)}</ul>
            ) : fiches.length ? (
              <ul className="action-list">
                {fiches.slice(0, 6).map((f) => (
                  <li key={f.id}>
                    <Link href={`/activites/${f.slug}`}>{f.title}</Link>
                    <span className="small muted">{f.schedule.kind !== "a_definir" ? scheduleLabel(f.schedule) : f.summary}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Chaque action de ce programme (atelier, distribution, campagne, événement…) est présentée sur ce site
                avec ses dates, son lieu, ses photos et, une fois validé, son budget. Vous la retrouverez ci-dessous
                dès sa publication.
              </p>
            )}

            {p.verifiedResults.length ? (
              <>
                <h2>Résultats vérifiés</h2>
                <ul>{p.verifiedResults.map((r) => <li key={r}>{r}</li>)}</ul>
              </>
            ) : null}
          </div>

          <aside className="stack">
            {photos.length ? (
              photos.map((ph) => (
                <figure key={ph.src} className="mt-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.src} alt={ph.alt} loading="lazy" style={{ borderRadius: 14 }} />
                  {ph.caption ? <figcaption className="small muted">{ph.caption}</figcaption> : null}
                </figure>
              ))
            ) : p.cover ? (
              <div className="rounded-media"><Picture image={{ ...p.cover, isIllustration: true }} ratio="4 / 3" /></div>
            ) : (
              <ProgrammeVisual programme={p} ratio="4 / 3" />
            )}

            <div className="summary">
              <div className="row-wrap" style={{ gap: 12, marginBottom: 14, flexWrap: "nowrap" }}>
                <div className={`icon-tile accent-${p.accent}`}><Icon name={p.icon} /></div>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{fiches.length ? "Le programme en bref" : "Agir avec nous"}</h2>
              </div>
              {fiches.length ? (
                <dl>
                  <div><dt>Actions publiées</dt><dd>{fiches.length}</dd></div>
                  {o.active ? <div><dt>En cours ou à venir</dt><dd>{o.active}</dd></div> : null}
                  {zones.length ? <div><dt>{zones.length > 1 ? "Régions" : "Région"}</dt><dd>{zones.join(", ")}</dd></div> : null}
                  {o.next ? <div><dt>Prochaine date</dt><dd>{scheduleLabel(o.next.schedule)}</dd></div> : null}
                  {p.timeline ? <div><dt>Calendrier</dt><dd>{p.timeline}</dd></div> : null}
                  {p.budget !== null ? <div><dt>Budget</dt><dd>{formatFCFA(p.budget)}</dd></div> : o.planned !== null ? <div><dt>Budget prévisionnel validé</dt><dd>{formatFCFA(o.planned)}</dd></div> : null}
                </dl>
              ) : (
                <p className="small">
                  Vous souhaitez proposer une action, rejoindre l&apos;équipe ou soutenir ce programme ? Écrivez-nous ou appelez-nous.
                </p>
              )}
              <div className="stack" style={{ gap: 8 }}>
                <Link href={`/contact?type=general&sujet=${encodeURIComponent(`Programme ${p.shortTitle}`)}`} className="btn btn-outline btn-block"><Icon name="mail" />Nous contacter</Link>
                <Link href={`/contact?type=benevolat&sujet=${encodeURIComponent(`Programme ${p.shortTitle}`)}`} className="btn btn-outline btn-block"><Icon name="handshake" />Devenir bénévole</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {fiches.length > 0 ? (
        <section className="section section-warm" aria-labelledby="projets-programme">
          <div className="container">
            <h2 id="projets-programme">Activités et campagnes de ce programme</h2>
            <div className="grid grid-3 mt-3">
              {fiches.map((f) => <FicheCard key={f.id} fiche={f} />)}
            </div>
            <p className="mt-4 row-wrap">
              <Link href={`/activites?domaine=${p.slug}`} className="btn btn-outline">Voir toutes les activités</Link>
              <Link href="/faire-un-don" className="btn"><Icon name="heart" />Soutenir ce programme</Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
