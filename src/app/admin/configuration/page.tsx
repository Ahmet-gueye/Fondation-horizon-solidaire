import Link from "next/link";
import { databaseKind } from "@/lib/db/docstore";
import { filesKind } from "@/lib/db/files";
import { adminReady } from "@/lib/auth/session";
import { getAuthSecret, getSetupToken, getSiteUrl } from "@/lib/env";
import { paymentMode } from "@/lib/payments/dons";

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
          detail={files === "vercel-blob" ? "Vercel Blob." : files === "fichiers" ? "Dossier local (développement uniquement)." : "Magasin Vercel Blob non relié (BLOB_READ_WRITE_TOKEN ou BLOB_STORE_ID manquant) : obligatoire sur Vercel pour importer des images."}
        />
        <Row ok={Boolean(getSetupToken())} label="ADMIN_SETUP_TOKEN" detail="Code utilisé une seule fois pour créer le premier administrateur. Peut être retiré ensuite." />
      </ul>
      <h2>Dons en ligne (PayTech)</h2>
      <ul className="config-list">
        <Row ok={Boolean(process.env.PAYTECH_API_KEY?.trim())} label="PAYTECH_API_KEY" detail="Clé API PayTech (tableau de bord PayTech)." />
        <Row ok={Boolean(process.env.PAYTECH_API_SECRET?.trim())} label="PAYTECH_API_SECRET" detail="Clé secrète PayTech." />
        <Row
          ok={paymentMode() !== "off"}
          label="PAYTECH_ENV"
          detail={paymentMode() === "prod" ? "prod : dons ouverts au public." : paymentMode() === "test" ? "test : formulaire visible seulement par les personnes connectées." : "Absent ou incomplet : écrire test (essais) ou prod (compte activé par PayTech)."}
        />
        <Row ok={getSiteUrl().startsWith("https://")} label="Adresse du site" detail={`${getSiteUrl()} : doit commencer par https:// pour recevoir les confirmations PayTech.`} />
      </ul>
      <p className="small muted">La marche à suivre est détaillée dans le fichier README du projet, section « Espace d&apos;administration ».</p>
      {adminReady() ? <Link className="btn" href="/admin">Accéder à l&apos;administration</Link> : null}
    </div>
  );
}
