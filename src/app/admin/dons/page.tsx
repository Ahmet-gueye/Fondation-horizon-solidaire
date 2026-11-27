import Link from "next/link";
import { getPublicProgrammes } from "@/content/programmes";
import { requireUser } from "@/lib/auth/session";
import { donStatusLabels, listDons, paymentMode, type Don } from "@/lib/payments/dons";

export const metadata = { title: "Dons" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" });
const nf = new Intl.NumberFormat("fr-FR");

function totals(dons: Don[]) {
  const t = new Map<string, { sum: number; count: number }>();
  for (const d of dons) {
    const cur = t.get(d.currency) ?? { sum: 0, count: 0 };
    t.set(d.currency, { sum: cur.sum + d.amount, count: cur.count + 1 });
  }
  return [...t.entries()];
}

export default async function DonsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("dons.voir");
  const sp = await searchParams;
  const showTest = sp.test === "1";
  const mode = paymentMode();
  const all = await listDons().catch(() => []);
  const dons = all.filter((d) => (showTest ? d.env === "test" : d.env === "prod"));
  const paid = dons.filter((d) => d.status === "paye");
  const programmes = getPublicProgrammes();
  const target = (d: Don) => d.ficheTitle ?? programmes.find((p) => p.slug === d.programme)?.shortTitle ?? "Besoins prioritaires";

  return (
    <div className="stack">
      <h1>Dons en ligne</h1>
      <p className="muted mb-0">
        État du paiement en ligne :{" "}
        <strong>{mode === "prod" ? "ouvert au public (PayTech production)" : mode === "test" ? "mode test (visible seulement par les personnes connectées)" : "désactivé (clés PayTech absentes)"}</strong>.
        Un don n&apos;est « Payé » qu&apos;après la confirmation signée envoyée par PayTech au serveur.
      </p>
      <p className="row-wrap">
        <Link href="/admin/dons" className={`btn btn-sm${showTest ? " btn-outline" : ""}`}>Dons réels</Link>
        <Link href="/admin/dons?test=1" className={`btn btn-sm${showTest ? "" : " btn-outline"}`}>Essais (mode test)</Link>
        {mode !== "off" ? <Link href="/faire-un-don" className="btn btn-sm btn-outline" target="_blank">Ouvrir le formulaire de don</Link> : null}
      </p>

      <div className="grid grid-3">
        {totals(paid).length === 0 ? (
          <div className="card"><p className="mb-0">Aucun don payé {showTest ? "en mode test" : "pour le moment"}.</p></div>
        ) : (
          totals(paid).map(([cur, v]) => (
            <div key={cur} className="card">
              <p className="muted mb-0">Total payé ({cur})</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 700 }} className="mb-0">{nf.format(v.sum)} {cur === "XOF" ? "FCFA" : cur}</p>
              <p className="small muted mb-0">{v.count} don{v.count > 1 ? "s" : ""}</p>
            </div>
          ))
        )}
      </div>

      {dons.length === 0 ? (
        <p>Aucun don enregistré.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Référence</th><th>Montant</th><th>Affectation</th><th>État</th><th>Moyen</th><th>Donateur</th></tr>
            </thead>
            <tbody>
              {dons.slice(0, 300).map((d) => (
                <tr key={d.id}>
                  <td>{fmt.format(new Date(d.createdAt))}</td>
                  <td><code>{d.ref}</code></td>
                  <td>{nf.format(d.amount)} {d.currency === "XOF" ? "FCFA" : d.currency}</td>
                  <td>{target(d)}</td>
                  <td><span className={`badge${d.status === "paye" ? " badge-teal" : d.status === "en_attente" ? " badge-sun" : ""}`}>{donStatusLabels[d.status]}</span></td>
                  <td>{d.paymentMethod ?? ""}</td>
                  <td>{d.donorName || d.donorEmail ? <>{d.donorName}{d.donorEmail ? <> <a href={`mailto:${d.donorEmail}`}>{d.donorEmail}</a></> : null}</> : <span className="muted">Anonyme</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted">
        Un don « En attente » correspond à un visiteur qui a ouvert la page PayTech sans que le paiement soit (encore) confirmé.
        Les montants collectés des fiches restent à valider à la main dans chaque fiche.
      </p>
    </div>
  );
}
