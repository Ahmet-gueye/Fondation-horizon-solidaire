import Link from "next/link";
import { site, type ImpactIndicator } from "@/config/site";
import type { Programme } from "@/content/programmes";
import type { Article } from "@/content/actualites";
import { formatDate, formatNumber } from "@/lib/format";
import { i18n } from "@/i18n/server";
import { paymentMode } from "@/lib/payments/dons";
import { Icon } from "./Icon";
import { ExampleBadge, MediaSlot } from "./Markers";
import { Picture } from "./Picture";

export async function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const { t } = await i18n();
  return (
    <nav className="breadcrumbs" aria-label={t("Fil d'Ariane", "Breadcrumb")}>
      <ol>
        <li><Link href="/">{t("Accueil", "Home")}</Link></li>
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

export async function ImpactStats({ items }: { items: ImpactIndicator[] }) {
  const { locale, t } = await i18n();
  return (
    <ul className="stats" role="list">
      {items.map((s) => (
        <li key={s.label} className="stat">
          {s.value !== null ? (
            <span className="stat-value">
              {formatNumber(s.value, locale)}
              {s.suffix ?? ""}
            </span>
          ) : (
            <span className="stat-pending">{t("Données à renseigner", "Figures to come")}</span>
          )}
          <span className="stat-label">{locale === "en" && s.labelEn ? s.labelEn : s.label}</span>
          {s.value !== null && s.source ? <span className="stat-source">{t("Source :", "Source:")} {s.source}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** Le programme passé doit déjà être dans la langue du visiteur (getPublicProgrammes(locale)). */
export async function ProgrammeCard({ programme }: { programme: Programme }) {
  const { t } = await i18n();
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
        <span className="link-arrow" aria-hidden="true">{t("Découvrir", "Discover")}</span>
      </div>
    </article>
  );
}

export async function NewsCard({ article }: { article: Article }) {
  const { locale, t } = await i18n();
  return (
    <article className="card card-link reveal">
      <div className="card-media">
        {article.image ? (
          <Picture image={article.image} caption={false} />
        ) : (
          <MediaSlot label={t("Image de l'article à fournir", "Article image to come")} ratio="16 / 9" />
        )}
      </div>
      <div className="row-wrap">
        {article.isExample ? <ExampleBadge label={t("Exemple fictif", "Fictional example")} /> : null}
        <span className="badge">{article.categoryLabel}</span>
      </div>
      <h3><Link href={`/actualites/${article.slug}`}>{article.title}</Link></h3>
      <p className="meta"><Icon name="calendar" /><time dateTime={article.date}>{formatDate(article.date, locale)}</time></p>
      <p>{article.summary}</p>
    </article>
  );
}

export async function DonateBand({ title, text }: { title?: string; text?: string }) {
  const { t } = await i18n();
  return (
    <div className="cta-band reveal">
      <div>
        <h2>{title ?? t("Votre soutien change des trajectoires", "Your support changes lives")}</h2>
        <p>
          {text ??
            (paymentMode() === "prod"
              ? t(
                  "Faites un don en ligne en toute sécurité via la plateforme PayTech, et suivez l'utilisation des fonds sur la page Transparence.",
                  "Give online securely through the PayTech platform, and follow how funds are used on the Transparency page.",
                )
              : t(
              "Le don en ligne ouvrira bientôt. En attendant, contactez la fondation pour savoir comment soutenir ses actions aux côtés des communautés du Sénégal.",
              "Online giving will open soon. In the meantime, contact the foundation to find out how to support its work alongside communities in Senegal.",
            ))}
        </p>
      </div>
      <div className="cta-actions">
        <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />{t("Nous soutenir", "Support us")}</Link>
        <Link href="/transparence" className="btn btn-light">{t("Comment les dons sont utilisés", "How donations are used")}</Link>
      </div>
    </div>
  );
}

export function showImpact() {
  return site.showImpactWhenEmpty || site.impact.some((i) => i.value !== null);
}
