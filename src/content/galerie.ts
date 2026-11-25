import { site } from "@/config/site";

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
};

const items: GalleryItem[] = [
  { id: "ex-1", type: "photo", src: null, alt: "Emplacement de photo à fournir", caption: "Emplacement : photo d'une activité éducative", category: "Éducation", place: null, date: null, consent: false, isIllustration: true, isExample: true },
  { id: "ex-2", type: "photo", src: null, alt: "Emplacement de photo à fournir", caption: "Emplacement : photo d'une action de santé", category: "Santé", place: null, date: null, consent: false, isIllustration: true, isExample: true },
  { id: "ex-3", type: "photo", src: null, alt: "Emplacement de photo à fournir", caption: "Emplacement : photo d'une distribution solidaire", category: "Solidarité", place: null, date: null, consent: false, isIllustration: true, isExample: true },
  { id: "ex-4", type: "video", src: null, alt: "Emplacement de vidéo à fournir", caption: "Emplacement : vidéo de présentation", category: "Événements", place: null, date: null, consent: false, isIllustration: true, isExample: true },
  { id: "ex-5", type: "photo", src: null, alt: "Emplacement de photo à fournir", caption: "Emplacement : photo d'un événement", category: "Événements", place: null, date: null, consent: false, isIllustration: true, isExample: true },
  { id: "ex-6", type: "photo", src: null, alt: "Emplacement de photo à fournir", caption: "Emplacement : photo d'un atelier", category: "Éducation", place: null, date: null, consent: false, isIllustration: true, isExample: true },
];

export const galleryCategories: GalleryCategory[] = ["Éducation", "Santé", "Solidarité", "Événements"];

export function getGalleryItems() {
  return items.filter((i) => (i.isExample ? site.showExamples : i.consent && i.src));
}
