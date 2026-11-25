"use client";

import { useMemo, useState } from "react";
import type { Project, ProjectStatus } from "@/content/projets";
import { statusLabels } from "@/content/projets";

type Option = { value: string; label: string };

/**
 * Filtres par domaine, région et état. Les cartes sont rendues côté serveur
 * (via `cards`) et simplement affichées/masquées ici : le contenu reste
 * accessible même sans JavaScript.
 */
export function ProjectFilters({
  projects,
  programmes,
  cards,
}: {
  projects: Pick<Project, "slug" | "programme" | "region" | "status">[];
  programmes: Option[];
  cards: Record<string, React.ReactNode>;
}) {
  const [programme, setProgramme] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");

  const regions = useMemo(
    () => Array.from(new Set(projects.map((p) => p.region).filter((r): r is string => Boolean(r)))).sort((a, b) => a.localeCompare(b, "fr")),
    [projects],
  );
  const visible = projects.filter(
    (p) => (!programme || p.programme === programme) && (!region || p.region === region) && (!status || p.status === status),
  );
  const active = programme || region || status;

  return (
    <>
      <form className="filters" role="search" aria-label="Filtrer les projets" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor="f-programme">Domaine</label>
          <select id="f-programme" value={programme} onChange={(e) => setProgramme(e.target.value)}>
            <option value="">Tous les domaines</option>
            {programmes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-region">Région</label>
          <select id="f-region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Toutes les régions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-status">État du projet</label>
          <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les états</option>
            {(Object.keys(statusLabels) as ProjectStatus[]).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setProgramme(""); setRegion(""); setStatus(""); }} disabled={!active}>
          Réinitialiser
        </button>
      </form>

      <p className="muted small" role="status" aria-live="polite">
        {visible.length === 0 ? "Aucun projet ne correspond à ces filtres." : `${visible.length} projet${visible.length > 1 ? "s" : ""} affiché${visible.length > 1 ? "s" : ""}`}
      </p>

      {visible.length > 0 ? (
        <div className="grid grid-3">
          {visible.map((p) => <div key={p.slug} style={{ display: "contents" }}>{cards[p.slug]}</div>)}
        </div>
      ) : (
        <div className="empty">
          <h3>Aucun résultat</h3>
          <p className="muted">Modifiez ou réinitialisez les filtres pour voir d&apos;autres projets.</p>
        </div>
      )}
    </>
  );
}
