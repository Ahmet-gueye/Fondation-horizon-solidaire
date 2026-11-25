import { CategoryFilter } from "@/components/CategoryFilter";
import { ExampleBadge, EmptyState, MediaSlot, Notice } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { galleryCategories, getGalleryItems, type GalleryItem } from "@/content/galerie";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Galerie",
  description: "Photos et vidéos des actions de la Fondation Horizon Solidaire, publiées avec le consentement des personnes.",
  path: "/galerie",
});

function Item({ item }: { item: GalleryItem }) {
  return (
    <figure className="reveal">
      {item.src && item.type === "photo" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.src} alt={item.alt} loading="lazy" style={{ aspectRatio: "4 / 3", objectFit: "cover", width: "100%" }} />
      ) : item.src && item.type === "video" ? (
        <iframe src={item.src} title={item.alt} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen style={{ aspectRatio: "16 / 9", width: "100%", border: 0 }} />
      ) : (
        <MediaSlot label={item.type === "video" ? "Vidéo à fournir" : "Photo à fournir"} kind={item.type === "video" ? "video" : "image"} />
      )}
      <figcaption>
        <span className="row-wrap">
          {item.isExample ? <ExampleBadge label="Emplacement" /> : null}
          <span className="badge">{item.category}</span>
          {item.isIllustration && !item.isExample ? <span className="badge badge-sun">Illustration</span> : null}
        </span>
        <span>{item.caption}</span>
        {item.place || item.date ? (
          <span className="muted small">{[item.place, item.date ? formatDate(item.date) : null].filter(Boolean).join(" · ")}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default function GalleryPage() {
  const items = getGalleryItems();
  return (
    <>
      <PageHero title="Galerie" eyebrow="En images" lead="Photos et vidéos de nos actions. Nous publions uniquement des images dont nous avons les droits et, pour toute personne reconnaissable, son consentement." crumbs={[{ label: "Galerie" }]} />
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <Notice tone="info" title="Notre engagement sur l'image">
              <p>Aucune photo identifiable d&apos;un mineur ou d&apos;un bénéficiaire n&apos;est publiée sans consentement approprié (et celui des parents ou tuteurs pour les mineurs). Lieux et dates ne sont indiqués que lorsqu&apos;ils sont connus.</p>
            </Notice>
          </div>
          {items.length > 0 ? (
            <CategoryFilter
              label="Filtrer la galerie"
              categories={galleryCategories}
              gridClass="gallery"
              items={items.map((i) => ({ key: i.id, category: i.category, node: <Item item={i} /> }))}
            />
          ) : (
            <EmptyState icon="image" title="La galerie sera bientôt enrichie">
              <p>Les premières photos et vidéos seront publiées après validation des droits et consentements.</p>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
