import { currentUser } from "@/lib/auth/session";
import { getFileStore } from "@/lib/db/files";
import { getMedia } from "@/lib/fiches/media";
import { getFiche } from "@/lib/fiches/repo";
import { isPublic } from "@/lib/fiches/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diffusion des fichiers importés.
 * - Visiteur : seulement si le fichier est rattaché à une fiche PUBLIÉE.
 * - Personne connectée à l'administration : tous les fichiers (aperçu avant publication).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; variant: string }> }) {
  const { id, variant } = await params;
  if (variant !== "lg" && variant !== "md" && variant !== "pdf") return new Response("Introuvable", { status: 404 });
  let media;
  try {
    media = await getMedia(id);
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
  const key = media?.files[variant];
  if (!media || !key) return new Response("Introuvable", { status: 404 });

  let publicFile = false;
  if (media.ficheId) {
    const fiche = await getFiche(media.ficheId);
    publicFile = Boolean(fiche && isPublic(fiche));
  }
  if (!publicFile && !(await currentUser())) return new Response("Introuvable", { status: 404 });

  const file = await getFileStore().get(key);
  if (!file) return new Response("Introuvable", { status: 404 });
  const isPdf = variant === "pdf";
  const headers = new Headers({
    "Content-Type": isPdf ? "application/pdf" : "image/webp",
    "X-Content-Type-Options": "nosniff",
    // Court délai de cache public : un retrait de publication prend effet rapidement.
    "Cache-Control": publicFile ? "public, max-age=600, s-maxage=3600" : "private, no-store",
  });
  if (isPdf) {
    headers.set("Content-Disposition", `inline; filename="document-${id.slice(0, 8)}.pdf"`);
    headers.set("Content-Security-Policy", "sandbox");
  }
  if (!publicFile) headers.set("X-Robots-Tag", "noindex");
  return new Response(file.body as BodyInit, { headers });
}
