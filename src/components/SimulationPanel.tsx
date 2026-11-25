"use client";

import { useState } from "react";

/** Écran de simulation : remplace la page PayTech quand aucun identifiant n'est configuré. */
export function SimulationPanel({ reference }: { reference: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(outcome: "paid" | "canceled" | "failed") {
    setBusy(outcome);
    setError(null);
    try {
      const res = await fetch("/api/dons/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: reference, outcome }),
      });
      const data = (await res.json().catch(() => null)) as { redirectUrl?: string; message?: string } | null;
      if (res.ok && data?.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      setError(data?.message ?? "La simulation a échoué.");
    } catch {
      setError("Connexion impossible.");
    }
    setBusy(null);
  }

  return (
    <div className="stack">
      {error ? <div className="notice notice-error" role="alert"><p className="mb-0">{error}</p></div> : null}
      <div className="hero-actions" style={{ justifyContent: "center" }}>
        <button type="button" className="btn" disabled={busy !== null} onClick={() => choose("paid")}>{busy === "paid" ? "…" : "Simuler un paiement réussi"}</button>
        <button type="button" className="btn btn-outline" disabled={busy !== null} onClick={() => choose("canceled")}>{busy === "canceled" ? "…" : "Simuler une annulation"}</button>
        <button type="button" className="btn btn-outline" disabled={busy !== null} onClick={() => choose("failed")}>{busy === "failed" ? "…" : "Simuler un échec"}</button>
      </div>
    </div>
  );
}
