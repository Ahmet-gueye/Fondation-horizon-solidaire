import Link from "next/link";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/roles";
import { adminReady, currentUser } from "@/lib/auth/session";
import { countUsers } from "@/lib/auth/users";
import { databaseKind } from "@/lib/db/docstore";
import { filesKind } from "@/lib/db/files";
import { listFiches } from "@/lib/fiches/repo";
import { ficheStatuses, ficheTypes, isPublic, type FicheStatus } from "@/lib/fiches/model";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Fiches" };

const filters: { value: string; label: string }[] = [
  { value: "", label: "Toutes (hors archives)" },
  { value: "en-ligne", label: "En ligne" },
  { value: "non-publiees", label: "Non publiées" },
  { value: "archive", label: "Archivées" },
];

export default async function AdminHome({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!adminReady()) redirect("/admin/configuration");
  const user = await currentUser();
  if (!user) redirect((await countUsers()) === 0 ? "/admin/installation" : "/admin/connexion");
  const sp = await searchParams;
  const f = sp.filtre ?? "";
  const all = await listFiches();
  const rows = all.filter((x) =>
    f === "archive" ? x.status === "archive" : f === "en-ligne" ? isPublic(x) : f === "non-publiees" ? !x.publishedAt && x.status !== "archive" : x.status !== "archive",
  );
  const local = databaseKind() === "fichiers" || filesKind() === "fichiers";

  return (
    <div className="stack">
      <div className="admin-head">
        <h1>Activités, événements, projets et campagnes</h1>
        <Link className="btn" href="/admin/fiches/nouvelle">Nouvelle fiche</Link>
      </div>
      {sp.refus ? <div className="notice notice-warn"><p className="mb-0">Votre rôle ne donne pas accès à cette page.</p></div> : null}
      {sp.supprime ? <div className="notice notice-success" role="status"><p className="mb-0">Fiche supprimée.</p></div> : null}
      {local ? (
        <div className="notice notice-warn">
          <p className="mb-0">Mode local : les données et images sont enregistrées dans le dossier <code>data/</code> de cet ordinateur. Pour le site en ligne, configurez la base de données et le stockage (voir le README).</p>
        </div>
      ) : null}
      {!can(user.role, "fiche.publier") ? (
        <div className="notice notice-info"><p className="mb-0">Vous êtes éditeur : vos fiches sont enregistrées sans être publiées. Un administrateur les relira et les publiera.</p></div>
      ) : null}

      <nav className="row-wrap" aria-label="Filtrer les fiches">
        {filters.map((x) => (
          <Link key={x.value} href={x.value ? `/admin?filtre=${x.value}` : "/admin"} className={`chip${f === x.value ? " is-active" : ""}`} aria-current={f === x.value ? "page" : undefined}>{x.label}</Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="empty"><h2 style={{ fontSize: "1.2rem" }}>Aucune fiche ici</h2><p className="muted">Créez une première fiche avec le bouton « Nouvelle fiche ».</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th scope="col">Titre</th><th scope="col">Type</th><th scope="col">Statut</th><th scope="col">Site</th><th scope="col">Mise à jour</th></tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.id}>
                  <td><Link href={`/admin/fiches/${x.id}`}>{x.title}</Link></td>
                  <td>{ficheTypes[x.type]}</td>
                  <td>{ficheStatuses[x.status as FicheStatus]}</td>
                  <td>{isPublic(x) ? <span className="badge">En ligne</span> : <span className="badge badge-sun">Non publiée</span>}</td>
                  <td>{formatDate(x.updatedAt)} <span className="muted small">par {x.updatedBy.name}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
