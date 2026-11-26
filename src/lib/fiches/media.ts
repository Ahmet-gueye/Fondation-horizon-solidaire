import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStore, type Doc } from "@/lib/db/docstore";
import { getFileStore } from "@/lib/db/files";
import { logEvent } from "@/lib/security";

/**
 * Fichiers téléversés par l'administration.
 *
 * Images : JPEG, PNG ou WebP, 4 Mo maximum par envoi (le navigateur réduit d'abord les
 * photos trop lourdes). Le serveur vérifie le vrai format du fichier, corrige l'orientation,
 * SUPPRIME les métadonnées (dont la position GPS) et produit deux versions WebP :
 * 1600 px (écrans haute résolution) et 800 px (téléphones, vignettes).
 *
 * Documents : PDF uniquement, 4 Mo maximum.
 *
 * Un fichier n'est jamais public par lui-même : il n'est servi aux visiteurs que si la
 * fiche à laquelle il est rattaché est publiée (voir /media/[id]/[variante]).
 */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const IMAGE_MIN_WIDTH = 400;
const VARIANTS = { lg: 1600, md: 800 } as const;

export type MediaData = {
  kind: "image" | "document";
  files: { lg?: string; md?: string; pdf?: string };
  width: number | null;
  height: number | null;
  bytes: number;
  uploadedBy: string;
  uploadedAt: string;
  /** Fiche de rattachement (null tant que la fiche n'a pas été enregistrée). */
  ficheId: string | null;
};
export type Media = Doc<MediaData>;

const C = "medias";

export class UploadError extends Error {}

export async function getMedia(id: string) {
  if (!/^[a-z0-9-]{10,40}$/.test(id)) return null;
  return getStore().get<MediaData>(C, id);
}

export async function saveImage(buffer: Buffer, userId: string) {
  if (buffer.length > MAX_UPLOAD_BYTES) throw new UploadError("Image trop lourde (4 Mo maximum).");
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(buffer, { limitInputPixels: 60_000_000 }).metadata();
  } catch {
    throw new UploadError("Ce fichier n'est pas une image lisible.");
  }
  if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) throw new UploadError("Format non accepté : utilisez une image JPEG, PNG ou WebP.");
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = (rotated ? meta.height : meta.width) ?? 0;
  if (width < IMAGE_MIN_WIDTH) throw new UploadError(`Image trop petite : ${IMAGE_MIN_WIDTH} pixels de large au minimum.`);

  const id = randomUUID();
  const files: MediaData["files"] = {};
  let finalW: number | null = null;
  let finalH: number | null = null;
  const store = getFileStore();
  for (const [name, size] of Object.entries(VARIANTS) as [keyof typeof VARIANTS, number][]) {
    const { data, info } = await sharp(buffer, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: name === "lg" ? 82 : 78 })
      .toBuffer({ resolveWithObject: true });
    const key = `img/${id}-${name}.webp`;
    await store.put(key, data, "image/webp");
    files[name] = key;
    if (name === "lg") {
      finalW = info.width;
      finalH = info.height;
    }
  }
  return getStore().insert<MediaData>(C, id, {
    kind: "image",
    files,
    width: finalW,
    height: finalH,
    bytes: buffer.length,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    ficheId: null,
  });
}

export async function saveDocument(buffer: Buffer, userId: string) {
  if (buffer.length > MAX_UPLOAD_BYTES) throw new UploadError("Document trop lourd (4 Mo maximum).");
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("Seuls les documents PDF sont acceptés.");
  const id = randomUUID();
  const key = `doc/${id}.pdf`;
  await getFileStore().put(key, buffer, "application/pdf");
  return getStore().insert<MediaData>(C, id, {
    kind: "document",
    files: { pdf: key },
    width: null,
    height: null,
    bytes: buffer.length,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    ficheId: null,
  });
}

export async function deleteMedia(m: Media) {
  try {
    await getFileStore().remove(Object.values(m.files).filter((k): k is string => Boolean(k)));
  } catch (err) {
    logEvent("media.suppression.erreur", { message: (err as Error).message });
  }
  await getStore().remove(C, m.id);
}

export async function attachMedia(m: Media, ficheId: string) {
  if (m.ficheId === ficheId) return m;
  const { id, version, ...data } = m;
  return getStore().update<MediaData>(C, id, { ...data, ficheId }, version);
}

/** Supprime les fichiers importés mais jamais rattachés à une fiche (enregistrement abandonné). */
export async function cleanupOrphans(olderThanHours = 24) {
  try {
    const limit = new Date(Date.now() - olderThanHours * 3600_000).toISOString();
    const orphans = (await getStore().list<MediaData>(C)).filter((m) => m.ficheId === null && m.uploadedAt < limit);
    for (const m of orphans.slice(0, 20)) await deleteMedia(m);
  } catch (err) {
    logEvent("media.nettoyage.erreur", { message: (err as Error).message });
  }
}
