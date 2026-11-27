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
import { i18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale } = await i18n();
  const p = getProgramme(slug, locale);
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.summary, path: `/programmes/${p.slug}`, locale });
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
  const { locale, t } = await i18n();
  const p = getProgramme(slug, locale);
  if (!p) notFound();
  const fiches = (await listPublicFiches()).filter((f) => f.domain === p.slug);
  const o = overview(fiches);
  const zones = p.zones.length ? p.zones : o.regions;
  const photos = p.photos.filter((ph) => ph.consent);

  return (
    <>
      <PageHero title={p.title} eyebrow={t("Programme", "Programme")} lead={p.summary} crumbs={[{ href: "/programmes", label: t("Nos programmes", "Our programmes") }, { label: p.shortTitle }]}>
        <div className="hero-actions">
          <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />{t("Soutenir ce programme", "Support this programme")}</Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <div className="prose">
            <h2>{t("Objectif", "Goal")}</h2>
            <p>{p.objective}</p>
            {p.audiences.length ? (
              <>
                <h2>{t("Pour qui ?", "Who is it for?")}</h2>
                <ul className="chip-list">{p.audiences.map((a) => <li key={a}><Icon name="users" />{a}</li>)}</ul>
              </>
            ) : null}

            <h2>{t("Nos actions", "Our actions")}</h2>
            {p.activities.length ? (
              <ul lang="fr">{p.activities.map((a) => <li key={a}>{a}</li>)}</ul>
            ) : fiches.length ? (
              <ul className="action-list">
                {fiches.slice(0, 6).map((f) => (
                  <li key={f.id}>
                    <Link href={`/activites/${f.slug}`}>{f.title}</Link>
                    <span className="small muted">{f.schedule.kind !== "a_definir" ? scheduleLabel(f.schedule, locale) : f.summary}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {t(
                  "Chaque action de ce programme (atelier, distribution, campagne, événement…) est présentée sur ce site avec ses dates, son lieu, ses photos et, une fois validé, son budget. Vous la retrouverez ci-dessous dès sa publication.",
                  "Each action in this programme (workshop, distribution, campaign, event…) is presented on this website with its dates, place, photos and, once validated, its budget. You will find it below as soon as it is published.",
                )}
              </p>
            )}

            {p.verifiedResults.length ? (
              <>
                <h2>{t("Résultats vérifiés", "Verified results")}</h2>
                <ul lang="fr">{p.verifiedResults.map((r) => <li key={r}>{r}</li>)}</ul>
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
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{fiches.length ? t("Le programme en bref", "Programme at a glance") : t("Agir avec nous", "Get involved")}</h2>
              </div>
              {fiches.length ? (
                <dl>
                  <div><dt>{t("Actions publiées", "Published actions")}</dt><dd>{fiches.length}</dd></div>
                  {o.active ? <div><dt>{t("En cours ou à venir", "In progress or upcoming")}</dt><dd>{o.active}</dd></div> : null}
                  {zones.length ? <div><dt>{zones.length > 1 ? t("Régions", "Regions") : t("Région", "Region")}</dt><dd>{zones.join(", ")}</dd></div> : null}
                  {o.next ? <div><dt>{t("Prochaine date", "Next date")}</dt><dd>{scheduleLabel(o.next.schedule, locale)}</dd></div> : null}
                  {p.timeline ? <div><dt>{t("Calendrier", "Timeline")}</dt><dd>{p.timeline}</dd></div> : null}
                  {p.budget !== null ? <div><dt>{t("Budget", "Budget")}</dt><dd>{formatFCFA(p.budget, locale)}</dd></div> : o.planned !== null ? <div><dt>{t("Budget prévisionnel validé", "Validated planned budget")}</dt><dd>{formatFCFA(o.planned, locale)}</dd></div> : null}
                </dl>
              ) : (
                <p className="small">
                  {t(
                    "Vous souhaitez proposer une action, rejoindre l'équipe ou soutenir ce programme ? Écrivez-nous ou appelez-nous.",
                    "Would you like to suggest an action, join the team or support this programme? Write to us or call us.",
                  )}
                </p>
              )}
              <div className="stack" style={{ gap: 8 }}>
                <Link href={`/contact?type=general&sujet=${encodeURIComponent(`Programme ${p.shortTitle}`)}`} className="btn btn-outline btn-block"><Icon name="mail" />{t("Nous contacter", "Contact us")}</Link>
                <Link href={`/contact?type=benevolat&sujet=${encodeURIComponent(`Programme ${p.shortTitle}`)}`} className="btn btn-outline btn-block"><Icon name="handshake" />{t("Devenir bénévole", "Become a volunteer")}</Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {fiches.length > 0 ? (
        <section className="section section-warm" aria-labelledby="projets-programme">
          <div className="container">
            <h2 id="projets-programme">{t("Activités et campagnes de ce programme", "Activities and campaigns in this programme")}</h2>
            <div className="grid grid-3 mt-3">
              {fiches.map((f) => <FicheCard key={f.id} fiche={f} />)}
            </div>
            <p className="mt-4 row-wrap">
              <Link href={`/activites?domaine=${p.slug}`} className="btn btn-outline">{t("Voir toutes les activités", "See all activities")}</Link>
              <Link href="/faire-un-don" className="btn"><Icon name="heart" />{t("Soutenir ce programme", "Support this programme")}</Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
