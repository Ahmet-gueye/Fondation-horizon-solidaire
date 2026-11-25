import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ExampleBadge, MediaSlot, Notice, ToComplete, ValueOr } from "@/components/Markers";
import { PageHero, ProgressBlock } from "@/components/ui";
import { Picture } from "@/components/Picture";
import { getPublicProgrammes } from "@/content/programmes";
import { getProject, getProjects, statusLabels } from "@/content/projets";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMetadata({ title: p.title, description: p.summary, path: `/projets/${p.slug}`, noIndex: p.isExample });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const programme = getPublicProgrammes().find((pr) => pr.slug === p.programme);
  const place = [p.commune, p.region].filter(Boolean).join(", ");
  const canDonate = p.acceptsDonations && !p.isExample;

  return (
    <>
      <PageHero title={p.title} eyebrow={programme?.title ?? "Projet"} lead={p.summary} crumbs={[{ href: "/projets", label: "Projets" }, { label: p.title }]}>
        <div className="row-wrap mt-2">
          {p.isExample ? <ExampleBadge /> : null}
          <span className="badge badge-sun">{statusLabels[p.status]}</span>
          <span className="meta"><Icon name="pin" />{place ? `${place}${p.isExample ? " (lieu d'exemple)" : ""}` : "Zone à préciser"}</span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <div className="prose">
            {p.isExample ? (
              <Notice tone="warn" title="Exemple à remplacer">
                <p>Cette fiche est une démonstration. Elle ne décrit pas un projet réel et n&apos;accepte aucun don.</p>
              </Notice>
            ) : null}
            {p.image ? (
              <div className="rounded-media mt-3"><Picture image={p.image} eager /></div>
            ) : (
              <div className="mt-3"><MediaSlot label="Photo du projet à fournir (avec consentement)" ratio="16 / 9" /></div>
            )}
            <h2>Besoin identifié</h2>
            <p><ValueOr value={p.need} /></p>
            <h2>Bénéficiaires visés</h2>
            <p><ValueOr value={p.beneficiaries} /></p>
            <h2>Objectifs</h2>
            {p.objectives.length ? <ul>{p.objectives.map((o) => <li key={o}>{o}</li>)}</ul> : <ToComplete />}
            <h2>Étapes</h2>
            {p.steps.length ? (
              <ul className="checklist">
                {p.steps.map((s) => (
                  <li key={s.label} className={s.done ? "is-done" : undefined}>
                    {s.label} <span className="visually-hidden">{s.done ? "(réalisée)" : "(à venir)"}</span>
                  </li>
                ))}
              </ul>
            ) : <ToComplete />}
            <h2>Résultats</h2>
            {p.results.length ? <ul>{p.results.map((r) => <li key={r}>{r}</li>)}</ul> : <p className="muted">Les résultats seront publiés après vérification.</p>}
          </div>

          <aside className="stack donate-aside">
            <div className="summary">
              <h2 style={{ fontSize: "1.25rem" }}>Financement</h2>
              <ProgressBlock project={p} />
              <dl className="mt-3">
                <div><dt>Début</dt><dd><ValueOr value={p.startDate ? formatDate(p.startDate) : null} label="À préciser" /></dd></div>
                <div><dt>Fin prévue</dt><dd><ValueOr value={p.endDate ? formatDate(p.endDate) : null} label="À préciser" /></dd></div>
              </dl>
              {canDonate ? (
                <Link href={`/faire-un-don?affectation=projet:${p.slug}`} className="btn btn-sun btn-block"><Icon name="heart" />Soutenir ce projet</Link>
              ) : (
                <Link href="/faire-un-don" className="btn btn-block">Faire un don général</Link>
              )}
            </div>
            <p className="small muted">Une question sur ce projet ? <Link href="/contact?type=projet">Écrivez-nous</Link>.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
