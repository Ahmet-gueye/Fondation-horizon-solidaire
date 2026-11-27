import Link from "next/link";
import { FicheCard } from "@/components/fiches";
import { EmptyState } from "@/components/Markers";
import { DonateBand, PageHero, ProgrammeCard } from "@/components/ui";
import { getPublicProgrammes } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { ficheTypes, ficheTypesEn, timing, type FicheType } from "@/lib/fiches/model";
import { pageMetadata } from "@/lib/seo";
import { i18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Activités et campagnes", "Activities and campaigns"),
    description: t(
      "Activités, événements, projets et campagnes de la Fondation Horizon Solidaire au Sénégal : lieux, dates, calendrier et moyens de participer.",
      "Activities, events, projects and campaigns of Fondation Horizon Solidaire in Senegal: places, dates, schedule and ways to take part.",
    ),
    path: "/activites",
    locale,
  });
}

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { locale, t } = await i18n();
  const all = await listPublicFiches();
  const programmes = getPublicProgrammes(locale);
  const types = locale === "en" ? ficheTypesEn : ficheTypes;
  const type = one(sp.type);
  const domaine = one(sp.domaine);
  const region = one(sp.region);
  const statut = one(sp.statut);

  const fiches = all.filter((f) => {
    if (type && f.type !== type) return false;
    if (domaine && f.domain !== domaine) return false;
    if (region && f.zone.region !== region) return false;
    if (statut === "a_venir" && timing(f) !== "a_venir") return false;
    if (statut === "en_cours" && timing(f) !== "en_cours") return false;
    if (statut === "passe" && timing(f) !== "passe") return false;
    return true;
  });
  // Les régions proposées sont celles des fiches publiées (aucune zone inventée).
  const regions = [...new Set(all.map((f) => f.zone.region).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
  const filtered = Boolean(type || domaine || region || statut);

  return (
    <>
      <PageHero
        title={t("Activités et campagnes", "Activities and campaigns")}
        eyebrow={t("Sur le terrain", "On the ground")}
        lead={t(
          "Retrouvez les activités, événements, projets et campagnes de la fondation : où, quand, avec qui, et comment y prendre part.",
          "Find the foundation's activities, events, projects and campaigns: where, when, with whom, and how to take part.",
        )}
        crumbs={[{ label: t("Activités et campagnes", "Activities and campaigns") }]}
      />
      <section className="section">
        <div className="container">
          {all.length > 0 ? (
            <form className="filters filters-4" method="get" role="search" aria-label={t("Filtrer les activités et campagnes", "Filter activities and campaigns")}>
              <div className="field">
                <label htmlFor="f-type">{t("Type", "Type")}</label>
                <select id="f-type" name="type" defaultValue={type}>
                  <option value="">{t("Tous", "All")}</option>
                  {(Object.entries(types) as [FicheType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-domaine">{t("Domaine", "Area")}</label>
                <select id="f-domaine" name="domaine" defaultValue={domaine}>
                  <option value="">{t("Tous", "All")}</option>
                  {programmes.map((p) => <option key={p.slug} value={p.slug}>{p.shortTitle}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-region">{t("Zone", "Region")}</label>
                <select id="f-region" name="region" defaultValue={region}>
                  <option value="">{t("Toutes", "All")}</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-statut">{t("Statut", "Status")}</label>
                <select id="f-statut" name="statut" defaultValue={statut}>
                  <option value="">{t("Tous", "All")}</option>
                  <option value="a_venir">{t("À venir", "Upcoming")}</option>
                  <option value="en_cours">{t("En cours", "In progress")}</option>
                  <option value="passe">{t("Terminés ou passés", "Completed or past")}</option>
                </select>
              </div>
              <div className="row-wrap filters-actions">
                <button type="submit" className="btn btn-sm">{t("Filtrer", "Filter")}</button>
                {filtered ? <Link href="/activites" className="btn btn-outline btn-sm">{t("Tout afficher", "Show all")}</Link> : null}
              </div>
            </form>
          ) : null}

          {fiches.length > 0 ? (
            <>
              <p className="muted" role="status">{fiches.length} {fiches.length > 1 ? t("résultats", "results") : t("résultat", "result")}</p>
              <div className="grid grid-3">
                {fiches.map((f) => <FicheCard key={f.id} fiche={f} />)}
              </div>
            </>
          ) : filtered ? (
            <EmptyState icon="calendar" title={t("Aucun résultat pour ces filtres", "No results for these filters")}>
              <p>{t("Essayez d'élargir votre recherche.", "Try widening your search.")}</p>
            </EmptyState>
          ) : (
            <>
              <p className="lead">{t("Découvrez nos domaines d'action : chaque activité, événement ou campagne de la fondation y sera rattaché.", "Discover our areas of action: each activity, event or campaign of the foundation will be linked to one of them.")}</p>
              <div className="grid grid-3 mt-3">
                {programmes.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
              </div>
            </>
          )}
        </div>
      </section>
      <section className="section-tight">
        <div className="container"><DonateBand /></div>
      </section>
    </>
  );
}
