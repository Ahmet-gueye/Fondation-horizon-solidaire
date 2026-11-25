import Image from "next/image";
import { site } from "@/config/site";

/**
 * Logo officiel de la fondation.
 * Tant que `site.logo.src` n'est pas renseigné, un emplacement clairement
 * identifié s'affiche à la place (le logo n'est jamais redessiné).
 */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const { src, width, height, alt, full } = site.logo;
  if (size === "lg" && full?.src) {
    return <Image src={full.src} alt={alt} width={full.width} height={full.height} className="logo-full" sizes="(max-width: 600px) 90vw, 380px" />;
  }
  if (src && width > 0 && height > 0) {
    const h = size === "lg" ? 120 : 48;
    return (
      <span className="brand-logo">
        <Image src={src} alt={alt} width={Math.round((width / height) * h)} height={h} priority={size === "md"} style={{ height: h, width: "auto" }} />
      </span>
    );
  }
  return (
    <span className={`logo-slot${size === "lg" ? " logo-slot-lg" : ""}`} title="Emplacement du logo officiel (fichier à fournir)">
      Logo à intégrer
    </span>
  );
}
