import { Icon } from "./Icon";

/** Mention visible pour toute information que la fondation doit encore fournir. */
export function ToComplete({ label = "À compléter par la fondation", block = false }: { label?: string; block?: boolean }) {
  return (
    <span className={`to-complete${block ? " to-complete-block" : ""}`}>
      <Icon name="info" />
      {label}
    </span>
  );
}

export function ExampleBadge({ label = "Exemple à remplacer" }: { label?: string }) {
  return <span className="badge badge-example">{label}</span>;
}

/** Valeur ou mention « À compléter ». */
export function ValueOr({ value, label }: { value: React.ReactNode | null | undefined; label?: string }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <ToComplete label={label} />;
  }
  return <>{value}</>;
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warn" | "error" | "success"; title?: string; children: React.ReactNode }) {
  const icon = tone === "success" ? "check" : tone === "info" ? "info" : "alert";
  return (
    <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : undefined}>
      <Icon name={icon} />
      <div>
        {title ? <p><strong>{title}</strong></p> : null}
        {children}
      </div>
    </div>
  );
}

export function MediaSlot({ label = "Photo à fournir par la fondation", kind = "image", ratio }: { label?: string; kind?: "image" | "video"; ratio?: string }) {
  return (
    <div className="media-slot" role="img" aria-label={label} style={ratio ? { aspectRatio: ratio } : undefined}>
      <div>
        <Icon name={kind} />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon = "doc", title, children }: { icon?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <h3>{title}</h3>
      {children ? <div className="muted">{children}</div> : null}
    </div>
  );
}

/** Liste d'adresses e-mail cliquables, ou mention « À compléter ». */
export function EmailLinks({ emails, label = "E-mail à compléter" }: { emails: readonly string[]; label?: string }) {
  if (emails.length === 0) return <ToComplete label={label} />;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      {emails.map((e) => <a key={e} href={`mailto:${e}`} style={{ overflowWrap: "anywhere" }}>{e}</a>)}
    </span>
  );
}
