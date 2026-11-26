import Link from "next/link";
import { FicheEditor } from "@/components/admin/FicheEditor";
import { getPublicProgrammes } from "@/content/programmes";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Nouvelle fiche" };

export default async function NewFichePage() {
  const user = await requireUser("fiche.creer");
  return (
    <div className="stack">
      <p className="small"><Link href="/admin">← Toutes les fiches</Link></p>
      <h1>Nouvelle fiche</h1>
      <p className="muted">La fiche sera enregistrée sans être publiée. Les champs marqués * sont obligatoires.</p>
      <FicheEditor
        initial={null}
        existing={null}
        domains={getPublicProgrammes().map((p) => ({ value: p.slug, label: p.title }))}
        perms={{ canValidateBudget: can(user.role, "budget.valider"), canPublish: false, canArchive: false, canDelete: false }}
      />
    </div>
  );
}
