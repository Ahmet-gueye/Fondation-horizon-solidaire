import Link from "next/link";
import { notFound } from "next/navigation";
import { FicheEditor } from "@/components/admin/FicheEditor";
import { getPublicProgrammes } from "@/content/programmes";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { canEdit, getFiche } from "@/lib/fiches/repo";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Modifier une fiche" };

export default async function EditFichePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const fiche = await getFiche((await params).id);
  if (!fiche) notFound();
  const sp = await searchParams;
  const editable = canEdit(user, fiche);
  const lockReason = editable
    ? null
    : fiche.status === "archive"
      ? "Fiche archivée : sortez-la des archives pour la modifier."
      : "Fiche publiée : seul un administrateur peut la modifier.";
  const { id, version, slug, createdAt, updatedAt, publishedAt, firstPublishedAt, createdBy, updatedBy, budget, ...input } = fiche;
  return (
    <div className="stack">
      <p className="small"><Link href="/admin">← Toutes les fiches</Link></p>
      <h1>{fiche.title}</h1>
      <p className="small muted">
        Créée le {formatDate(createdAt)} par {createdBy.name} · Modifiée le {formatDate(updatedAt)} par {updatedBy.name}
        {publishedAt ? ` · Publiée le ${formatDate(publishedAt)}` : ""}
      </p>
      {sp.enregistre ? <div className="notice notice-success" role="status"><p className="mb-0">Fiche enregistrée (non publiée).</p></div> : null}
      <FicheEditor
        key={version}
        initial={{ ...input, budget: { planned: budget.planned, collected: budget.collected, spent: budget.spent, validated: budget.validated } }}
        existing={{ id, version, status: fiche.status, publishedAt, firstPublishedAt, slug, editable, lockReason }}
        domains={getPublicProgrammes().map((p) => ({ value: p.slug, label: p.title }))}
        perms={{
          canValidateBudget: can(user.role, "budget.valider"),
          canPublish: can(user.role, "fiche.publier"),
          canArchive: can(user.role, "fiche.archiver"),
          canDelete: can(user.role, "fiche.supprimer"),
        }}
      />
    </div>
  );
}
