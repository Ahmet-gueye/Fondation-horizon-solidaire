/**
 * Image avec mention obligatoire « Image d'illustration » et crédit photo
 * lorsqu'il ne s'agit pas d'une photo authentique de la fondation.
 */
export function Picture({
  image,
  ratio = "16 / 9",
  caption = true,
  eager = false,
}: {
  image: { src: string; alt: string; isIllustration?: boolean; author?: string; page?: string };
  ratio?: string;
  caption?: boolean;
  eager?: boolean;
}) {
  const ill = image.isIllustration !== false;
  return (
    <figure className="picture">
      <div className="picture-frame" style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} decoding="async" />
        {ill ? <span className="picture-tag">Image d&apos;illustration</span> : null}
      </div>
      {caption && ill && image.author ? (
        <figcaption className="picture-credit">
          Photo : {image.page ? <a href={image.page} target="_blank" rel="noopener noreferrer">{image.author} / Unsplash<span className="visually-hidden"> (nouvel onglet)</span></a> : image.author}. Ne représente pas une action de la fondation.
        </figcaption>
      ) : null}
    </figure>
  );
}
