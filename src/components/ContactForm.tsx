"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

const TYPES = {
  general: "Demande générale",
  benevolat: "Bénévolat",
  partenariat: "Partenariat",
  projet: "Soutenir la fondation ou un projet",
} as const;
type ContactType = keyof typeof TYPES;
type Errors = Record<string, string>;

export function ContactForm({ initialType = "general", lockType = false, title, initialMessage = "" }: { initialType?: ContactType; lockType?: boolean; title?: string; initialMessage?: string }) {
  const uid = useId();
  const [type, setType] = useState<ContactType>(initialType);
  const [values, setValues] = useState({ name: "", email: "", phone: "", organisation: "", availability: "", message: initialMessage });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const startedAt = useRef(0);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = "Indiquez une adresse e-mail valide.";
    if (values.phone.trim() && !/^\+?[0-9 ().-]{8,20}$/.test(values.phone.trim())) e.phone = "Le numéro de téléphone n'est pas valide.";
    if (type === "partenariat" && values.organisation.trim().length < 2) e.organisation = "Indiquez le nom de votre organisation.";
    if (values.message.trim().length < 10) e.message = "Votre message doit contenir au moins 10 caractères.";
    if (!consent) e.consent = "Merci d'accepter le traitement de vos données pour que nous puissions vous répondre.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (state === "sending") return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`${uid}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...values, consent, website, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; errors?: Errors } | null;
      if (res.ok && data?.ok) {
        setState("success");
        setValues({ name: "", email: "", phone: "", organisation: "", availability: "", message: "" });
        setConsent(false);
      } else {
        if (data?.errors) setErrors(data.errors);
        setState("error");
        setMessage(data?.message ?? "L'envoi a échoué. Merci de réessayer.");
      }
    } catch {
      setState("error");
      setMessage("Connexion impossible. Vérifiez votre connexion Internet puis réessayez.");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const err = (k: string) => (errors[k] ? <p className="field-error" id={`${uid}-${k}-err`}>{errors[k]}</p> : null);
  const desc = (k: string) => (errors[k] ? `${uid}-${k}-err` : undefined);

  if (state === "success") {
    return (
      <div className="card" ref={statusRef} tabIndex={-1} role="status">
        <div className="notice notice-success">
          <Icon name="check" />
          <div>
            <p><strong>Merci, votre message a bien été envoyé.</strong></p>
            <p>L&apos;équipe de la fondation vous répondra dans les meilleurs délais à l&apos;adresse indiquée.</p>
          </div>
        </div>
        <button type="button" className="btn btn-outline mt-2" onClick={() => { setState("idle"); startedAt.current = Date.now(); }}>Envoyer un autre message</button>
      </div>
    );
  }

  return (
    <form className="form card" onSubmit={onSubmit} noValidate aria-label={title ?? "Formulaire de contact"}>
      <div ref={statusRef} tabIndex={-1} aria-live="assertive">
        {state === "error" && message ? (
          <div className="notice notice-error" role="alert"><Icon name="alert" /><p className="mb-0">{message}</p></div>
        ) : null}
      </div>

      {!lockType ? (
        <fieldset className="field">
          <legend>Objet de votre message <span className="req" aria-hidden="true">*</span></legend>
          <div className="amounts mt-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {(Object.keys(TYPES) as ContactType[]).map((k) => (
              <label key={k} className="amount-option">
                <input type="radio" name={`${uid}-type`} value={k} checked={type === k} onChange={() => setType(k)} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}>{TYPES[k]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-name`}>Nom et prénom <span className="req" aria-hidden="true">*</span></label>
          <input id={`${uid}-name`} type="text" autoComplete="name" value={values.name} onChange={set("name")} required aria-invalid={Boolean(errors.name)} aria-describedby={desc("name")} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`}>Adresse e-mail <span className="req" aria-hidden="true">*</span></label>
          <input id={`${uid}-email`} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} required aria-invalid={Boolean(errors.email)} aria-describedby={desc("email")} />
          {err("email")}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-phone`}>Téléphone <span className="muted">(facultatif)</span></label>
          <input id={`${uid}-phone`} type="tel" inputMode="tel" autoComplete="tel" placeholder="+221 …" value={values.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={desc("phone")} />
          {err("phone")}
        </div>
        {type === "partenariat" || type === "projet" ? (
          <div className="field">
            <label htmlFor={`${uid}-organisation`}>Organisation {type === "partenariat" ? <span className="req" aria-hidden="true">*</span> : <span className="muted">(facultatif)</span>}</label>
            <input id={`${uid}-organisation`} type="text" autoComplete="organization" value={values.organisation} onChange={set("organisation")} aria-invalid={Boolean(errors.organisation)} aria-describedby={desc("organisation")} />
            {err("organisation")}
          </div>
        ) : type === "benevolat" ? (
          <div className="field">
            <label htmlFor={`${uid}-availability`}>Disponibilités et compétences <span className="muted">(facultatif)</span></label>
            <input id={`${uid}-availability`} type="text" placeholder="Ex. week-ends, logistique" value={values.availability} onChange={set("availability")} />
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={`${uid}-message`}>Votre message <span className="req" aria-hidden="true">*</span></label>
        <textarea id={`${uid}-message`} value={values.message} onChange={set("message")} required aria-invalid={Boolean(errors.message)} aria-describedby={desc("message")} maxLength={4000} />
        {err("message")}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Ne pas remplir ce champ</label>
        <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="field">
        <label className="check">
          <input id={`${uid}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={desc("consent")} />
          <span>J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la <Link href="/confidentialite">politique de confidentialité</Link>. <span className="req" aria-hidden="true">*</span></span>
        </label>
        {err("consent")}
      </div>

      <button type="submit" className="btn" disabled={state === "sending"} aria-busy={state === "sending"}>
        {state === "sending" ? (<><span className="spinner" aria-hidden="true" />Envoi en cours…</>) : (<><Icon name="mail" />Envoyer le message</>)}
      </button>
      <p className="hint mb-0"><span className="req" aria-hidden="true">*</span> Champs obligatoires.</p>
    </form>
  );
}
