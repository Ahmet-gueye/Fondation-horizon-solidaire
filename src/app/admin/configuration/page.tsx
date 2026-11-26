import Link from "next/link";
import { databaseKind } from "@/lib/db/docstore";
import { filesKind } from "@/lib/db/files";
import { adminReady } from "@/lib/auth/session";
import { getAuthSecret, getSetupToken } from "@/lib/env";

export const metadata = { title: "Configuration" };

function Row({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className={`config-row ${ok ? "is-ok" : "is-missing"}`}>
      <strong>{ok ? "✓" : "✗"} {label}</strong>
      <span className="muted">{detail}</span>
    </li>
  );
}

/** État de la configuration, sans jamais afficher la valeur d'une variable. */
export default function ConfigPage() {
  const db = databaseKind();
  const files = filesKind();
  return (
    <div className="admin-narrow stack">
      <h1>Configuration de l&apos;espace d&apos;administration</h1>
      <p>
        {adminReady()
          ? "L'espace d'administration est utilisable."
          : "L'espace d'administration n'est pas encore utilisable : il manque un ou plusieurs réglages chez l'hébergeur."}
      </p>
      <ul className="config-list">
        <Row ok={Boolean(getAuthSecret())} label="AUTH_SECRET" detail="Secret de signature des sessions (32 caractères minimum)." />
        <Row
          ok={db !== null}
          label="Base de données"
          detail={db === "postgres" ? "PostgreSQL (DATABASE_URL)." : db === "fichiers" ? "Fichiers locaux (développement uniquement)." : "DATABASE_URL manquante : obligatoire sur Vercel."}
        />
        <Row
          ok={files !== null}
          label="Stockage des images et documents"
          detail={files === "vercel-blob" ? "Vercel Blob (BLOB_READ_WRITE_TOKEN)." : files === "fichiers" ? "Dossier local (développement uniquement)." : "BLOB_READ_WRITE_TOKEN manquant : obligatoire sur Vercel pour importer des images."}
        />
        <Row ok={Boolean(getSetupToken())} label="ADMIN_SETUP_TOKEN" detail="Code utilisé une seule fois pour créer le premier administrateur. Peut être retiré ensuite." />
      </ul>
      <p className="small muted">La marche à suivre est détaillée dans le fichier README du projet, section « Espace d&apos;administration ».</p>
      {adminReady() ? <Link className="btn" href="/admin">Accéder à l&apos;administration</Link> : null}
    </div>
  );
}
