import Link from "next/link";
import { site, type ImpactIndicator } from "@/config/site";
import { getPublicProgrammes, type Programme } from "@/content/programmes";
import type { Article } from "@/content/actualites";
import { formatDate, formatFCFA, formatNumber, percent } from "@/lib/format";
import { getDictionary } from "@/i18n";
import { Icon } from "./Icon";
import { ExampleBadge, MediaSlot, ToComplete } from "./Markers";
import { Picture } from "./Picture";

const t = getDictionary();

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Fil d'Ariane">
      <ol>
        <li><Link href="/">Accueil</Link></li>
        {items.map((it, i) => (
          <li key={i}>
            {it.href && i < items.length - 1 ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  title,
  lead,
  eyebrow,
  crumbs,
  children,
}: {
  title: string;
  lead?: React.ReactNode;
  eyebrow?: string;
  crumbs: { href?: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="page-hero">
      <div className="container">
        <Breadcrumbs items={crumbs} />
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
        {children}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, lead, center, id }: { eyebrow?: string; title: string; lead?: React.ReactNode; center?: boolean; id?: string }) {
  return (
    <div className={`section-head reveal${center ? " center" : ""}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      {lead ? <p className="lead mb-0">{lead}</p> : null}
    </div>
  );
}

export function ImpactStats({ items }: { items: ImpactIndicator[] }) {
  return (
    <ul className="stats" role="list">
      {items.map((s) => (
        <li key={s.label} className="stat">
          {s.value !== null ? (
            <span className="stat-value">
              {formatNumber(s.value)}
              {s.suffix ?? ""}
            </span>
          ) : (
            <span className="stat-pending">{t.dataToFill}</span>
          )}
          <span className="stat-label">{s.label}</span>
          {s.value !== null && s.source ? <span className="stat-source">Source : {s.source}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export function ProgrammeCard({ programme }: { programme: Programme }) {
  return (
    <article className="card card-link reveal">
      {programme.cover ? (
        <div className="card-media"><Picture image={{ ...programme.cover, isIllustration: true }} caption={false} /></div>
      ) : null}
      <div className={`icon-tile accent-${programme.accent}`}>
        <Icon name={programme.icon} />
      </div>
      <h3><Link href={`/programmes/${programme.slug}`}>{programme.title}</Link></h3>
      <p>{programme.summary}</p>
      <div className="card-foot">
        <span className="link-arrow" aria-hidden="true">Découvrir</span>
      </div>
    </article>
  );
}

export function NewsCard({ article }: { article: Article }) {
  return (
    <article className="card card-link reveal">
      <div className="card-media">
        {article.image ? (
          <Picture image={article.image} caption={false} />
        ) : (
          <MediaSlot label="Image de l'article à fournir" ratio="16 / 9" />
        )}
      </div>
      <div className="row-wrap">
        {article.isExample ? <ExampleBadge label={t.fictional} /> : null}
        <span className="badge">{article.category}</span>
      </div>
      <h3><Link href={`/actualites/${article.slug}`}>{article.title}</Link></h3>
      <p className="meta"><Icon name="calendar" /><time dateTime={article.date}>{formatDate(article.date)}</time></p>
      <p>{article.summary}</p>
    </article>
  );
}

export function DonateBand({ title, text }: { title?: string; text?: string }) {
  return (
    <div className="cta-band reveal">
      <div>
        <h2>{title ?? "Votre soutien change des trajectoires"}</h2>
        <p>{text ?? "Le don en ligne ouvrira bientôt. En attendant, contactez la fondation pour savoir comment soutenir ses actions aux côtés des communautés du Sénégal."}</p>
      </div>
      <div className="cta-actions">
        <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />Nous soutenir</Link>
        <Link href="/transparence" className="btn btn-light">Comment les dons sont utilisés</Link>
      </div>
    </div>
  );
}

export function showImpact() {
  return site.showImpactWhenEmpty || site.impact.some((i) => i.value !== null);
}
