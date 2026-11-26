"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LIMITS,
  ctaKinds,
  editableStatuses,
  emptyFicheInput,
  ficheStatuses,
  ficheTypes,
  imageRights,
  senegalRegions,
  type CtaKind,
  type FicheInput,
  type FicheStatus,
  type FicheType,
  type ImageRights,
  type Schedule,
} from "@/lib/fiches/model";
import { adminApi, uploadFile } from "./api";
import { FormMessage } from "./AdminForms";
import { checkPdf, prepareImage } from "./imageTools";

/* ---------- Types d'état local ---------- */

type ImageItem = {
  key: string;
  mediaId: string | null;
  pending: Blob | null;
  previewUrl: string;
  alt: string;
  caption: string;
  rights: ImageRights | "";
  warning: string | null;
};
type DocItem = { key: string; mediaId: string | null; pending: File | null; name: string; title: string };

type Perms = { canValidateBudget: boolean; canPublish: boolean; canArchive: boolean; canDelete: boolean };
type ExistingState = { id: string; version: number; status: FicheStatus; publishedAt: string | null; firstPublishedAt: string | null; slug: string; editable: boolean; lockReason: string | null };

let counter = 0;
const newKey = () => `k${Date.now().toString(36)}${(counter++).toString(36)}`;

function toImageItem(ref: FicheInput["mainImage"]): ImageItem | null {
  if (!ref) return null;
  return { key: newKey(), mediaId: ref.mediaId, pending: null, previewUrl: `/media/${ref.mediaId}/md`, alt: ref.alt, caption: ref.caption, rights: ref.rights, warning: null };
}

/* ---------- Champs ---------- */

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <p className="field-error" id={id}>{msg}</p> : null;
}

function ImageEditor({
  item,
  onChange,
  onRemove,
  errors,
  prefix,
  disabled,
  label,
}: {
  item: ImageItem;
  onChange: (i: ImageItem) => void;
  onRemove: () => void;
  errors: Record<string, string>;
  prefix: string;
  disabled: boolean;
  label: string;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  return (
    <div className="image-editor">
      <div className="image-editor-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.previewUrl} alt="" />
        <span className={`badge ${item.pending ? "badge-sun" : ""}`}>{item.pending ? "Nouvelle image, pas encore enregistrée" : "Enregistrée avec la fiche"}</span>
      </div>
      <div className="stack">
        {item.warning ? <p className="hint">{item.warning}</p> : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <div className="field">
          <label htmlFor={`${id}-alt`}>Texte alternatif ({label}) <span className="req" aria-hidden="true">*</span></label>
          <p className="hint" id={`${id}-alt-h`}>Ce que montre l&apos;image, pour les personnes aveugles ou malvoyantes. Ex. « Distribution de kits scolaires dans une école de Kaolack ».</p>
          <input id={`${id}-alt`} value={item.alt} maxLength={LIMITS.alt} disabled={disabled} onChange={(e) => onChange({ ...item, alt: e.target.value })} aria-invalid={Boolean(errors[`${prefix}.alt`])} aria-describedby={`${id}-alt-h ${id}-alt-e`} />
          <Err id={`${id}-alt-e`} msg={errors[`${prefix}.alt`]} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-cap`}>Légende <span className="muted">(facultative, affichée sous l&apos;image)</span></label>
          <input id={`${id}-cap`} value={item.caption} maxLength={LIMITS.caption} disabled={disabled} onChange={(e) => onChange({ ...item, caption: e.target.value })} />
        </div>
        <fieldset className="field">
          <legend>Autorisations <span className="req" aria-hidden="true">*</span></legend>
          {(Object.keys(imageRights) as ImageRights[]).map((r) => (
            <label key={r} className="check">
              <input type="radio" name={`${id}-rights`} checked={item.rights === r} disabled={disabled} onChange={() => onChange({ ...item, rights: r })} />
              <span>{imageRights[r]}</span>
            </label>
          ))}
          <p className="hint">Sans accord écrit, ne publiez pas de photo où l&apos;on reconnaît un enfant ou un bénéficiaire.</p>
          <Err id={`${id}-r-e`} msg={errors[`${prefix}.rights`]} />
        </fieldset>
        {!disabled ? (
          <div className="row-wrap">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => replaceRef.current?.click()} disabled={busy}>
              {busy ? "Préparation…" : "Remplacer l'image"}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={onRemove}>Retirer l&apos;image</button>
            <input
              ref={replaceRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                setError(null);
                try {
                  const p = await prepareImage(file);
                  onChange({ ...item, mediaId: null, pending: p.blob, previewUrl: p.previewUrl, warning: p.warning });
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AddImageButton({ onAdd, label, disabled }: { onAdd: (i: ImageItem) => void; label: string; disabled: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (disabled) return null;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div>
        <button type="button" className="btn btn-outline" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? "Préparation de l'image…" : label}
        </button>
      </div>
      <p className="hint">Depuis votre ordinateur ou votre téléphone. JPEG, PNG ou WebP, 400 px de large au minimum. L&apos;image est allégée automatiquement.</p>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            const p = await prepareImage(file);
            onAdd({ key: newKey(), mediaId: null, pending: p.blob, previewUrl: p.previewUrl, alt: "", caption: "", rights: "", warning: p.warning });
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

/* ---------- Formulaire principal ---------- */

export function FicheEditor({
  initial,
  domains,
  perms,
  existing,
}: {
  initial: FicheInput | null;
  domains: { value: string; label: string }[];
  perms: Perms;
  existing: ExistingState | null;
}) {
  const router = useRouter();
  const uid = useId();
  const start = initial ?? emptyFicheInput();
  const disabled = existing ? !existing.editable : false;

  const [f, setF] = useState<Omit<FicheInput, "mainImage" | "gallery" | "documents">>(() => {
    const { mainImage: _m, gallery: _g, documents: _d, ...rest } = start;
    return rest;
  });
  const [mainImage, setMainImage] = useState<ImageItem | null>(() => toImageItem(start.mainImage));
  const [gallery, setGallery] = useState<ImageItem[]>(() => start.gallery.map((g) => toImageItem(g) as ImageItem));
  const [docs, setDocs] = useState<DocItem[]>(() => start.documents.map((d) => ({ key: newKey(), mediaId: d.mediaId, pending: null, name: d.title, title: d.title })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const msgRef = useRef<HTMLDivElement>(null);
  const docInput = useRef<HTMLInputElement>(null);

  const touch = () => setDirty(true);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    touch();
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const show = (tone: "error" | "success" | "info", text: string) => {
    setMsg({ tone, text });
    requestAnimationFrame(() => msgRef.current?.focus());
  };

  const errCount = Object.keys(errors).length;
  const domainId = `${uid}-domain`;

  async function save() {
    setBusy("Enregistrement…");
    setErrors({});
    setMsg(null);
    // 1. Envoi des nouveaux fichiers (ils ne seront visibles qu'une fois la fiche publiée).
    const uploadImage = async (it: ImageItem): Promise<ImageItem | string> => {
      if (!it.pending) return it;
      const r = await uploadFile(it.pending, "image", "image.jpg");
      return r.ok ? { ...it, mediaId: r.media.id, pending: null } : r.message;
    };
    const nextMain = mainImage ? await uploadImage(mainImage) : null;
    if (typeof nextMain === "string") return fail(`Image principale : ${nextMain}`);
    const nextGallery: ImageItem[] = [];
    for (const g of gallery) {
      const r = await uploadImage(g);
      if (typeof r === "string") return fail(`Image supplémentaire : ${r}`);
      nextGallery.push(r);
    }
    const nextDocs: DocItem[] = [];
    for (const d of docs) {
      if (!d.pending) {
        nextDocs.push(d);
        continue;
      }
      const r = await uploadFile(d.pending, "document", "document.pdf");
      if (!r.ok) return fail(`Document « ${d.title || d.name} » : ${r.message}`);
      nextDocs.push({ ...d, mediaId: r.media.id, pending: null });
    }
    setMainImage(nextMain);
    setGallery(nextGallery);
    setDocs(nextDocs);

    // 2. Enregistrement de la fiche.
    const img = (i: ImageItem) => ({ mediaId: i.mediaId, alt: i.alt, caption: i.caption, rights: i.rights });
    const payload = {
      ...f,
      mainImage: nextMain ? img(nextMain) : null,
      gallery: nextGallery.map(img),
      documents: nextDocs.map((d) => ({ mediaId: d.mediaId, title: d.title })),
    };
    const r = existing
      ? await adminApi<{ version: number }>(`/api/admin/fiches/${existing.id}`, "PUT", { version: existing.version, fiche: payload })
      : await adminApi<{ id: string }>("/api/admin/fiches", "POST", payload);
    setBusy(null);
    if (!r.ok) {
      setErrors(r.errors ?? {});
      show("error", r.message);
      return;
    }
    setDirty(false);
    if (!existing && "id" in r) {
      router.replace(`/admin/fiches/${r.id}?enregistre=1`);
    } else {
      show("success", "Modifications enregistrées.");
      router.refresh();
    }
  }

  function fail(text: string) {
    setBusy(null);
    show("error", text);
  }

  async function act(action: "publier" | "depublier" | "archiver" | "desarchiver", confirmText?: string) {
    if (!existing) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy("Patientez…");
    const r = await adminApi(`/api/admin/fiches/${existing.id}`, "POST", { action, version: existing.version });
    setBusy(null);
    if (!r.ok) return show("error", r.message);
    const done = { publier: "Fiche publiée : elle est visible sur le site.", depublier: "Fiche retirée du site.", archiver: "Fiche archivée : elle n'est plus visible sur le site.", desarchiver: "Fiche sortie des archives (en brouillon, non publiée)." };
    show("success", done[action]);
    router.refresh();
  }

  async function remove() {
    if (!existing) return;
    const typed = window.prompt("Suppression définitive (fiche, images et documents). Tapez SUPPRIMER pour confirmer :");
    if (typed !== "SUPPRIMER") return;
    setBusy("Suppression…");
    const r = await adminApi(`/api/admin/fiches/${existing.id}`, "DELETE", { confirm: "SUPPRIMER" });
    setBusy(null);
    if (!r.ok) return show("error", r.message);
    setDirty(false);
    router.replace("/admin?supprime=1");
    router.refresh();
  }

  const schedule = f.schedule;
  const setSchedule = (s: Schedule) => set("schedule", s);
  const typeOptions = useMemo(() => Object.entries(ficheTypes) as [FicheType, string][], []);

  return (
    <div className="fiche-editor">
      <div ref={msgRef} tabIndex={-1} aria-live="polite" className="fiche-editor-msg">
        {msg ? <FormMessage tone={msg.tone}>{msg.text}{msg.tone === "error" && errCount ? ` (${errCount} champ${errCount > 1 ? "s" : ""} à corriger, signalé${errCount > 1 ? "s" : ""} en rouge)` : ""}</FormMessage> : null}
      </div>

      {existing ? (
        <div className="admin-actions card">
          <div>
            <p className="mb-0">
              <strong>État :</strong> {ficheStatuses[existing.status]} ·{" "}
              {existing.publishedAt ? <span className="badge">En ligne</span> : <span className="badge badge-sun">Non publiée</span>}
            </p>
            {existing.lockReason ? <p className="small muted mb-0">{existing.lockReason}</p> : null}
            {dirty ? <p className="small mb-0"><strong>Enregistrez vos modifications avant de publier.</strong></p> : null}
          </div>
          <div className="row-wrap">
            <Link className="btn btn-outline btn-sm" href={`/admin/fiches/${existing.id}/apercu`} target="_blank">Aperçu</Link>
            {existing.publishedAt ? <Link className="btn btn-outline btn-sm" href={`/activites/${existing.slug}`} target="_blank">Voir en ligne</Link> : null}
            {perms.canPublish && existing.status !== "archive" && !existing.publishedAt ? (
              <button type="button" className="btn btn-sm" disabled={dirty || Boolean(busy)} onClick={() => act("publier", "Publier cette fiche ? Elle sera visible par tous les visiteurs, avec ses images et documents.")}>Publier</button>
            ) : null}
            {perms.canPublish && existing.publishedAt ? (
              <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => act("depublier", "Retirer cette fiche du site ? Elle restera enregistrée.")}>Retirer du site</button>
            ) : null}
            {perms.canArchive && existing.status !== "archive" ? (
              <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => act("archiver", "Archiver cette fiche ? Elle disparaîtra du site, des recherches et des compteurs.")}>Archiver</button>
            ) : null}
            {perms.canArchive && existing.status === "archive" ? (
              <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(busy)} onClick={() => act("desarchiver")}>Sortir des archives</button>
            ) : null}
            {perms.canDelete && !existing.firstPublishedAt ? (
              <button type="button" className="btn btn-outline btn-sm btn-danger" disabled={Boolean(busy)} onClick={remove}>Supprimer</button>
            ) : null}
          </div>
        </div>
      ) : null}

      <form
        className="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled) void save();
        }}
      >
        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">1. Contenu</legend>
          <div className="form-row">
            <div className="field">
              <label htmlFor={`${uid}-type`}>Type de contenu <span className="req" aria-hidden="true">*</span></label>
              <select id={`${uid}-type`} value={f.type} onChange={(e) => set("type", e.target.value as FicheType)}>
                {typeOptions.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor={domainId}>Domaine d&apos;action <span className="req" aria-hidden="true">*</span></label>
              <select id={domainId} value={f.domain} onChange={(e) => set("domain", e.target.value)} aria-invalid={Boolean(errors.domain)} aria-describedby={`${domainId}-e`}>
                <option value="">Choisir…</option>
                {domains.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <Err id={`${domainId}-e`} msg={errors.domain} />
            </div>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-title`}>Titre <span className="req" aria-hidden="true">*</span></label>
            <input id={`${uid}-title`} value={f.title} maxLength={LIMITS.title} onChange={(e) => set("title", e.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={`${uid}-title-e`} />
            <Err id={`${uid}-title-e`} msg={errors.title} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-summary`}>Résumé <span className="req" aria-hidden="true">*</span></label>
            <p className="hint" id={`${uid}-summary-h`}>Une ou deux phrases affichées sur les cartes et en haut de la fiche ({LIMITS.summary} caractères maximum).</p>
            <textarea id={`${uid}-summary`} rows={3} value={f.summary} maxLength={LIMITS.summary} onChange={(e) => set("summary", e.target.value)} aria-invalid={Boolean(errors.summary)} aria-describedby={`${uid}-summary-h ${uid}-summary-e`} />
            <Err id={`${uid}-summary-e`} msg={errors.summary} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-desc`}>Description détaillée</label>
            <p className="hint" id={`${uid}-desc-h`}>Activités prévues ou réalisées, publics concernés, partenaires… Laissez une ligne vide entre deux paragraphes. Obligatoire pour publier.</p>
            <textarea id={`${uid}-desc`} rows={10} value={f.description} maxLength={LIMITS.description} onChange={(e) => set("description", e.target.value)} aria-describedby={`${uid}-desc-h`} />
          </div>
        </fieldset>

        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">2. Zone d&apos;intervention</legend>
          <div className="form-row">
            <div className="field">
              <label htmlFor={`${uid}-region`}>Région</label>
              <select id={`${uid}-region`} value={f.zone.region} onChange={(e) => set("zone", { ...f.zone, region: e.target.value })}>
                <option value="">Non précisée</option>
                {senegalRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="Hors Sénégal">Hors Sénégal</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${uid}-dep`}>Département</label>
              <input id={`${uid}-dep`} value={f.zone.departement} maxLength={80} onChange={(e) => set("zone", { ...f.zone, departement: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor={`${uid}-com`}>Commune</label>
              <input id={`${uid}-com`} value={f.zone.commune} maxLength={80} onChange={(e) => set("zone", { ...f.zone, commune: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-loc`}>Localité, quartier ou village</label>
              <input id={`${uid}-loc`} value={f.zone.localite} maxLength={120} onChange={(e) => set("zone", { ...f.zone, localite: e.target.value })} />
            </div>
          </div>
        </fieldset>

        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">3. Dates et calendrier</legend>
          <div className="row-wrap" role="radiogroup" aria-label="Type de dates">
            {([
              ["a_definir", "Dates à définir"],
              ["ponctuel", "Une date (avec heure et durée)"],
              ["periode", "Une période (début et fin)"],
            ] as const).map(([k, label]) => (
              <label key={k} className="check">
                <input
                  type="radio"
                  name={`${uid}-sched`}
                  checked={schedule.kind === k}
                  onChange={() => setSchedule(k === "ponctuel" ? { kind: "ponctuel", date: "", time: "", duration: "" } : k === "periode" ? { kind: "periode", startDate: "", endDate: "" } : { kind: "a_definir" })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {schedule.kind === "ponctuel" ? (
            <div className="form-row form-row-3">
              <div className="field">
                <label htmlFor={`${uid}-date`}>Date <span className="req" aria-hidden="true">*</span></label>
                <input id={`${uid}-date`} type="date" value={schedule.date} onChange={(e) => setSchedule({ ...schedule, date: e.target.value })} aria-invalid={Boolean(errors["schedule.date"])} />
                <Err id={`${uid}-date-e`} msg={errors["schedule.date"]} />
              </div>
              <div className="field">
                <label htmlFor={`${uid}-time`}>Heure <span className="muted">(facultative)</span></label>
                <input id={`${uid}-time`} type="time" value={schedule.time} onChange={(e) => setSchedule({ ...schedule, time: e.target.value })} />
                <Err id={`${uid}-time-e`} msg={errors["schedule.time"]} />
              </div>
              <div className="field">
                <label htmlFor={`${uid}-dur`}>Durée <span className="muted">(ex. 3 heures)</span></label>
                <input id={`${uid}-dur`} value={schedule.duration} maxLength={60} onChange={(e) => setSchedule({ ...schedule, duration: e.target.value })} />
              </div>
            </div>
          ) : null}
          {schedule.kind === "periode" ? (
            <div className="form-row">
              <div className="field">
                <label htmlFor={`${uid}-sd`}>Date de début <span className="req" aria-hidden="true">*</span></label>
                <input id={`${uid}-sd`} type="date" value={schedule.startDate} onChange={(e) => setSchedule({ ...schedule, startDate: e.target.value })} aria-invalid={Boolean(errors["schedule.startDate"])} />
                <Err id={`${uid}-sd-e`} msg={errors["schedule.startDate"]} />
              </div>
              <div className="field">
                <label htmlFor={`${uid}-ed`}>Date de fin <span className="muted">(facultative)</span></label>
                <input id={`${uid}-ed`} type="date" value={schedule.endDate} onChange={(e) => setSchedule({ ...schedule, endDate: e.target.value })} aria-invalid={Boolean(errors["schedule.endDate"])} />
                <Err id={`${uid}-ed-e`} msg={errors["schedule.endDate"]} />
              </div>
            </div>
          ) : null}

          <h3 className="fiche-sub">Calendrier détaillé <span className="muted">(étapes ou rendez-vous, facultatif)</span></h3>
          {f.steps.map((st, i) => (
            <div key={i} className="step-row">
              <div className="form-row form-row-3">
                <div className="field">
                  <label htmlFor={`${uid}-st${i}-t`}>Étape {i + 1} : intitulé</label>
                  <input id={`${uid}-st${i}-t`} value={st.title} maxLength={160} onChange={(e) => set("steps", f.steps.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))} aria-invalid={Boolean(errors[`steps.${i}.title`])} />
                  <Err id={`${uid}-st${i}-te`} msg={errors[`steps.${i}.title`]} />
                </div>
                <div className="field">
                  <label htmlFor={`${uid}-st${i}-d`}>Date</label>
                  <input id={`${uid}-st${i}-d`} type="date" value={st.date} onChange={(e) => set("steps", f.steps.map((s, j) => (j === i ? { ...s, date: e.target.value } : s)))} />
                  <Err id={`${uid}-st${i}-de`} msg={errors[`steps.${i}.date`]} />
                </div>
                <div className="field">
                  <label htmlFor={`${uid}-st${i}-h`}>Heure</label>
                  <input id={`${uid}-st${i}-h`} type="time" value={st.time} onChange={(e) => set("steps", f.steps.map((s, j) => (j === i ? { ...s, time: e.target.value } : s)))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor={`${uid}-st${i}-x`}>Précisions</label>
                <input id={`${uid}-st${i}-x`} value={st.details} maxLength={600} onChange={(e) => set("steps", f.steps.map((s, j) => (j === i ? { ...s, details: e.target.value } : s)))} />
              </div>
              <div className="row-wrap">
                <button type="button" className="btn btn-outline btn-sm" disabled={i === 0} onClick={() => { const a = [...f.steps]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("steps", a); }}>Monter</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => set("steps", f.steps.filter((_, j) => j !== i))}>Retirer l&apos;étape</button>
              </div>
            </div>
          ))}
          {f.steps.length < LIMITS.steps ? (
            <div><button type="button" className="btn btn-outline btn-sm" onClick={() => set("steps", [...f.steps, { date: "", time: "", title: "", details: "" }])}>Ajouter une étape</button></div>
          ) : null}
        </fieldset>

        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">4. Budget <span className="muted">(facultatif, en FCFA)</span></legend>
          <p className="hint">Les montants ne sont affichés sur le site que lorsqu&apos;un administrateur les a vérifiés et cochés « validés ». Toute modification par un éditeur annule la validation.</p>
          <div className="form-row form-row-3">
            {([
              ["planned", "Budget prévisionnel"],
              ["collected", "Montant collecté"],
              ["spent", "Montant dépensé"],
            ] as const).map(([k, label]) => (
              <div className="field" key={k}>
                <label htmlFor={`${uid}-b-${k}`}>{label}</label>
                <input
                  id={`${uid}-b-${k}`}
                  inputMode="numeric"
                  value={f.budget[k] ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "");
                    set("budget", { ...f.budget, [k]: raw === "" ? null : Number(raw), validated: perms.canValidateBudget ? f.budget.validated : false });
                  }}
                  aria-invalid={Boolean(errors[`budget.${k}`])}
                />
                <Err id={`${uid}-b-${k}-e`} msg={errors[`budget.${k}`]} />
              </div>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={f.budget.validated} disabled={!perms.canValidateBudget} onChange={(e) => set("budget", { ...f.budget, validated: e.target.checked })} />
            <span>Montants vérifiés et validés : ils peuvent être affichés sur le site {perms.canValidateBudget ? "" : "(réservé aux administrateurs)"}</span>
          </label>
        </fieldset>

        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">5. Images et documents</legend>
          <h3 className="fiche-sub">Image principale</h3>
          {mainImage ? (
            <ImageEditor item={mainImage} prefix="mainImage" errors={errors} disabled={disabled} label="image principale" onChange={(i) => { setMainImage(i); touch(); }} onRemove={() => { setMainImage(null); touch(); }} />
          ) : (
            <AddImageButton label="Choisir l'image principale" disabled={disabled} onAdd={(i) => { setMainImage(i); touch(); }} />
          )}

          <h3 className="fiche-sub">Images supplémentaires <span className="muted">(facultatives, {LIMITS.gallery} maximum)</span></h3>
          {gallery.map((g, i) => (
            <ImageEditor
              key={g.key}
              item={g}
              prefix={`gallery.${i}`}
              errors={errors}
              disabled={disabled}
              label={`image ${i + 1}`}
              onChange={(n) => { setGallery((a) => a.map((x) => (x.key === g.key ? n : x))); touch(); }}
              onRemove={() => { setGallery((a) => a.filter((x) => x.key !== g.key)); touch(); }}
            />
          ))}
          {gallery.length < LIMITS.gallery ? <AddImageButton label="Ajouter une image" disabled={disabled} onAdd={(i) => { setGallery((a) => [...a, i]); touch(); }} /> : null}

          <h3 className="fiche-sub">Documents joints <span className="muted">(PDF, 4 Mo maximum chacun)</span></h3>
          {docs.map((d, i) => (
            <div key={d.key} className="doc-row">
              <div className="field">
                <label htmlFor={`${uid}-doc${i}`}>Titre du document {i + 1} {d.pending ? <span className="badge badge-sun">pas encore enregistré</span> : null}</label>
                <input id={`${uid}-doc${i}`} value={d.title} maxLength={140} placeholder="Ex. Programme de la journée" onChange={(e) => { setDocs((a) => a.map((x) => (x.key === d.key ? { ...x, title: e.target.value } : x))); touch(); }} aria-invalid={Boolean(errors[`documents.${i}.title`])} />
                <Err id={`${uid}-doc${i}-e`} msg={errors[`documents.${i}.title`] ?? errors[`documents.${i}`]} />
                {d.mediaId && !d.pending ? <a className="small" href={`/media/${d.mediaId}/pdf`} target="_blank" rel="noopener">Ouvrir le PDF</a> : <span className="small muted">{d.name}</span>}
              </div>
              {!disabled ? <button type="button" className="btn btn-outline btn-sm" onClick={() => { setDocs((a) => a.filter((x) => x.key !== d.key)); touch(); }}>Retirer</button> : null}
            </div>
          ))}
          {!disabled && docs.length < LIMITS.documents ? (
            <div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => docInput.current?.click()}>Joindre un PDF</button>
              <input
                ref={docInput}
                type="file"
                accept="application/pdf"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    await checkPdf(file);
                    setDocs((a) => [...a, { key: newKey(), mediaId: null, pending: file, name: file.name, title: file.name.replace(/\.pdf$/i, "").slice(0, 140) }]);
                    touch();
                  } catch (err) {
                    show("error", (err as Error).message);
                  }
                }}
              />
            </div>
          ) : null}
          {errors.media ? <p className="field-error">{errors.media}</p> : null}
        </fieldset>

        <fieldset className="card form" disabled={disabled}>
          <legend className="fiche-legend">6. Bouton d&apos;appel à l&apos;action et statut</legend>
          <div className="form-row form-row-3">
            <div className="field">
              <label htmlFor={`${uid}-cta`}>Bouton</label>
              <select id={`${uid}-cta`} value={f.cta.kind} onChange={(e) => set("cta", { ...f.cta, kind: e.target.value as CtaKind })}>
                {(Object.entries(ctaKinds) as [CtaKind, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {f.cta.kind !== "aucun" ? (
              <>
                <div className="field">
                  <label htmlFor={`${uid}-ctal`}>Texte du bouton <span className="muted">(facultatif)</span></label>
                  <input id={`${uid}-ctal`} value={f.cta.label} maxLength={40} placeholder={ctaKinds[f.cta.kind]} onChange={(e) => set("cta", { ...f.cta, label: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor={`${uid}-ctau`}>Lien <span className="muted">(facultatif)</span></label>
                  <input id={`${uid}-ctau`} value={f.cta.url} maxLength={300} placeholder="Par défaut : formulaire de contact" onChange={(e) => set("cta", { ...f.cta, url: e.target.value })} aria-invalid={Boolean(errors["cta.url"])} />
                  <Err id={`${uid}-ctau-e`} msg={errors["cta.url"]} />
                </div>
              </>
            ) : null}
          </div>
          {f.cta.kind === "soutenir" ? <p className="hint">Tant que le don en ligne n&apos;est pas ouvert, ce bouton mène à la page « Nous soutenir » qui invite à contacter la fondation.</p> : null}
          <div className="field">
            <label htmlFor={`${uid}-status`}>Statut</label>
            <select id={`${uid}-status`} value={f.status} onChange={(e) => set("status", e.target.value as FicheStatus)}>
              {editableStatuses.map((s) => <option key={s} value={s}>{ficheStatuses[s]}</option>)}
            </select>
            <p className="hint">Enregistrer ne publie jamais la fiche. La publication est une action séparée, réservée aux administrateurs.</p>
          </div>
        </fieldset>

        {!disabled ? (
          <div className="save-bar">
            <button type="submit" className="btn" disabled={Boolean(busy)} aria-busy={Boolean(busy)}>{busy ?? (existing ? "Enregistrer les modifications" : "Enregistrer la fiche")}</button>
            {dirty ? <span className="small">Modifications non enregistrées</span> : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
