"use client";

/**
 * Préparation des images DANS LE NAVIGATEUR avant l'envoi :
 * vérification du format et de la taille, redressement selon l'orientation de l'appareil,
 * réduction à 2400 px maximum et réencodage JPEG. Cela supprime aussi les métadonnées
 * (dont la position GPS) et garantit un envoi léger, même depuis un téléphone.
 * Le serveur refait ensuite ses propres vérifications et produit les versions WebP finales.
 */

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MIN_WIDTH = 400;
const MAX_SIDE = 2400;
const MAX_SEND_BYTES = 3.8 * 1024 * 1024;

export type PreparedImage = { blob: Blob; width: number; height: number; previewUrl: string; warning: string | null };

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new Error("Format non accepté : choisissez une photo JPEG, PNG ou WebP.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Image trop lourde (20 Mo maximum avant optimisation).");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Cette image ne peut pas être lue par le navigateur. Essayez une photo JPEG ou PNG.");
  }
  if (bitmap.width < MIN_WIDTH) {
    bitmap.close();
    throw new Error(`Image trop petite : ${MIN_WIDTH} pixels de large au minimum (celle-ci en fait ${bitmap.width}).`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Votre navigateur ne permet pas de préparer l'image.");
  ctx.fillStyle = "#ffffff"; // fond blanc pour les PNG transparents
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.88, 0.8, 0.7, 0.6]) {
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_SEND_BYTES) break;
  }
  if (!blob || blob.size > MAX_SEND_BYTES) throw new Error("Impossible d'alléger suffisamment cette image.");
  const warning = width < 1200 ? "Image de petite taille : elle pourra paraître floue sur les grands écrans." : null;
  return { blob, width, height, previewUrl: URL.createObjectURL(blob), warning };
}

export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export async function checkPdf(file: File) {
  if (file.size > MAX_PDF_BYTES) throw new Error("Document trop lourd (4 Mo maximum).");
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...head) !== "%PDF-") throw new Error("Seuls les documents PDF sont acceptés.");
}
