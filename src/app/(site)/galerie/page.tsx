import { CategoryFilter } from "@/components/CategoryFilter";
import { ExampleBadge, EmptyState, MediaSlot, Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { Picture } from "@/components/Picture";
import { galleryCategories, galleryCategoryLabel, getGalleryItems, type GalleryItem } from "@/content/galerie";
import type { Locale, T } from "@/i18n";
import { i18n } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Galerie", "Gallery"),
    description: t(
      "Photos et vidéos des actions de la Fondation Horizon Solidaire, publiées avec le consentement des personnes.",
      "Photos and videos of the work of Fondation Horizon Solidaire, published with the consent of the people shown.",
    ),
    path: "/galerie",
    locale,
  });
}

function Item({ item, locale, t }: { item: GalleryItem; locale: Locale; t: T }) {
  return (
    <figure className="reveal">
      {item.src && item.type === "photo" ? (
        <Picture image={{ src: item.src, alt: item.alt, isIllustration: item.isIllustration }} ratio="4 / 3" caption={false} />
      ) : item.src && item.type === "video" ? (
        <iframe src={item.src} title={item.alt} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen style={{ aspectRatio: "16 / 9", width: "100%", border: 0 }} />
      ) : (
        <MediaSlot label={item.type === "video" ? t("Vidéo à fournir", "Video to come") : t("Photo à fournir", "Photo to come")} kind={item.type === "video" ? "video" : "image"} />
      )}
      <figcaption>
        <span className="row-wrap">
          {item.isExample && !item.src ? <ExampleBadge label={t("Emplacement", "Placeholder")} /> : null}
          <span className="badge">{galleryCategoryLabel(item.category, locale)}</span>
          {item.isIllustration && !item.isExample ? <span className="badge badge-sun">{t("Illustration", "Illustration")}</span> : null}
        </span>
        <span>{item.caption}</span>
        {item.author ? (
          <span className="muted small">
            {t("Photo :", "Photo:")} {item.page ? <a href={item.page} target="_blank" rel="noopener noreferrer">{item.author} / {item.source}</a> : item.author}.{" "}
            {t("Ne représente pas une action de la fondation.", "Does not show an action of the foundation.")}
          </span>
        ) : null}
        {item.place || item.date ? (
          <span className="muted small">{[item.place, item.date ? formatDate(item.date, locale) : null].filter(Boolean).join(" · ")}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default async function GalleryPage() {
  const { locale, t } = await i18n();
  const items = getGalleryItems(locale);
  return (
    <>
      <PageHero
        title={t("Galerie", "Gallery")}
        eyebrow={t("En images", "In pictures")}
        lead={t(
          "Photos et vidéos de nos actions. Nous publions uniquement des images dont nous avons les droits et, pour toute personne reconnaissable, son consentement.",
          "Photos and videos of our work. We only publish images we have the rights to and, for anyone who can be recognised, their consent.",
        )}
        crumbs={[{ label: t("Galerie", "Gallery") }]}
      />
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <Notice tone="info" title={t("Notre engagement sur l'image", "Our commitment on images")}>
              <p>
                {t(
                  "Aucune photo identifiable d'un mineur ou d'un bénéficiaire n'est publiée sans consentement approprié (et celui des parents ou tuteurs pour les mineurs). Lieux et dates ne sont indiqués que lorsqu'ils sont connus.",
                  "No identifiable photo of a minor or of a person we support is published without proper consent (and that of parents or guardians for minors). Places and dates are only given when they are known.",
                )}
              </p>
              <p>
                {t(
                  "Les images actuellement affichées sont des illustrations libres de droits (Unsplash, Pexels) : elles ne montrent pas des actions de la fondation et seront remplacées par ses propres photos.",
                  "The images currently shown are royalty-free illustrations (Unsplash, Pexels): they do not show the foundation's work and will be replaced by its own photos.",
                )}
              </p>
            </Notice>
          </div>
          {items.length > 0 ? (
            <CategoryFilter
              label={t("Filtrer la galerie", "Filter the gallery")}
              allLabel={t("Tout", "All")}
              countLabel={t("élément(s) affiché(s)", "item(s) shown")}
              categories={galleryCategories.map((c) => ({ value: c, label: galleryCategoryLabel(c, locale) }))}
              gridClass="gallery"
              emptyText={t("Aucun élément dans cette catégorie pour le moment.", "Nothing in this category yet.")}
              items={items.map((i) => ({ key: i.id, category: i.category, node: <Item item={i} locale={locale} t={t} /> }))}
            />
          ) : (
            <EmptyState icon="image" title={t("La galerie sera bientôt enrichie", "The gallery will be filled soon")}>
              <p>{t("Les premières photos et vidéos seront publiées après validation des droits et consentements.", "The first photos and videos will be published once rights and consents have been checked.")}</p>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
