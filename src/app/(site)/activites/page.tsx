import Link from "next/link";
import { FicheCard } from "@/components/fiches";
import { EmptyState } from "@/components/Markers";
import { DonateBand, PageHero, ProgrammeCard } from "@/components/ui";
import { getPublicProgrammes } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { ficheTypes, publishableStatuses, ficheStatuses, timing, type FicheType } from "@/lib/fiches/model";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Activités et campagnes",
  description: "Activités, événements, projets et campagnes de la Fondation Horizon Solidaire au Sénégal : lieux, dates, calendrier et moyens de participer.",
  path: "/activites",
});

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await listPublicFiches();
  const programmes = getPublicProgrammes();
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
        title="Activités et campagnes"
        eyebrow="Sur le terrain"
        lead="Retrouvez les activités, événements, projets et campagnes de la fondation : où, quand, avec qui, et comment y prendre part."
        crumbs={[{ label: "Activités et campagnes" }]}
      />
      <section className="section">
        <div className="container">
          {all.length > 0 ? (
            <form className="filters filters-4" method="get" role="search" aria-label="Filtrer les activités et campagnes">
              <div className="field">
                <label htmlFor="f-type">Type</label>
                <select id="f-type" name="type" defaultValue={type}>
                  <option value="">Tous</option>
                  {(Object.entries(ficheTypes) as [FicheType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-domaine">Domaine</label>
                <select id="f-domaine" name="domaine" defaultValue={domaine}>
                  <option value="">Tous</option>
                  {programmes.map((p) => <option key={p.slug} value={p.slug}>{p.shortTitle}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-region">Zone</label>
                <select id="f-region" name="region" defaultValue={region}>
                  <option value="">Toutes</option>
                  {regions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-statut">Statut</label>
                <select id="f-statut" name="statut" defaultValue={statut}>
                  <option value="">Tous</option>
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="passe">Terminés ou passés</option>
                </select>
              </div>
              <div className="row-wrap filters-actions">
                <button type="submit" className="btn btn-sm">Filtrer</button>
                {filtered ? <Link href="/activites" className="btn btn-outline btn-sm">Tout afficher</Link> : null}
              </div>
            </form>
          ) : null}

          {fiches.length > 0 ? (
            <>
              <p className="muted" role="status">{fiches.length} résultat{fiches.length > 1 ? "s" : ""}</p>
              <div className="grid grid-3">
                {fiches.map((f) => <FicheCard key={f.id} fiche={f} />)}
              </div>
            </>
          ) : filtered ? (
            <EmptyState icon="calendar" title="Aucun résultat pour ces filtres">
              <p>Essayez d&apos;élargir votre recherche.</p>
            </EmptyState>
          ) : (
            <>
              <p className="lead">Découvrez nos domaines d&apos;action : chaque activité, événement ou campagne de la fondation y sera rattaché.</p>
              <div className="grid grid-3 mt-3">
                {programmes.map((p) => <ProgrammeCard key={p.slug} programme={p} />)}
              </div>
            </>
          )}
          <p className="small muted mt-4">Statuts possibles : {publishableStatuses.map((s) => ficheStatuses[s].toLowerCase()).join(", ")}.</p>
        </div>
      </section>
      <section className="section-tight">
        <div className="container"><DonateBand /></div>
      </section>
    </>
  );
}
