"use client";

import { useState } from "react";

/** Filtre par catégorie sous forme de boutons (puces). Les éléments sont rendus côté serveur. */
export function CategoryFilter({
  categories,
  items,
  label,
  allLabel = "Tout",
  countLabel = "élément(s) affiché(s)",
  gridClass = "grid grid-3",
  emptyText = "Aucun élément dans cette catégorie pour le moment.",
}: {
  categories: { value: string; label: string }[];
  items: { key: string; category: string; node: React.ReactNode }[];
  label: string;
  allLabel?: string;
  countLabel?: string;
  gridClass?: string;
  emptyText?: string;
}) {
  const [active, setActive] = useState<string>("");
  const visible = items.filter((i) => !active || i.category === active);
  return (
    <>
      <div className="chips" role="group" aria-label={label}>
        <button type="button" className="chip" aria-pressed={active === ""} onClick={() => setActive("")}>{allLabel}</button>
        {categories.map((c) => (
          <button key={c.value} type="button" className="chip" aria-pressed={active === c.value} onClick={() => setActive(c.value)}>{c.label}</button>
        ))}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{visible.length} {countLabel}</p>
      {visible.length > 0 ? (
        <div className={gridClass}>{visible.map((i) => <div key={i.key} style={{ display: "contents" }}>{i.node}</div>)}</div>
      ) : (
        <div className="empty"><p className="muted mb-0">{emptyText}</p></div>
      )}
    </>
  );
}
