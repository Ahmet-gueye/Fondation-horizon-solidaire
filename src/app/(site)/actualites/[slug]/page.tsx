import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ExampleBadge, MediaSlot, Notice } from "@/components/Markers";
import { DonateBand, PageHero } from "@/components/ui";
import { Picture } from "@/components/Picture";
import { getArticle, getArticles } from "@/content/actualites";
import { i18n } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale } = await i18n();
  const a = getArticle(slug, locale);
  if (!a) return {};
  return pageMetadata({ title: a.title, description: a.summary, path: `/actualites/${a.slug}`, noIndex: a.isExample, locale });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, t } = await i18n();
  const a = getArticle(slug, locale);
  if (!a) notFound();
  const inFrench = locale === "en" && !a.en;
  return (
    <>
      <PageHero title={a.title} eyebrow={a.categoryLabel} crumbs={[{ href: "/actualites", label: t("Actualités", "News") }, { label: a.title }]}>
        <div className="row-wrap">
          {a.isExample ? <ExampleBadge label={t("Exemple fictif", "Fictional example")} /> : null}
          <span className="meta"><Icon name="calendar" /><time dateTime={a.date}>{formatDate(a.date, locale)}</time></span>
        </div>
      </PageHero>
      <article className="section">
        <div className="container prose" lang={inFrench ? "fr" : undefined}>
          {a.isExample ? (
            <Notice tone="warn" title={t("Article fictif", "Fictional article")}>
              <p>{t("Ce contenu est une démonstration à remplacer par une actualité réelle.", "This content is a demonstration, to be replaced by real news.")}</p>
            </Notice>
          ) : null}
          {inFrench ? <Notice tone="info"><p lang="en">This article is only available in French.</p></Notice> : null}
          <div className="mt-3">
            {a.image ? (
              <div className="rounded-media"><Picture image={a.image} eager /></div>
            ) : (
              <MediaSlot label={t("Image de l'article à fournir", "Article image to come")} ratio="16 / 9" />
            )}
          </div>
          <p className="lead mt-3">{a.summary}</p>
          {a.body.map((para, i) => <p key={i}>{para}</p>)}
          <p className="mt-4"><Link href="/actualites" className="link-arrow">{t("Toutes les actualités", "All news")}</Link></p>
        </div>
      </article>
      <section className="section-tight"><div className="container"><DonateBand /></div></section>
    </>
  );
}
