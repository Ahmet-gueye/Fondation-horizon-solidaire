"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { CurrencyCode } from "@/config/donations";
import { makeT, type Locale } from "@/i18n";
import { Icon } from "./Icon";

type Currency = { code: CurrencyCode; label: string; min: number; max: number };
type Errors = Record<string, string>;

/**
 * Formulaire de don. Il ne demande JAMAIS de numéro de carte ni de code Mobile Money :
 * il crée le don côté serveur puis envoie le visiteur sur la page sécurisée de PayTech.
 */
export function DonationForm({
  locale,
  currencies,
  suggested,
  programmes,
  initialProgramme = "",
  campagne = null,
}: {
  locale: Locale;
  currencies: Currency[];
  suggested: Record<CurrencyCode, number[]>;
  programmes: { slug: string; title: string }[];
  initialProgramme?: string;
  campagne?: { slug: string; title: string } | null;
}) {
  const t = makeT(locale);
  const uid = useId();
  const [currency, setCurrency] = useState<CurrencyCode>("XOF");
  const [preset, setPreset] = useState<number | null>(5000);
  const [custom, setCustom] = useState("");
  const [programme, setProgramme] = useState(initialProgramme);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const startedAt = useRef(0);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const cur = currencies.find((c) => c.code === currency) ?? currencies[0];
  const amount = custom.trim() ? Number(custom.replace(/\s/g, "").replace(",", ".")) : preset;
  const nf = new Intl.NumberFormat(locale === "en" ? "en-GB" : "fr-FR");
  const fmt = (n: number) => `${nf.format(n)} ${currency === "XOF" ? "FCFA" : currency}`;

  function changeCurrency(code: CurrencyCode) {
    setCurrency(code);
    const list = suggested[code] ?? [];
    setPreset(list[1] ?? list[0] ?? null);
    setCustom("");
  }

  function validate(): Errors {
    const e: Errors = {};
    if (amount === null || !Number.isFinite(amount) || !Number.isInteger(amount)) e.amount = t("Indiquez un montant entier, sans centimes.", "Enter a whole amount, without decimals.");
    else if (amount < cur.min || amount > cur.max) e.amount = t(`Le montant doit être compris entre ${fmt(cur.min)} et ${fmt(cur.max)}.`, `The amount must be between ${fmt(cur.min)} and ${fmt(cur.max)}.`);
    if (donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(donorEmail.trim())) e.donorEmail = t("Cette adresse e-mail n'est pas valide.", "This email address is not valid.");
    if (!terms) e.terms = t("Merci d'accepter les conditions de don.", "Please accept the donation terms.");
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
      const res = await fetch("/api/dons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, programme, campagne: campagne?.slug ?? "", donorName, donorEmail, terms, locale, website, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; redirectUrl?: string; message?: string; errors?: Errors } | null;
      if (res.ok && data?.ok && data.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      if (data?.errors) setErrors(data.errors);
      setState("error");
      setMessage(data?.message ?? t("Le paiement n'a pas pu démarrer. Merci de réessayer.", "The payment could not start. Please try again."));
    } catch {
      setState("error");
      setMessage(t("Connexion impossible. Vérifiez votre connexion Internet puis réessayez.", "Could not connect. Check your Internet connection and try again."));
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  const err = (k: string) => (errors[k] ? <p className="field-error" id={`${uid}-${k}-err`}>{errors[k]}</p> : null);
  const desc = (k: string) => (errors[k] ? `${uid}-${k}-err` : undefined);

  return (
    <form className="form card" onSubmit={onSubmit} noValidate aria-label={t("Formulaire de don", "Donation form")}>
      <div ref={statusRef} tabIndex={-1} aria-live="assertive">
        {state === "error" && message ? (
          <div className="notice notice-error" role="alert"><Icon name="alert" /><p className="mb-0">{message}</p></div>
        ) : null}
      </div>

      {campagne ? (
        <p className="notice notice-info mb-0"><Icon name="heart" /><span>{t("Vous soutenez :", "You are supporting:")} <strong>{campagne.title}</strong></span></p>
      ) : null}

      <div className="field">
        <label htmlFor={`${uid}-currency`}>{t("Devise", "Currency")}</label>
        <select id={`${uid}-currency`} value={currency} onChange={(e) => changeCurrency(e.target.value as CurrencyCode)}>
          {currencies.map((c) => <option key={c.code} value={c.code}>{c.label} ({c.code})</option>)}
        </select>
      </div>

      <fieldset className="field">
        <legend>{t("Montant de votre don", "Amount of your donation")} <span className="req" aria-hidden="true">*</span></legend>
        <div className="amounts mt-2">
          {(suggested[currency] ?? []).map((v) => (
            <label key={v} className="amount-option">
              <input type="radio" name={`${uid}-preset`} checked={!custom.trim() && preset === v} onChange={() => { setPreset(v); setCustom(""); }} />
              <span>{fmt(v)}</span>
            </label>
          ))}
        </div>
        <label htmlFor={`${uid}-amount`} className="mt-2" style={{ display: "block" }}>{t("Autre montant", "Other amount")} ({currency === "XOF" ? "FCFA" : currency})</label>
        <input id={`${uid}-amount`} type="text" inputMode="numeric" autoComplete="off" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={`${t("Ex.", "E.g.")} ${nf.format(currency === "XOF" ? 15000 : 30)}`} aria-invalid={Boolean(errors.amount)} aria-describedby={desc("amount")} />
        {err("amount")}
      </fieldset>

      {!campagne ? (
        <div className="field">
          <label htmlFor={`${uid}-programme`}>{t("Affecter mon don à", "Allocate my donation to")}</label>
          <select id={`${uid}-programme`} value={programme} onChange={(e) => setProgramme(e.target.value)} aria-invalid={Boolean(errors.programme)} aria-describedby={desc("programme")}>
            <option value="">{t("Là où c'est le plus utile", "Where it is most needed")}</option>
            {programmes.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
          {err("programme")}
        </div>
      ) : null}

      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-donorName`}>{t("Votre nom", "Your name")} <span className="muted">{t("(facultatif)", "(optional)")}</span></label>
          <input id={`${uid}-donorName`} type="text" autoComplete="name" value={donorName} onChange={(e) => setDonorName(e.target.value)} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-donorEmail`}>{t("Votre e-mail", "Your email")} <span className="muted">{t("(facultatif)", "(optional)")}</span></label>
          <input id={`${uid}-donorEmail`} type="email" inputMode="email" autoComplete="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} maxLength={160} aria-invalid={Boolean(errors.donorEmail)} aria-describedby={desc("donorEmail")} />
          {err("donorEmail")}
        </div>
      </div>
      <p className="hint mt-0">{t("Utiles seulement si vous souhaitez que la fondation puisse vous remercier ou vous répondre.", "Only useful if you would like the foundation to be able to thank you or reply to you.")}</p>

      <div className="hp" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>{t("Ne pas remplir ce champ", "Leave this field empty")}</label>
        <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div className="field">
        <label className="check">
          <input id={`${uid}-terms`} type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} aria-invalid={Boolean(errors.terms)} aria-describedby={desc("terms")} />
          <span>
            {t("J'ai lu les", "I have read the")} <Link href="/conditions-de-don" target="_blank">{t("conditions de don", "donation terms")}</Link> {t("et la", "and the")}{" "}
            <Link href="/confidentialite" target="_blank">{t("politique de confidentialité", "privacy policy")}</Link>. <span className="req" aria-hidden="true">*</span>
          </span>
        </label>
        {err("terms")}
      </div>

      <button type="submit" className="btn btn-sun btn-block" disabled={state === "sending"} aria-busy={state === "sending"}>
        {state === "sending" ? (
          <><span className="spinner" aria-hidden="true" />{t("Ouverture du paiement sécurisé…", "Opening secure payment…")}</>
        ) : (
          <><Icon name="lock" />{amount && Number.isFinite(amount) ? t(`Donner ${fmt(amount)}`, `Give ${fmt(amount)}`) : t("Donner", "Give")}</>
        )}
      </button>
      <p className="hint mb-0">
        <Icon name="shield" />{" "}
        {t(
          "Vous allez être redirigé vers la page de paiement sécurisée de PayTech. Le site de la fondation ne voit jamais vos données de carte ou de Mobile Money.",
          "You will be redirected to PayTech's secure payment page. The foundation's website never sees your card or Mobile Money details.",
        )}
      </p>
    </form>
  );
}
