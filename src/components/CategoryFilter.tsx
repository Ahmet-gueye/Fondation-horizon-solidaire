"use client";

import { useState } from "react";

/** Filtre par catégorie sous forme de boutons (puces). Les éléments sont rendus côté serveur. */
export function CategoryFilter({
  categories,
  items,
  label,
  gridClass = "grid grid-3",
  emptyText = "Aucun élément dans cette catégorie pour le moment.",
}: {
  categories: string[];
  items: { key: string; category: string; node: React.ReactNode }[];
  label: string;
  gridClass?: string;
  emptyText?: string;
}) {
  const [active, setActive] = useState<string>("");
  const visible = items.filter((i) => !active || i.category === active);
  return (
    <>
      <div className="chips" role="group" aria-label={label}>
        <button type="button" className="chip" aria-pressed={active === ""} onClick={() => setActive("")}>Tout</button>
        {categories.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={active === c} onClick={() => setActive(c)}>{c}</button>
        ))}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{visible.length} élément(s) affiché(s)</p>
      {visible.length > 0 ? (
        <div className={gridClass}>{visible.map((i) => <div key={i.key} style={{ display: "contents" }}>{i.node}</div>)}</div>
      ) : (
        <div className="empty"><p className="muted mb-0">{emptyText}</p></div>
      )}
    </>
  );
}
