import Link from "next/link";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState, Notice } from "@/components/Markers";
import { NewsCard, PageHero } from "@/components/ui";
import { getArticles, newsCategories } from "@/content/actualites";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Actualités",
  description: "Les nouvelles de la Fondation Horizon Solidaire : vie de la fondation, projets, appels et rapports.",
  path: "/actualites",
});

export default function NewsPage() {
  const articles = getArticles();
  return (
    <>
      <PageHero title="Actualités" eyebrow="Nouvelles" lead="Suivez la vie de la fondation, l'avancement des projets et nos appels à mobilisation." crumbs={[{ label: "Actualités" }]} />
      <section className="section">
        <div className="container">
          {articles.some((a) => a.isExample) ? (
            <div style={{ marginBottom: 24 }}>
              <Notice tone="warn" title="Articles de démonstration">
                <p>Les articles marqués « Exemple fictif » montrent la mise en page et ne relatent aucune action réelle.</p>
              </Notice>
            </div>
          ) : null}
          {articles.length > 0 ? (
            <CategoryFilter
              label="Filtrer par catégorie"
              categories={newsCategories}
              items={articles.map((a) => ({ key: a.slug, category: a.category, node: <NewsCard article={a} /> }))}
              emptyText="Aucune actualité dans cette catégorie pour le moment."
            />
          ) : (
            <EmptyState icon="calendar" title="Aucune actualité publiée pour le moment">
              <p>Les premières nouvelles seront publiées très prochainement. Une information à partager ? <Link href="/contact">Écrivez-nous</Link>.</p>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
