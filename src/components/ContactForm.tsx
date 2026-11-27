"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { makeT, type Locale } from "@/i18n";
import { Icon } from "./Icon";

const TYPES = {
  general: ["Demande générale", "General enquiry"],
  benevolat: ["Bénévolat", "Volunteering"],
  partenariat: ["Partenariat", "Partnership"],
  projet: ["Soutenir la fondation ou un projet", "Support the foundation or a project"],
} as const;
type ContactType = keyof typeof TYPES;
type Errors = Record<string, string>;

export function ContactForm({ initialType = "general", lockType = false, title, initialMessage = "", locale = "fr" }: { initialType?: ContactType; lockType?: boolean; title?: string; initialMessage?: string; locale?: Locale }) {
  const t = makeT(locale);
  const en = locale === "en";
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
    if (values.name.trim().length < 2) e.name = t("Indiquez votre nom.", "Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) e.email = t("Indiquez une adresse e-mail valide.", "Please enter a valid email address.");
    if (values.phone.trim() && !/^\+?[0-9 ().-]{8,20}$/.test(values.phone.trim())) e.phone = t("Le numéro de téléphone n'est pas valide.", "The phone number is not valid.");
    if (type === "partenariat" && values.organisation.trim().length < 2) e.organisation = t("Indiquez le nom de votre organisation.", "Please enter the name of your organisation.");
    if (values.message.trim().length < 10) e.message = t("Votre message doit contenir au moins 10 caractères.", "Your message must be at least 10 characters long.");
    if (!consent) e.consent = t("Merci d'accepter le traitement de vos données pour que nous puissions vous répondre.", "Please accept the processing of your data so that we can reply to you.");
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
        // Le serveur répond en français : en anglais, on affiche un message générique.
        if (data?.errors && !en) setErrors(data.errors);
        setState("error");
        setMessage(
          en
            ? res.status === 429
              ? "You have sent several messages in a short time. Please try again a little later."
              : "Sending failed. Please check the form and try again."
            : (data?.message ?? "L'envoi a échoué. Merci de réessayer."),
        );
      }
    } catch {
      setState("error");
      setMessage(t("Connexion impossible. Vérifiez votre connexion Internet puis réessayez.", "Could not connect. Check your Internet connection and try again."));
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
            <p><strong>{t("Merci, votre message a bien été envoyé.", "Thank you, your message has been sent.")}</strong></p>
            <p>{t("L'équipe de la fondation vous répondra dans les meilleurs délais à l'adresse indiquée.", "The foundation's team will reply as soon as possible to the address you gave.")}</p>
          </div>
        </div>
        <button type="button" className="btn btn-outline mt-2" onClick={() => { setState("idle"); startedAt.current = Date.now(); }}>{t("Envoyer un autre message", "Send another message")}</button>
      </div>
    );
  }

  return (
    <form className="form card" onSubmit={onSubmit} noValidate aria-label={title ?? t("Formulaire de contact", "Contact form")}>
      <div ref={statusRef} tabIndex={-1} aria-live="assertive">
        {state === "error" && message ? (
          <div className="notice notice-error" role="alert"><Icon name="alert" /><p className="mb-0">{message}</p></div>
        ) : null}
      </div>

      {!lockType ? (
        <fieldset className="field">
          <legend>{t("Objet de votre message", "Subject of your message")} <span className="req" aria-hidden="true">*</span></legend>
          <div className="amounts mt-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {(Object.keys(TYPES) as ContactType[]).map((k) => (
              <label key={k} className="amount-option">
                <input type="radio" name={`${uid}-type`} value={k} checked={type === k} onChange={() => setType(k)} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "1rem" }}>{TYPES[k][en ? 1 : 0]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-name`}>{t("Nom et prénom", "Full name")} <span className="req" aria-hidden="true">*</span></label>
          <input id={`${uid}-name`} type="text" autoComplete="name" value={values.name} onChange={set("name")} required aria-invalid={Boolean(errors.name)} aria-describedby={desc("name")} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`}>{t("Adresse e-mail", "Email address")} <span className="req" aria-hidden="true">*</span></label>
          <input id={`${uid}-email`} type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} required aria-invalid={Boolean(errors.email)} aria-describedby={desc("email")} />
          {err("email")}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-phone`}>{t("Téléphone", "Phone")} <span className="muted">{t("(facultatif)", "(optional)")}</span></label>
          <input id={`${uid}-phone`} type="tel" inputMode="tel" autoComplete="tel" placeholder="+221 …" value={values.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={desc("phone")} />
          {err("phone")}
        </div>
        {type === "partenariat" || type === "projet" ? (
          <div className="field">
            <label htmlFor={`${uid}-organisation`}>{t("Organisation", "Organisation")} {type === "partenariat" ? <span className="req" aria-hidden="true">*</span> : <span className="muted">{t("(facultatif)", "(optional)")}</span>}</label>
            <input id={`${uid}-organisation`} type="text" autoComplete="organization" value={values.organisation} onChange={set("organisation")} aria-invalid={Boolean(errors.organisation)} aria-describedby={desc("organisation")} />
            {err("organisation")}
          </div>
        ) : type === "benevolat" ? (
          <div className="field">
            <label htmlFor={`${uid}-availability`}>{t("Disponibilités et compétences", "Availability and skills")} <span className="muted">{t("(facultatif)", "(optional)")}</span></label>
            <input id={`${uid}-availability`} type="text" placeholder={t("Ex. week-ends, logistique", "E.g. weekends, logistics")} value={values.availability} onChange={set("availability")} />
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={`${uid}-message`}>{t("Votre message", "Your message")} <span className="req" aria-hidden="true">*</span></label>
        <textarea id={`${uid}-message`} value={values.message} onChange={set("message")} required aria-invalid={Boolean(errors.message)} aria-describedby={desc("message")} maxLength={4000} />
        {err("message")}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>{t("Ne pas remplir ce champ", "Leave this field empty")}</label>
        <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="field">
        <label className="check">
          <input id={`${uid}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={desc("consent")} />
          <span>{t("J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la", "I agree that my data may be used to handle my request, in line with the")} <Link href="/confidentialite">{t("politique de confidentialité", "privacy policy")}</Link>. <span className="req" aria-hidden="true">*</span></span>
        </label>
        {err("consent")}
      </div>

      <button type="submit" className="btn" disabled={state === "sending"} aria-busy={state === "sending"}>
        {state === "sending" ? (<><span className="spinner" aria-hidden="true" />{t("Envoi en cours…", "Sending…")}</>) : (<><Icon name="mail" />{t("Envoyer le message", "Send message")}</>)}
      </button>
      <p className="hint mb-0"><span className="req" aria-hidden="true">*</span> {t("Champs obligatoires.", "Required fields.")}</p>
    </form>
  );
}
