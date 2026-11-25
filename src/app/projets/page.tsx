import { EmptyState, Notice } from "@/components/Markers";
import { ProjectFilters } from "@/components/ProjectFilters";
import { DonateBand, PageHero, ProjectCard } from "@/components/ui";
import { site } from "@/config/site";
import { getPublicProgrammes } from "@/content/programmes";
import { getProjects } from "@/content/projets";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projets",
  description: "Les projets de la Fondation Horizon Solidaire au Sénégal : besoins, étapes, budget et avancement.",
  path: "/projets",
});

export default function ProjectsPage() {
  const projects = getProjects();
  const cards = Object.fromEntries(projects.map((p) => [p.slug, <ProjectCard key={p.slug} project={p} />]));
  return (
    <>
      <PageHero
        title="Nos projets"
        eyebrow="Sur le terrain"
        lead="Chaque fiche précise le besoin identifié, les bénéficiaires visés, les étapes, le budget et l'avancement. Les montants sont datés et mis à jour régulièrement."
        crumbs={[{ label: "Projets" }]}
      />
      <section className="section">
        <div className="container">
          {site.showExamples && projects.some((p) => p.isExample) ? (
            <div className="mb-0" style={{ marginBottom: 24 }}>
              <Notice tone="warn" title="Fiches de démonstration">
                <p>Les projets marqués « Exemple à remplacer » illustrent la présentation et ne décrivent pas des actions réelles. Ils n&apos;acceptent aucun don.</p>
              </Notice>
            </div>
          ) : null}
          {projects.length > 0 ? (
            <ProjectFilters
              projects={projects.map(({ slug, programme, region, status }) => ({ slug, programme, region, status }))}
              programmes={getPublicProgrammes().map((p) => ({ value: p.slug, label: p.shortTitle }))}
              cards={cards}
            />
          ) : (
            <EmptyState icon="pin" title="Aucun projet publié pour le moment">
              <p>Les fiches projets seront publiées dès leur validation. Vous pouvez dès maintenant faire un don général.</p>
            </EmptyState>
          )}
        </div>
      </section>
      <section className="section-tight">
        <div className="container"><DonateBand title="Soutenir sans affecter" text="Un don général permet à la fondation d'intervenir là où le besoin est le plus urgent." /></div>
      </section>
    </>
  );
}
