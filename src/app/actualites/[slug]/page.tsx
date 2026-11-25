import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { ExampleBadge, MediaSlot, Notice } from "@/components/Markers";
import { DonateBand, PageHero } from "@/components/ui";
import { getArticle, getArticles } from "@/content/actualites";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return pageMetadata({ title: a.title, description: a.summary, path: `/actualites/${a.slug}`, noIndex: a.isExample });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  return (
    <>
      <PageHero title={a.title} eyebrow={a.category} crumbs={[{ href: "/actualites", label: "Actualités" }, { label: a.title }]}>
        <div className="row-wrap">
          {a.isExample ? <ExampleBadge label="Exemple fictif" /> : null}
          <span className="meta"><Icon name="calendar" /><time dateTime={a.date}>{formatDate(a.date)}</time></span>
        </div>
      </PageHero>
      <article className="section">
        <div className="container prose">
          {a.isExample ? (
            <Notice tone="warn" title="Article fictif"><p>Ce contenu est une démonstration à remplacer par une actualité réelle.</p></Notice>
          ) : null}
          <div className="mt-3">
            {a.image ? (
              <figure className="mt-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image.src} alt={a.image.alt} style={{ borderRadius: 16 }} />
                {a.image.isIllustration ? <figcaption className="small muted">Image d&apos;illustration</figcaption> : null}
              </figure>
            ) : (
              <MediaSlot label="Image de l'article à fournir" ratio="16 / 9" />
            )}
          </div>
          <p className="lead mt-3">{a.summary}</p>
          {a.body.map((para, i) => <p key={i}>{para}</p>)}
          <p className="mt-4"><Link href="/actualites" className="link-arrow">Toutes les actualités</Link></p>
        </div>
      </article>
      <section className="section-tight"><div className="container"><DonateBand /></div></section>
    </>
  );
}
