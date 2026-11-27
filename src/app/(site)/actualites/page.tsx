import Link from "next/link";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState, Notice } from "@/components/Markers";
import { NewsCard, PageHero } from "@/components/ui";
import { getArticles, newsCategories, newsCategoryLabel } from "@/content/actualites";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Actualités", "News"),
    description: t(
      "Les nouvelles de la Fondation Horizon Solidaire : vie de la fondation, projets, appels et rapports.",
      "News from Fondation Horizon Solidaire: life of the foundation, projects, calls for support and reports.",
    ),
    path: "/actualites",
    locale,
  });
}

export default async function NewsPage() {
  const { locale, t } = await i18n();
  const articles = getArticles(locale);
  return (
    <>
      <PageHero
        title={t("Actualités", "News")}
        eyebrow={t("Nouvelles", "Updates")}
        lead={t("Suivez la vie de la fondation, l'avancement des projets et nos appels à mobilisation.", "Follow the life of the foundation, the progress of projects and our calls for support.")}
        crumbs={[{ label: t("Actualités", "News") }]}
      />
      <section className="section">
        <div className="container">
          {articles.some((a) => a.isExample) ? (
            <div style={{ marginBottom: 24 }}>
              <Notice tone="warn" title={t("Articles de démonstration", "Sample articles")}>
                <p>{t("Les articles marqués « Exemple fictif » montrent la mise en page et ne relatent aucune action réelle.", "Articles marked “Fictional example” show the layout and do not describe any real action.")}</p>
              </Notice>
            </div>
          ) : null}
          {articles.length > 0 ? (
            <CategoryFilter
              label={t("Filtrer par catégorie", "Filter by category")}
              allLabel={t("Tout", "All")}
              countLabel={t("élément(s) affiché(s)", "item(s) shown")}
              categories={newsCategories.map((c) => ({ value: c, label: newsCategoryLabel(c, locale) }))}
              items={articles.map((a) => ({ key: a.slug, category: a.category, node: <NewsCard article={a} /> }))}
              emptyText={t("Aucune actualité dans cette catégorie pour le moment.", "No news in this category yet.")}
            />
          ) : (
            <EmptyState icon="calendar" title={t("Aucune actualité publiée pour le moment", "No news published yet")}>
              <p>
                {t("Les premières nouvelles seront publiées très prochainement. Une information à partager ?", "The first news will be published very soon. Something to share?")}{" "}
                <Link href="/contact">{t("Écrivez-nous", "Write to us")}</Link>.
              </p>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
