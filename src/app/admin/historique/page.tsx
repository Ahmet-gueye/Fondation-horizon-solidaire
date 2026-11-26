import { auditLabels, listAudit } from "@/lib/audit";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Historique" };

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" });

export default async function AuditPage() {
  await requireUser("historique.voir");
  const rows = await listAudit();
  return (
    <div className="stack">
      <h1>Historique des modifications</h1>
      <p className="muted">Les 300 dernières actions (heure de Dakar).</p>
      {rows.length === 0 ? <p>Aucune action enregistrée.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Date</th><th scope="col">Auteur</th><th scope="col">Action</th><th scope="col">Élément</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><time dateTime={r.at}>{fmt.format(new Date(r.at))}</time></td>
                  <td>{r.actorName}</td>
                  <td>{auditLabels[r.action] ?? r.action}{r.details ? <span className="muted"> ({r.details})</span> : null}</td>
                  <td>{r.targetLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
