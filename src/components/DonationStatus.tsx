"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/format";
import { Icon } from "./Icon";

type Status = "loading" | "pending" | "paid" | "canceled" | "failed" | "unknown" | "error";

/**
 * Affiche l'état réel d'un don, tel qu'enregistré par le serveur
 * (confirmé uniquement par la notification IPN de PayTech).
 * Le retour du navigateur depuis PayTech ne suffit jamais à valider un don.
 */
export function DonationStatus({ reference, context }: { reference: string | null; context: "merci" | "annule" }) {
  const [status, setStatus] = useState<Status>(reference ? "loading" : "unknown");
  const [amount, setAmount] = useState<number | null>(null);
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/dons/statut?ref=${encodeURIComponent(reference)}`, { cache: "no-store" });
        if (res.status === 404 || res.status === 400) { setStatus("unknown"); return; }
        const data = (await res.json()) as { status?: Status; amount?: number; mode?: string };
        if (stopped) return;
        setAmount(data.amount ?? null);
        setMode(data.mode ?? null);
        const s = data.status ?? "error";
        setStatus(s);
        // La notification PayTech peut arriver quelques secondes après le retour : on réinterroge.
        if (s === "pending" && attempts < 20) timer = setTimeout(poll, Math.min(2000 + attempts * 500, 6000));
      } catch {
        if (!stopped) setStatus("error");
      }
    };
    poll();
    return () => { stopped = true; clearTimeout(timer); };
  }, [reference]);

  const refLine = reference ? <p className="small muted">Référence du don : <strong>{reference}</strong></p> : null;
  const sim = mode === "simulation" ? <p className="small"><span className="badge badge-example">Simulation : aucun montant réel n&apos;a été encaissé</span></p> : null;

  if (status === "loading") {
    return (
      <div className="status-card" role="status">
        <div className="spinner spinner-dark" aria-hidden="true" />
        <h2>Vérification de votre don…</h2>
        <p className="muted">Nous interrogeons notre serveur pour connaître l&apos;état de votre paiement.</p>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="status-card" role="status">
        <div className="status-icon accent-green"><Icon name="check" /></div>
        <h2>Merci pour votre générosité !</h2>
        <p className="lead">Votre don{amount ? ` de ${formatFCFA(amount)}` : ""} a bien été confirmé.</p>
        {sim}
        {refLine}
        <p className="small muted">Conservez cette référence. Aucun e-mail de confirmation automatique n&apos;est envoyé pour le moment ; pour toute question, contactez la fondation en indiquant votre référence.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/projets" className="btn">Découvrir nos projets</Link>
          <Link href="/" className="btn btn-outline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  if (status === "pending" && context === "merci") {
    return (
      <div className="status-card" role="status">
        <div className="status-icon accent-sun"><Icon name="info" /></div>
        <h2>Paiement en cours de confirmation</h2>
        <p>Nous n&apos;avons pas encore reçu la confirmation de PayTech. Cela peut prendre quelques minutes, notamment pour les paiements mobiles.</p>
        <p className="small muted">Ne refaites pas de don tout de suite : si le paiement est validé, il sera enregistré automatiquement. Cette page se met à jour toute seule.</p>
        {refLine}
        <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Actualiser</button>
      </div>
    );
  }

  if (status === "canceled" || status === "failed" || context === "annule") {
    const failed = status === "failed";
    return (
      <div className="status-card" role="status">
        <div className="status-icon accent-red"><Icon name="alert" /></div>
        <h2>{failed ? "Le paiement n'a pas abouti" : "Paiement annulé"}</h2>
        <p>{failed ? "Une erreur est survenue pendant le paiement." : "Le paiement n'a pas été finalisé."} Aucun don n&apos;a été enregistré comme payé pour cette référence.</p>
        {refLine}
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/faire-un-don" className="btn btn-sun">Réessayer</Link>
          <Link href="/contact" className="btn btn-outline">Besoin d&apos;aide ?</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="status-card" role="status">
      <div className="status-icon accent-blue"><Icon name="info" /></div>
      <h2>{status === "error" ? "Vérification impossible pour le moment" : "Don introuvable"}</h2>
      <p>{status === "error" ? "Nous n'avons pas pu vérifier l'état de votre don. Réessayez dans quelques instants." : "Nous ne trouvons pas de don correspondant à ce lien."}</p>
      {refLine}
      <div className="hero-actions" style={{ justifyContent: "center" }}>
        {status === "error" ? <button type="button" className="btn" onClick={() => window.location.reload()}>Réessayer</button> : null}
        <Link href="/faire-un-don" className="btn btn-outline">Faire un don</Link>
      </div>
    </div>
  );
}
