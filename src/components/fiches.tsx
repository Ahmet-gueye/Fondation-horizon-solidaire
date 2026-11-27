import Link from "next/link";
import { getPublicProgrammes, type Programme } from "@/content/programmes";
import { makeT, type Locale } from "@/i18n";
import { i18n } from "@/i18n/server";
import { formatDate, formatFCFA, percent } from "@/lib/format";
import {
  ctaHref,
  ctaLabel,
  ficheStatuses,
  ficheStatusesEn,
  ficheTypes,
  ficheTypesEn,
  placeLabel,
  publishedBudget,
  timing,
  type Fiche,
  type ImageRef,
  type Schedule,
} from "@/lib/fiches/model";
import { Icon } from "./Icon";
import { Picture } from "./Picture";

function domainProgramme(slug: string, locale: Locale) {
  return getPublicProgrammes(locale).find((p) => p.slug === slug) ?? null;
}

export function ficheTypeLabel(type: Fiche["type"], locale: Locale) {
  return (locale === "en" ? ficheTypesEn : ficheTypes)[type];
}

/** Visuel de repli aux couleurs du programme (quand il n'a pas d'illustration). */
export function ProgrammeVisual({ programme, ratio = "16 / 9" }: { programme: Pick<Programme, "accent" | "icon" | "shortTitle"> | null; ratio?: string }) {
  return (
    <div className={`prog-visual accent-${programme?.accent ?? "green"}`} style={{ aspectRatio: ratio }} role="img" aria-label={programme ? `Programme ${programme.shortTitle}` : "Fondation Horizon Solidaire"}>
      <Icon name={programme?.icon ?? "handshake"} />
    </div>
  );
}

/** Image de la fiche, ou à défaut l'illustration de son programme (signalée comme telle). */
function FicheVisual({ fiche, ratio, sizes, eager, caption, locale }: { fiche: Fiche; ratio?: string; sizes?: string; eager?: boolean; caption?: boolean; locale: Locale }) {
  if (fiche.mainImage) return <FicheImage image={fiche.mainImage} ratio={ratio} caption={caption} sizes={sizes} eager={eager} />;
  const prog = domainProgramme(fiche.domain, locale);
  if (prog?.cover) return <Picture image={{ ...prog.cover, isIllustration: true }} ratio={ratio ?? "16 / 9"} caption={caption} eager={eager} />;
  return <ProgrammeVisual programme={prog} ratio={ratio ?? "16 / 9"} />;
}

/** Image importée par l'administration, servie en deux tailles (800 et 1600 px). */
export function FicheImage({ image, ratio, eager, caption = true, sizes = "(max-width: 760px) 100vw, 760px" }: { image: ImageRef; ratio?: string; eager?: boolean; caption?: boolean; sizes?: string }) {
  return (
    <figure className="picture">
      <div className="picture-frame" style={ratio ? { aspectRatio: ratio } : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/media/${image.mediaId}/lg`}
          srcSet={`/media/${image.mediaId}/md 800w, /media/${image.mediaId}/lg 1600w`}
          sizes={sizes}
          alt={image.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      {caption && image.caption ? <figcaption className="picture-credit">{image.caption}</figcaption> : null}
    </figure>
  );
}

function timeLabel(time: string, locale: Locale) {
  return locale === "en" ? time : time.replace(":", " h ");
}

export function scheduleLabel(s: Schedule, locale: Locale = "fr") {
  const t = makeT(locale);
  if (s.kind === "ponctuel" && s.date) {
    return `${formatDate(s.date, locale)}${s.time ? ` ${t("à", "at")} ${timeLabel(s.time, locale)}` : ""}${s.duration ? ` (${t("durée :", "duration:")} ${s.duration})` : ""}`;
  }
  if (s.kind === "periode" && s.startDate) {
    return s.endDate && s.endDate !== s.startDate
      ? `${t("Du", "From")} ${formatDate(s.startDate, locale)} ${t("au", "to")} ${formatDate(s.endDate, locale)}`
      : `${t("À partir du", "From")} ${formatDate(s.startDate, locale)}`;
  }
  return t("Dates à préciser", "Dates to be confirmed");
}

function statusLabel(fiche: Fiche, locale: Locale) {
  const t = makeT(locale);
  const tm = timing(fiche);
  if (tm === "passe") return fiche.status === "termine" ? t("Terminé", "Completed") : t("Date passée", "Past date");
  return (locale === "en" ? ficheStatusesEn : ficheStatuses)[fiche.status];
}

/** Badge de temporalité : un événement passé n'est jamais présenté comme « à venir ». */
export async function TimingBadge({ fiche }: { fiche: Fiche }) {
  const { locale, t } = await i18n();
  const tm = timing(fiche);
  if (tm === "passe") return <span className="badge badge-past">{statusLabel(fiche, locale)}</span>;
  if (tm === "a_venir") return <span className="badge badge-blue">{t("À venir", "Upcoming")}</span>;
  if (tm === "en_cours") return <span className="badge badge-sun">{t("En cours", "In progress")}</span>;
  return <span className="badge">{statusLabel(fiche, locale)}</span>;
}

export async function FicheCard({ fiche }: { fiche: Fiche }) {
  const { locale } = await i18n();
  const place = placeLabel(fiche.zone);
  const domain = domainProgramme(fiche.domain, locale)?.shortTitle ?? null;
  return (
    <article className="card card-link reveal">
      <div className="card-media">
        <FicheVisual fiche={fiche} ratio="16 / 9" caption={false} sizes="(max-width: 760px) 100vw, 400px" locale={locale} />
      </div>
      <div className="row-wrap">
        <span className="badge badge-teal">{ficheTypeLabel(fiche.type, locale)}</span>
        <TimingBadge fiche={fiche} />
        {domain ? <span className="badge">{domain}</span> : null}
      </div>
      <h3><Link href={`/activites/${fiche.slug}`}>{fiche.title}</Link></h3>
      {fiche.schedule.kind !== "a_definir" ? <p className="meta"><Icon name="calendar" />{scheduleLabel(fiche.schedule, locale)}</p> : null}
      {place ? <p className="meta"><Icon name="pin" />{place}</p> : null}
      <p>{fiche.summary}</p>
    </article>
  );
}

function BudgetBlock({ fiche, locale }: { fiche: Fiche; locale: Locale }) {
  const t = makeT(locale);
  const b = publishedBudget(fiche.budget);
  if (!b) return null;
  const pct = b.planned && b.collected !== null ? percent(b.collected, b.planned) : null;
  return (
    <div className="stack" style={{ gap: 10 }}>
      {pct !== null ? (
        <div className="progress">
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t(`Financement : ${pct} % du budget prévisionnel`, `Funding: ${pct}% of the planned budget`)}>
            <div className="progress-bar" style={{ "--value": `${pct}%` } as React.CSSProperties} />
          </div>
        </div>
      ) : null}
      <dl>
        {b.planned !== null ? <div><dt>{t("Budget prévisionnel", "Planned budget")}</dt><dd>{formatFCFA(b.planned, locale)}</dd></div> : null}
        {b.collected !== null ? <div><dt>{t("Montant collecté", "Amount raised")}</dt><dd>{formatFCFA(b.collected, locale)}</dd></div> : null}
        {b.spent !== null ? <div><dt>{t("Montant dépensé", "Amount spent")}</dt><dd>{formatFCFA(b.spent, locale)}</dd></div> : null}
      </dl>
      {b.validatedAt ? <p className="small muted mb-0">{t("Montants validés le", "Amounts validated on")} {formatDate(b.validatedAt, locale)}.</p> : null}
    </div>
  );
}

/** Contenu détaillé d'une fiche (page publique et aperçu d'administration). */
export async function FicheDetail({ fiche }: { fiche: Fiche }) {
  const { locale, t } = await i18n();
  const place = placeLabel(fiche.zone);
  const href = ctaHref(fiche);
  const paragraphs = fiche.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const tm = timing(fiche);
  const prog = domainProgramme(fiche.domain, locale);
  return (
    <section className="section">
      <div className="container split" style={{ alignItems: "start" }}>
        <div className="prose">
          {locale === "en" ? (
            <div className="notice notice-info" style={{ marginBottom: 20 }} lang="en">
              <Icon name="globe" />
              <p className="mb-0">This page was written in French by the foundation.</p>
            </div>
          ) : null}
          {tm === "passe" && fiche.schedule.kind !== "a_definir" ? (
            <div className="notice notice-info" style={{ marginBottom: 20 }}>
              <Icon name="calendar" />
              <p className="mb-0">{fiche.status === "termine" ? t("Cette action est terminée.", "This action is completed.") : t("Les dates de cette action sont passées.", "The dates of this action have passed.")} {scheduleLabel(fiche.schedule, locale)}.</p>
            </div>
          ) : null}
          <div className="rounded-media"><FicheVisual fiche={fiche} eager locale={locale} /></div>
          {paragraphs.length ? (
            <>
              <h2>{t("Description", "Description")}</h2>
              {paragraphs.map((p, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>)}
            </>
          ) : null}
          {fiche.steps.length ? (
            <>
              <h2>{t("Calendrier", "Schedule")}</h2>
              <ol className="timeline">
                {fiche.steps.map((s, i) => (
                  <li key={i}>
                    {s.date ? <p className="timeline-when">{formatDate(s.date, locale)}{s.time ? `, ${timeLabel(s.time, locale)}` : ""}</p> : null}
                    <p className="timeline-what"><strong>{s.title}</strong></p>
                    {s.details ? <p className="small muted mb-0">{s.details}</p> : null}
                  </li>
                ))}
              </ol>
            </>
          ) : null}
          {fiche.gallery.length ? (
            <>
              <h2>{t("En images", "Photos")}</h2>
              <div className="grid grid-2">
                {fiche.gallery.map((g) => <FicheImage key={g.mediaId} image={g} ratio="4 / 3" sizes="(max-width: 760px) 100vw, 380px" />)}
              </div>
            </>
          ) : null}
          {fiche.documents.length ? (
            <>
              <h2>Documents</h2>
              <ul className="doc-list">
                {fiche.documents.map((d) => (
                  <li key={d.mediaId}><Icon name="doc" /><a href={`/media/${d.mediaId}/pdf`} target="_blank" rel="noopener">{d.title} <span className="muted small">(PDF)</span></a></li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="stack donate-aside">
          <div className="summary">
            <h2 style={{ fontSize: "1.25rem" }}>{t("En bref", "At a glance")}</h2>
            <dl>
              <div><dt>{t("Type", "Type")}</dt><dd>{ficheTypeLabel(fiche.type, locale)}</dd></div>
              <div><dt>{t("Statut", "Status")}</dt><dd>{statusLabel(fiche, locale)}</dd></div>
              {fiche.schedule.kind !== "a_definir" ? <div><dt>{t("Quand", "When")}</dt><dd>{scheduleLabel(fiche.schedule, locale)}</dd></div> : null}
              {place ? <div><dt>{t("Où", "Where")}</dt><dd>{place}</dd></div> : null}
              {prog ? <div><dt>{t("Programme", "Programme")}</dt><dd><Link href={`/programmes/${prog.slug}`}>{prog.shortTitle}</Link></dd></div> : null}
            </dl>
            {href ? (
              <Link href={href} className="btn btn-sun btn-block">{ctaLabel(fiche, locale)}</Link>
            ) : (
              <Link href={`/contact?type=general&sujet=${encodeURIComponent(fiche.title.slice(0, 100))}`} className="btn btn-outline btn-block">{t("Nous contacter", "Contact us")}</Link>
            )}
          </div>
          {publishedBudget(fiche.budget) ? (
            <div className="summary">
              <h2 style={{ fontSize: "1.1rem" }}>Budget</h2>
              <BudgetBlock fiche={fiche} locale={locale} />
            </div>
          ) : null}
          <p className="small muted">
            {fiche.publishedAt ? <>{t("Publié le", "Published on")} {formatDate(fiche.publishedAt, locale)}. </> : null}
            {t("Mis à jour le", "Updated on")} {formatDate(fiche.updatedAt, locale)}.
          </p>
        </aside>
      </div>
    </section>
  );
}
