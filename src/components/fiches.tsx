import Link from "next/link";
import { getPublicProgrammes, type Programme } from "@/content/programmes";
import { formatDate, formatFCFA, percent } from "@/lib/format";
import {
  ctaHref,
  ctaLabel,
  ficheStatuses,
  ficheTypes,
  placeLabel,
  publishedBudget,
  timing,
  type Fiche,
  type ImageRef,
  type Schedule,
} from "@/lib/fiches/model";
import { Icon } from "./Icon";
import { Picture } from "./Picture";

function domainProgramme(slug: string) {
  return getPublicProgrammes().find((p) => p.slug === slug) ?? null;
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
function FicheVisual({ fiche, ratio, sizes, eager, caption }: { fiche: Fiche; ratio?: string; sizes?: string; eager?: boolean; caption?: boolean }) {
  if (fiche.mainImage) return <FicheImage image={fiche.mainImage} ratio={ratio} caption={caption} sizes={sizes} eager={eager} />;
  const prog = domainProgramme(fiche.domain);
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

export function scheduleLabel(s: Schedule) {
  if (s.kind === "ponctuel" && s.date) {
    return `${formatDate(s.date)}${s.time ? ` à ${s.time.replace(":", " h ")}` : ""}${s.duration ? ` (durée : ${s.duration})` : ""}`;
  }
  if (s.kind === "periode" && s.startDate) {
    return s.endDate && s.endDate !== s.startDate ? `Du ${formatDate(s.startDate)} au ${formatDate(s.endDate)}` : `À partir du ${formatDate(s.startDate)}`;
  }
  return "Dates à préciser";
}

/** Badge de temporalité : un événement passé n'est jamais présenté comme « à venir ». */
export function TimingBadge({ fiche }: { fiche: Fiche }) {
  const t = timing(fiche);
  if (t === "passe") return <span className="badge badge-past">{fiche.status === "termine" ? "Terminé" : "Date passée"}</span>;
  if (t === "a_venir") return <span className="badge badge-blue">À venir</span>;
  if (t === "en_cours") return <span className="badge badge-sun">En cours</span>;
  return <span className="badge">{ficheStatuses[fiche.status]}</span>;
}

export function FicheCard({ fiche }: { fiche: Fiche }) {
  const place = placeLabel(fiche.zone);
  const domain = domainProgramme(fiche.domain)?.shortTitle ?? null;
  return (
    <article className="card card-link reveal">
      <div className="card-media">
        <FicheVisual fiche={fiche} ratio="16 / 9" caption={false} sizes="(max-width: 760px) 100vw, 400px" />
      </div>
      <div className="row-wrap">
        <span className="badge badge-teal">{ficheTypes[fiche.type]}</span>
        <TimingBadge fiche={fiche} />
        {domain ? <span className="badge">{domain}</span> : null}
      </div>
      <h3><Link href={`/activites/${fiche.slug}`}>{fiche.title}</Link></h3>
      {fiche.schedule.kind !== "a_definir" ? <p className="meta"><Icon name="calendar" />{scheduleLabel(fiche.schedule)}</p> : null}
      {place ? <p className="meta"><Icon name="pin" />{place}</p> : null}
      <p>{fiche.summary}</p>
    </article>
  );
}

function BudgetBlock({ fiche }: { fiche: Fiche }) {
  const b = publishedBudget(fiche.budget);
  if (!b) return null;
  const pct = b.planned && b.collected !== null ? percent(b.collected, b.planned) : null;
  return (
    <div className="stack" style={{ gap: 10 }}>
      {pct !== null ? (
        <div className="progress">
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`Financement : ${pct} % du budget prévisionnel`}>
            <div className="progress-bar" style={{ "--value": `${pct}%` } as React.CSSProperties} />
          </div>
        </div>
      ) : null}
      <dl>
        {b.planned !== null ? <div><dt>Budget prévisionnel</dt><dd>{formatFCFA(b.planned)}</dd></div> : null}
        {b.collected !== null ? <div><dt>Montant collecté</dt><dd>{formatFCFA(b.collected)}</dd></div> : null}
        {b.spent !== null ? <div><dt>Montant dépensé</dt><dd>{formatFCFA(b.spent)}</dd></div> : null}
      </dl>
      {b.validatedAt ? <p className="small muted mb-0">Montants validés le {formatDate(b.validatedAt)}.</p> : null}
    </div>
  );
}

/** Contenu détaillé d'une fiche (page publique et aperçu d'administration). */
export function FicheDetail({ fiche }: { fiche: Fiche }) {
  const place = placeLabel(fiche.zone);
  const href = ctaHref(fiche);
  const paragraphs = fiche.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const t = timing(fiche);
  const prog = domainProgramme(fiche.domain);
  return (
    <section className="section">
      <div className="container split" style={{ alignItems: "start" }}>
        <div className="prose">
          {t === "passe" && fiche.schedule.kind !== "a_definir" ? (
            <div className="notice notice-info" style={{ marginBottom: 20 }}>
              <Icon name="calendar" />
              <p className="mb-0">{fiche.status === "termine" ? "Cette action est terminée." : "Les dates de cette action sont passées."} {scheduleLabel(fiche.schedule)}.</p>
            </div>
          ) : null}
          <div className="rounded-media"><FicheVisual fiche={fiche} eager /></div>
          {paragraphs.length ? (
            <>
              <h2>Description</h2>
              {paragraphs.map((p, i) => <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>)}
            </>
          ) : null}
          {fiche.steps.length ? (
            <>
              <h2>Calendrier</h2>
              <ol className="timeline">
                {fiche.steps.map((s, i) => (
                  <li key={i}>
                    {s.date ? <p className="timeline-when">{formatDate(s.date)}{s.time ? `, ${s.time.replace(":", " h ")}` : ""}</p> : null}
                    <p className="timeline-what"><strong>{s.title}</strong></p>
                    {s.details ? <p className="small muted mb-0">{s.details}</p> : null}
                  </li>
                ))}
              </ol>
            </>
          ) : null}
          {fiche.gallery.length ? (
            <>
              <h2>En images</h2>
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
            <h2 style={{ fontSize: "1.25rem" }}>En bref</h2>
            <dl>
              <div><dt>Type</dt><dd>{ficheTypes[fiche.type]}</dd></div>
              <div><dt>Statut</dt><dd>{t === "passe" ? (fiche.status === "termine" ? "Terminé" : "Date passée") : ficheStatuses[fiche.status]}</dd></div>
              {fiche.schedule.kind !== "a_definir" ? <div><dt>Quand</dt><dd>{scheduleLabel(fiche.schedule)}</dd></div> : null}
              {place ? <div><dt>Où</dt><dd>{place}</dd></div> : null}
              {prog ? <div><dt>Programme</dt><dd><Link href={`/programmes/${prog.slug}`}>{prog.shortTitle}</Link></dd></div> : null}
            </dl>
            {href ? (
              <Link href={href} className="btn btn-sun btn-block">{ctaLabel(fiche)}</Link>
            ) : (
              <Link href={`/contact?type=general&sujet=${encodeURIComponent(fiche.title.slice(0, 100))}`} className="btn btn-outline btn-block">Nous contacter</Link>
            )}
          </div>
          {publishedBudget(fiche.budget) ? (
            <div className="summary">
              <h2 style={{ fontSize: "1.1rem" }}>Budget</h2>
              <BudgetBlock fiche={fiche} />
            </div>
          ) : null}
          <p className="small muted">
            {fiche.publishedAt ? <>Publié le {formatDate(fiche.publishedAt)}. </> : null}Mis à jour le {formatDate(fiche.updatedAt)}.
          </p>
        </aside>
      </div>
    </section>
  );
}
