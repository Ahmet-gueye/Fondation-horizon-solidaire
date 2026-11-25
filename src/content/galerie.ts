import { site } from "@/config/site";
import { stock } from "./images";

/**
 * Galerie photos et vidéos.
 *
 * Règles :
 * - aucune photo identifiable de mineur ou de bénéficiaire sans consentement écrit
 *   (`consent: true` obligatoire pour publier) ;
 * - lieu et date seulement s'ils sont connus ;
 * - `isIllustration: true` pour toute image qui n'est pas une photo authentique
 *   d'une action de la fondation (elle sera signalée comme telle).
 *
 * Les éléments `isExample: true` sont des emplacements de démonstration.
 */

export type GalleryCategory = "Éducation" | "Santé" | "Solidarité" | "Événements";

export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  /** Photo : chemin dans /public. Vidéo : URL d'intégration (ex. YouTube « embed » sans cookies). */
  src: string | null;
  /** Vignette pour les vidéos. */
  poster?: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  place: string | null;
  date: string | null;
  consent: boolean;
  isIllustration: boolean;
  isExample: boolean;
  /** Crédit photo (images libres de droits). */
  author?: string;
  page?: string;
};

const ill = (id: string, img: (typeof stock)[keyof typeof stock], category: GalleryCategory): GalleryItem => ({
  id, type: "photo", src: img.src, alt: img.alt, caption: img.alt, category, place: null, date: null,
  consent: false, isIllustration: true, isExample: true, author: img.author, page: img.page,
});

/** Les éléments `isExample` sont des images d'illustration (Unsplash) à remplacer par vos photos. */
const items: GalleryItem[] = [
  ill("ill-1", stock.regle, "Éducation"),
  ill("ill-2", stock.consultation, "Santé"),
  ill("ill-3", stock.sacs, "Solidarité"),
  ill("ill-4", stock.groupe, "Événements"),
  ill("ill-5", stock.livres, "Éducation"),
  ill("ill-6", stock.benevoles, "Solidarité"),
  ill("ill-7", stock.stethoscope, "Santé"),
  { id: "ex-video", type: "video", src: null, alt: "Emplacement de vidéo à fournir", caption: "Emplacement : vidéo de présentation de la fondation", category: "Événements", place: null, date: null, consent: false, isIllustration: true, isExample: true },
];

export const galleryCategories: GalleryCategory[] = ["Éducation", "Santé", "Solidarité", "Événements"];

export function getGalleryItems() {
  return items.filter((i) => (i.isExample ? site.showExamples : i.consent && i.src));
}
