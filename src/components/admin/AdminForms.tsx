"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { roleLabels, type Role } from "@/lib/auth/roles";
import { adminApi } from "./api";

export function FormMessage({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <p className="mb-0">{children}</p>
    </div>
  );
}

function TextField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  hint,
  autoComplete,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-h` : null, error ? `${id}-e` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}{required ? <span className="req" aria-hidden="true"> *</span> : null}</label>
      {hint ? <p className="hint" id={`${id}-h`}>{hint}</p> : null}
      <input id={id} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
      {error ? <p className="field-error" id={`${id}-e`}>{error}</p> : null}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="form card"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const r = await adminApi("/api/admin/session", "POST", { email, password });
        setBusy(false);
        if (r.ok) {
          router.replace("/admin");
          router.refresh();
        } else setError(r.message);
      }}
    >
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <TextField label="Adresse e-mail" name="email" type="email" value={email} onChange={setEmail} autoComplete="username" />
      <TextField label="Mot de passe" name="password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
      <button className="btn" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}

export function SetupForm() {
  const router = useRouter();
  const [v, setV] = useState({ token: "", name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form
      className="form card"
      onSubmit={async (e) => {
        e.preventDefault();
        if (v.password !== v.confirm) {
          setErrors({ confirm: "Les deux mots de passe ne correspondent pas." });
          return;
        }
        setBusy(true);
        setError(null);
        setErrors({});
        const r = await adminApi("/api/admin/installation", "POST", { token: v.token, name: v.name, email: v.email, password: v.password });
        setBusy(false);
        if (r.ok) {
          router.replace("/admin");
          router.refresh();
        } else {
          setError(r.message);
          setErrors(r.errors ?? {});
        }
      }}
    >
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <TextField label="Code d'installation" name="token" type="password" value={v.token} onChange={set("token")} hint="La valeur de la variable ADMIN_SETUP_TOKEN que vous avez définie chez votre hébergeur." autoComplete="off" />
      <TextField label="Votre nom" name="name" value={v.name} onChange={set("name")} error={errors.name} autoComplete="name" />
      <TextField label="Votre adresse e-mail" name="email" type="email" value={v.email} onChange={set("email")} error={errors.email} autoComplete="username" />
      <TextField label="Mot de passe" name="password" type="password" value={v.password} onChange={set("password")} error={errors.password} hint="12 caractères minimum. Une phrase de plusieurs mots est idéale." autoComplete="new-password" />
      <TextField label="Confirmez le mot de passe" name="confirm" type="password" value={v.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
      <button className="btn" type="submit" disabled={busy} aria-busy={busy}>{busy ? "Création…" : "Créer le compte administrateur"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form
      className="form card"
      onSubmit={async (e) => {
        e.preventDefault();
        if (v.next !== v.confirm) {
          setErrors({ confirm: "Les deux mots de passe ne correspondent pas." });
          return;
        }
        setBusy(true);
        setErrors({});
        const r = await adminApi("/api/admin/mot-de-passe", "POST", { current: v.current, next: v.next });
        setBusy(false);
        if (r.ok) {
          setV({ current: "", next: "", confirm: "" });
          setMsg({ tone: "success", text: "Mot de passe modifié. Vos autres appareils ont été déconnectés." });
        } else {
          setErrors(r.errors ?? {});
          setMsg({ tone: "error", text: r.message });
        }
      }}
    >
      {msg ? <FormMessage tone={msg.tone}>{msg.text}</FormMessage> : null}
      <TextField label="Mot de passe actuel" name="current" type="password" value={v.current} onChange={set("current")} error={errors.current} autoComplete="current-password" />
      <TextField label="Nouveau mot de passe" name="next" type="password" value={v.next} onChange={set("next")} error={errors.next} hint="12 caractères minimum." autoComplete="new-password" />
      <TextField label="Confirmez le nouveau mot de passe" name="confirm" type="password" value={v.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
      <button className="btn" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Changer le mot de passe"}</button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={async () => {
        await adminApi("/api/admin/session", "DELETE");
        router.replace("/admin/connexion");
        router.refresh();
      }}
    >
      Se déconnecter
    </button>
  );
}

type UserRow = { id: string; name: string; email: string; role: Role; active: boolean; lastLoginAt: string | null };

export function UsersManager({ users, meId }: { users: UserRow[]; meId: string }) {
  const router = useRouter();
  const [v, setV] = useState({ name: "", email: "", role: "editeur" as Role, password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const roleId = useId();

  async function patch(id: string, body: Record<string, unknown>, ok: string) {
    const r = await adminApi(`/api/admin/comptes/${id}`, "PATCH", body);
    setMsg(r.ok ? { tone: "success", text: ok } : { tone: "error", text: r.message });
    if (r.ok) router.refresh();
  }

  return (
    <div className="stack">
      {msg ? <FormMessage tone={msg.tone}>{msg.text}</FormMessage> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption className="visually-hidden">Comptes de l&apos;administration</caption>
          <thead>
            <tr><th scope="col">Nom</th><th scope="col">E-mail</th><th scope="col">Rôle</th><th scope="col">État</th><th scope="col">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === meId ? " (vous)" : ""}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    aria-label={`Rôle de ${u.name}`}
                    value={u.role}
                    onChange={(e) => patch(u.id, { role: e.target.value }, "Rôle modifié.")}
                  >
                    {(Object.keys(roleLabels) as Role[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                </td>
                <td>{u.active ? <span className="badge">Actif</span> : <span className="badge badge-red">Désactivé</span>}</td>
                <td className="row-wrap">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      if (u.active && !window.confirm(`Désactiver le compte de ${u.name} ? Cette personne sera déconnectée.`)) return;
                      patch(u.id, { active: !u.active }, u.active ? "Compte désactivé." : "Compte réactivé.");
                    }}
                  >
                    {u.active ? "Désactiver" : "Réactiver"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const pwd = window.prompt(`Nouveau mot de passe provisoire pour ${u.name} (12 caractères minimum) :`);
                      if (pwd) patch(u.id, { password: pwd }, "Mot de passe provisoire enregistré. Transmettez-le à la personne par un moyen sûr.");
                    }}
                  >
                    Nouveau mot de passe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="form card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErrors({});
          const r = await adminApi("/api/admin/comptes", "POST", v);
          setBusy(false);
          if (r.ok) {
            setV({ name: "", email: "", role: "editeur", password: "" });
            setMsg({ tone: "success", text: "Compte créé. Transmettez le mot de passe provisoire par un moyen sûr et demandez à la personne de le changer dans « Mon compte »." });
            router.refresh();
          } else {
            setErrors(r.errors ?? {});
            setMsg({ tone: "error", text: r.message });
          }
        }}
      >
        <h2 style={{ fontSize: "1.25rem" }}>Ajouter un compte</h2>
        <div className="form-row">
          <TextField label="Nom" name="name" value={v.name} onChange={set("name")} error={errors.name} />
          <TextField label="Adresse e-mail" name="email" type="email" value={v.email} onChange={set("email")} error={errors.email} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor={roleId}>Rôle</label>
            <select id={roleId} value={v.role} onChange={(e) => set("role")(e.target.value)}>
              <option value="editeur">Éditeur : prépare les fiches, sans pouvoir publier</option>
              <option value="admin">Administrateur : publie, archive, gère les comptes</option>
            </select>
          </div>
          <TextField label="Mot de passe provisoire" name="password" type="text" value={v.password} onChange={set("password")} error={errors.password} hint="12 caractères minimum." autoComplete="off" />
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? "Création…" : "Créer le compte"}</button>
      </form>
    </div>
  );
}
