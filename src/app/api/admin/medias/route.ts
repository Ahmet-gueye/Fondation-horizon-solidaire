import { apiUser } from "@/lib/auth/session";
import { FilesNotConfigured } from "@/lib/db/files";
import { MAX_UPLOAD_BYTES, UploadError, cleanupOrphans, saveDocument, saveImage } from "@/lib/fiches/media";
import { jsonError, logEvent, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Import d'une image ou d'un document PDF (multipart/form-data : `file`, `kind`). */
export async function POST(request: Request) {
  const user = await apiUser(request, "fiche.creer");
  if (user instanceof Response) return user;
  if (!rateLimit(`upload:${user.id}`, 60, 10 * 60_000)) return jsonError(429, "Trop d'envois en peu de temps. Patientez quelques minutes.");

  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) return jsonError(413, "Fichier trop lourd (4 Mo maximum).");
  if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) return jsonError(415, "Format d'envoi invalide.");

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "document")) return jsonError(400, "Aucun fichier reçu.");
  if (file.size > MAX_UPLOAD_BYTES) return jsonError(413, "Fichier trop lourd (4 Mo maximum).");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const media = kind === "image" ? await saveImage(buffer, user.id) : await saveDocument(buffer, user.id);
    void cleanupOrphans();
    return Response.json({ ok: true, media: { id: media.id, kind: media.kind, width: media.width, height: media.height } });
  } catch (err) {
    if (err instanceof UploadError) return jsonError(422, err.message);
    if (err instanceof FilesNotConfigured) return jsonError(503, "Le stockage des fichiers n'est pas configuré (voir le README).");
    logEvent("media.import.erreur", { message: (err as Error).message });
    return jsonError(500, "L'import a échoué. Réessayez.");
  }
}
