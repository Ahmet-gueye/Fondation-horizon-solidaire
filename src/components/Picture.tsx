import { i18n } from "@/i18n/server";

/**
 * Image avec mention obligatoire « Image d'illustration » et crédit photo
 * lorsqu'il ne s'agit pas d'une photo authentique de la fondation.
 */
export async function Picture({
  image,
  ratio = "16 / 9",
  caption = true,
  eager = false,
}: {
  image: { src: string; alt: string; isIllustration?: boolean; author?: string; source?: string; page?: string };
  ratio?: string;
  caption?: boolean;
  eager?: boolean;
}) {
  const { t } = await i18n();
  const ill = image.isIllustration !== false;
  return (
    <figure className="picture">
      <div className="picture-frame" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
        {ill ? <span className="picture-tag">{t("Image d'illustration", "Illustrative image")}</span> : null}
      </div>
      {caption && ill && image.author ? (
        <figcaption className="picture-credit">
          {t("Photo :", "Photo:")} {image.page ? <a href={image.page} target="_blank" rel="noopener noreferrer">{image.author}{image.source ? ` / ${image.source}` : ""}<span className="visually-hidden"> {t("(nouvel onglet)", "(new tab)")}</span></a> : image.author}.{" "}
          {t("Ne représente pas une action de la fondation.", "Does not show an action of the foundation.")}
        </figcaption>
      ) : null}
    </figure>
  );
}
