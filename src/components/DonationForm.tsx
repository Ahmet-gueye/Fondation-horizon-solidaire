"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { AllocationOption } from "@/config/allocations";
import { donationConfig } from "@/config/donations";
import { formatFCFA } from "@/lib/format";
import { Icon } from "./Icon";

type Mode = "simulation" | "test" | "prod";
type Errors = Record<string, string>;

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function DonationForm({ options, initialAllocation, mode }: { options: AllocationOption[]; initialAllocation: string; mode: Mode }) {
  const cfg = donationConfig;
  const uid = useId();
  const [preset, setPreset] = useState<string>(String(cfg.defaultAmount));
  const [custom, setCustom] = useState("");
  const [allocation, setAllocation] = useState(initialAllocation);
  const [frequency, setFrequency] = useState<"ponctuel" | "mensuel">("ponctuel");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // pot de miel
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const keyRef = useRef<string>("");
  const startedAt = useRef<number>(0);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    keyRef.current = newKey();
    startedAt.current = Date.now();
  }, []);

  const amount = useMemo(() => {
    if (preset === "autre") {
      const n = Number(custom.replace(/[\s .]/g, ""));
      return Number.isFinite(n) ? n : NaN;
    }
    return Number(preset);
  }, [preset, custom]);

  const amountValid = Number.isInteger(amount) && amount >= cfg.minAmount && amount <= cfg.maxAmount;
  const allocationText = options.find((o) => o.value === allocation)?.label ?? options[0].label;

  function validate(): Errors {
    const e: Errors = {};
    if (!amountValid) e.amount = `Choisissez un montant entre ${formatFCFA(cfg.minAmount)} et ${formatFCFA(cfg.maxAmount)}.`;
    if (!anonymous) {
      if (name.trim().length < 2) e.name = "Indiquez votre nom.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Indiquez une adresse e-mail valide.";
    } else if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      e.email = "L'adresse e-mail n'est pas valide.";
    }
    if (cfg.askPhone && !/^\+?[0-9 ().-]{8,20}$/.test(phone.trim())) e.phone = "Indiquez un numéro de téléphone valide.";
    if (!consent) e.consent = "Merci d'accepter les conditions de don et la politique de confidentialité.";
    return e;
  }

  function focusFirstError(e: Errors) {
    const first = Object.keys(e)[0];
    const map: Record<string, string> = { amount: preset === "autre" ? `${uid}-custom` : `${uid}-a0`, name: `${uid}-name`, email: `${uid}-email`, phone: `${uid}-phone`, consent: `${uid}-consent`, allocation: `${uid}-alloc` };
    const el = first ? document.getElementById(map[first] ?? "") : null;
    if (el) el.focus();
    else errorRef.current?.focus();
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError(e);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          allocation,
          frequency,
          anonymous,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          consent,
          idempotencyKey: keyRef.current,
          website,
          startedAt: startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; redirectUrl?: string; message?: string; errors?: Errors } | null;
      if (res.ok && data?.ok && data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return; // on garde l'état « chargement » pendant la redirection
      }
      keyRef.current = newKey(); // nouvelle tentative = nouvelle clé
      if (data?.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
      }
      setFormError(data?.message ?? "Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      keyRef.current = newKey();
      setFormError("Connexion impossible. Vérifiez votre connexion Internet puis réessayez. Aucun montant n'a été débité.");
      setLoading(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  const err = (k: string) => (errors[k] ? <p className="field-error" id={`${uid}-${k}-err`}>{errors[k]}</p> : null);
  const described = (k: string, hint?: string) => [hint, errors[k] ? `${uid}-${k}-err` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="donate-layout">
      <form className="form card" onSubmit={onSubmit} noValidate aria-describedby={formError ? `${uid}-formerr` : undefined}>
        <div ref={errorRef} tabIndex={-1} aria-live="assertive">
          {formError ? (
            <div className="notice notice-error" id={`${uid}-formerr`} role="alert">
              <Icon name="alert" />
              <p className="mb-0">{formError}</p>
            </div>
          ) : null}
        </div>

        <fieldset className="field">
          <legend>1. Montant de votre don <span className="req" aria-hidden="true">*</span></legend>
          <div className="amounts mt-2">
            {cfg.suggestedAmounts.map((a, i) => (
              <label key={a} className="amount-option">
                <input type="radio" name="amount" id={`${uid}-a${i}`} value={a} checked={preset === String(a)} onChange={() => setPreset(String(a))} />
                <span>{formatFCFA(a)}</span>
              </label>
            ))}
            <label className="amount-option">
              <input type="radio" name="amount" value="autre" checked={preset === "autre"} onChange={() => setPreset("autre")} />
              <span>Autre montant</span>
            </label>
          </div>
          {preset === "autre" ? (
            <div className="field mt-2">
              <label htmlFor={`${uid}-custom`}>Montant libre (FCFA)</label>
              <input
                id={`${uid}-custom`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Ex. 15 000"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d\s]/g, ""))}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={described("amount", `${uid}-custom-hint`)}
              />
              <p className="hint" id={`${uid}-custom-hint`}>Entre {formatFCFA(cfg.minAmount)} et {formatFCFA(cfg.maxAmount)}.</p>
            </div>
          ) : null}
          {err("amount")}
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-alloc`}>2. Affectation de votre don</label>
          <select id={`${uid}-alloc`} value={allocation} onChange={(e) => setAllocation(e.target.value)} aria-describedby={described("allocation", `${uid}-alloc-hint`)}>
            <optgroup label="Sans affectation">
              {options.filter((o) => o.group === "general").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </optgroup>
            <optgroup label="Programmes">
              {options.filter((o) => o.group === "programme").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </optgroup>
            {options.some((o) => o.group === "projet") ? (
              <optgroup label="Projets ouverts aux dons">
                {options.filter((o) => o.group === "projet").map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </optgroup>
            ) : null}
          </select>
          <p className="hint" id={`${uid}-alloc-hint`}>Un don général permet d&apos;agir là où le besoin est le plus urgent.</p>
          {err("allocation")}
        </div>

        <fieldset className="field">
          <legend>3. Fréquence</legend>
          <div className="segmented mt-2">
            <label className="amount-option">
              <input type="radio" name="frequency" value="ponctuel" checked={frequency === "ponctuel"} onChange={() => setFrequency("ponctuel")} />
              <span>Don ponctuel</span>
            </label>
            <label className="amount-option">
              <input type="radio" name="frequency" value="mensuel" checked={frequency === "mensuel"} onChange={() => setFrequency("mensuel")} disabled={!cfg.recurringEnabled} aria-describedby={`${uid}-freq-hint`} />
              <span>Don mensuel</span>
            </label>
          </div>
          {!cfg.recurringEnabled ? <p className="hint" id={`${uid}-freq-hint`}>Le don mensuel n&apos;est pas encore disponible en ligne.</p> : null}
          {err("frequency")}
        </fieldset>

        <fieldset className="field">
          <legend>4. Vos coordonnées</legend>
          {cfg.allowAnonymous ? (
            <label className="check mt-2">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              <span>Je souhaite faire un don anonyme (nom et e-mail facultatifs).</span>
            </label>
          ) : null}
          <div className="form-row mt-2">
            <div className="field">
              <label htmlFor={`${uid}-name`}>Nom et prénom {!anonymous ? <span className="req" aria-hidden="true">*</span> : <span className="muted">(facultatif)</span>}</label>
              <input id={`${uid}-name`} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required={!anonymous} aria-invalid={Boolean(errors.name)} aria-describedby={described("name")} />
              {err("name")}
            </div>
            <div className="field">
              <label htmlFor={`${uid}-email`}>Adresse e-mail {!anonymous ? <span className="req" aria-hidden="true">*</span> : <span className="muted">(facultatif)</span>}</label>
              <input id={`${uid}-email`} type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required={!anonymous} aria-invalid={Boolean(errors.email)} aria-describedby={described("email")} />
              {err("email")}
            </div>
          </div>
          {cfg.askPhone ? (
            <div className="field mt-2">
              <label htmlFor={`${uid}-phone`}>Téléphone <span className="req" aria-hidden="true">*</span></label>
              <input id={`${uid}-phone`} type="tel" autoComplete="tel" inputMode="tel" placeholder="+221 …" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={described("phone")} />
              {err("phone")}
            </div>
          ) : (
            <p className="hint mt-2">Votre numéro de téléphone ou vos informations de paiement vous seront demandés uniquement sur la page sécurisée de PayTech.</p>
          )}
        </fieldset>

        <div className="hp" aria-hidden="true">
          <label htmlFor={`${uid}-website`}>Ne pas remplir ce champ</label>
          <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <div className="field">
          <label className="check">
            <input id={`${uid}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={described("consent")} />
            <span>
              J&apos;accepte les <Link href="/conditions-de-don" target="_blank">conditions de don</Link> et la{" "}
              <Link href="/confidentialite" target="_blank">politique de confidentialité</Link>. <span className="req" aria-hidden="true">*</span>
              <span className="visually-hidden"> (les liens s&apos;ouvrent dans un nouvel onglet)</span>
            </span>
          </label>
          {err("consent")}
        </div>

        <button type="submit" className="btn btn-sun btn-block" disabled={loading} aria-busy={loading}>
          {loading ? (<><span className="spinner" style={{ borderColor: "rgba(8,49,31,.25)", borderTopColor: "#08311f" }} aria-hidden="true" />Préparation du paiement…</>) : (<><Icon name="lock" />{mode === "simulation" ? "Continuer (simulation)" : `Donner ${amountValid ? formatFCFA(amount) : ""}`}</>)}
        </button>
        <p className="hint center mb-0">
          {mode === "simulation"
            ? "Mode simulation : aucun paiement réel ne sera effectué."
            : "Vous allez être redirigé vers la page de paiement sécurisée de PayTech."}
        </p>
      </form>

      <aside className="donate-aside stack" aria-label="Résumé du don">
        <div className="summary" aria-live="polite">
          <h2 style={{ fontSize: "1.25rem" }}>Résumé de votre don</h2>
          <dl>
            <div><dt>Affectation</dt><dd>{allocationText.replace(/ : là où.*$/, "")}</dd></div>
            <div><dt>Fréquence</dt><dd>{frequency === "ponctuel" ? "Ponctuel" : "Mensuel"}</dd></div>
            <div><dt>Donateur</dt><dd>{anonymous ? "Anonyme" : name.trim() || "—"}</dd></div>
            <div className="total"><dt>Montant</dt><dd>{amountValid ? formatFCFA(amount) : "—"}</dd></div>
          </dl>
          <p className="small muted mb-0"><strong>Frais :</strong> {cfg.feesNotice}</p>
        </div>
        <ul className="trust-list">
          <li><Icon name="lock" /><span>Paiement réalisé sur la page sécurisée de PayTech. Le site ne voit ni ne conserve vos données de carte ou vos codes de paiement mobile.</span></li>
          <li><Icon name="shield" /><span>Votre don n&apos;est confirmé qu&apos;après validation directe de PayTech à notre serveur.</span></li>
          <li><Icon name="doc" /><span>L&apos;utilisation des dons est expliquée sur la page <Link href="/transparence">Transparence</Link>.</span></li>
        </ul>
        {cfg.confirmedPaymentMethods.length > 0 ? (
          <p className="small muted">Moyens de paiement acceptés : {cfg.confirmedPaymentMethods.join(", ")}.</p>
        ) : null}
      </aside>
    </div>
  );
}
