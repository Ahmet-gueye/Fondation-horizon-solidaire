import { requireUser } from "@/lib/auth/session";
import { getStore } from "@/lib/db/docstore";
import { contactTypes, type ContactInput } from "@/lib/validation";

export const metadata = { title: "Messages reçus" };

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" });

export default async function MessagesPage() {
  await requireUser("messages.voir");
  const rows = (await getStore().list<ContactInput & { receivedAt: string }>("messages")).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 200);
  return (
    <div className="stack">
      <h1>Messages reçus</h1>
      <p className="muted">Formulaires de contact, bénévolat et partenariat (200 derniers). Données personnelles : à ne pas copier hors de cet espace sans nécessité.</p>
      {rows.length === 0 ? <p>Aucun message.</p> : rows.map((m) => (
        <article key={m.id} className="card">
          <p className="meta"><time dateTime={m.receivedAt}>{fmt.format(new Date(m.receivedAt))}</time> · {contactTypes[m.type] ?? m.type}</p>
          <h2 style={{ fontSize: "1.1rem" }}>{m.name}</h2>
          <p className="small"><a href={`mailto:${m.email}`}>{m.email}</a>{m.phone ? ` · ${m.phone}` : ""}{m.organisation ? ` · ${m.organisation}` : ""}{m.availability ? ` · ${m.availability}` : ""}</p>
          <p style={{ whiteSpace: "pre-wrap" }} className="mb-0">{m.message}</p>
        </article>
      ))}
    </div>
  );
}
