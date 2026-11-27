import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/Markers";
import { FicheCard } from "@/components/fiches";
import { DonateBand, ImpactStats, NewsCard, ProgrammeCard, SectionHead, showImpact } from "@/components/ui";
import { site } from "@/config/site";
import { getArticles } from "@/content/actualites";
import { getPublicProgrammes } from "@/content/programmes";
import { listPublicFiches } from "@/lib/fiches/repo";
import { testimonials } from "@/content/temoignages";
import { pageMetadata } from "@/lib/seo";
import { i18n } from "@/i18n/server";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({ title: t("Accueil", "Home"), description: locale === "en" ? site.en.description : site.description, path: "/", locale });
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { locale, t } = await i18n();
  const programmes = getPublicProgrammes(locale);
  const fiches = (await listPublicFiches()).slice(0, 3);
  const articles = getArticles(locale).slice(0, 3);

  return (
    <>
      {/* Bannière */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-inner">
          <div>
            <p className="hero-motto">{locale === "en" ? site.en.motto : site.motto}</p>
            {locale === "en" ? (
              <h1 id="hero-title">
                Acting together for a <em>shared horizon</em> in Senegal
              </h1>
            ) : (
              <h1 id="hero-title">
                Agir ensemble pour un <em>horizon solidaire</em> au Sénégal
              </h1>
            )}
            <p className="lead">
              {t(
                "Éducation, santé, aide d'urgence, solidarité et développement local : la Fondation Horizon Solidaire accompagne les communautés avec des actions concrètes, suivies et rendues publiques.",
                "Education, health, emergency aid, solidarity and local development: Fondation Horizon Solidaire supports communities with concrete actions that are monitored and made public.",
              )}
            </p>
            <div className="hero-actions">
              <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />{t("Soutenir nos actions", "Support our work")}</Link>
              <Link href="/activites" className="btn btn-outline">{t("Découvrir nos actions", "See our actions")}</Link>
            </div>
          </div>
          <figure className="hero-visual">
            <Image
              src={site.logo.full.src}
              alt={t(
                "Visuel officiel de la Fondation Horizon Solidaire : logo (mains entourant une poignée de main sous un soleil), devise « Ensemble, construisons un avenir durable » et six domaines d'action : éducation pour tous, santé pour tous, aide humanitaire, solidarité communautaire, développement durable, entraide et partage.",
                "Official visual of Fondation Horizon Solidaire: logo (hands around a handshake under a sun), the motto “Ensemble, construisons un avenir durable” (Together, let's build a sustainable future) and six areas of action: education for all, health for all, humanitarian aid, community solidarity, sustainable development, mutual aid and sharing.",
              )}
              width={site.logo.full.width}
              height={site.logo.full.height}
              priority
              sizes="(max-width: 960px) min(92vw, 520px), 520px"
            />
          </figure>
        </div>
      </section>

      {/* Mission */}
      <section className="section" aria-labelledby="mission-title">
        <div className="container split">
          <div className="reveal">
            <p className="eyebrow">{t("Notre mission", "Our mission")}</p>
            <h2 id="mission-title">{t("Être aux côtés des communautés, là où le besoin est réel", "Standing with communities, where the need is real")}</h2>
            <p className="lead">
              {t(
                "La fondation agit au Sénégal pour que chaque personne puisse apprendre, se soigner, faire face aux coups durs et construire son avenir.",
                "The foundation works in Senegal so that everyone can learn, get care, cope with hard times and build their future.",
              )}
            </p>
            <p>
              {t(
                "Nous partons des besoins exprimés localement, travaillons avec les acteurs de terrain et rendons compte de l'utilisation de chaque franc reçu. Notre conviction tient en une phrase : on construit plus durablement ensemble que seul.",
                "We start from needs expressed locally, work with people on the ground and report on how every franc received is used. Our belief fits in one sentence: we build more lastingly together than alone.",
              )}
            </p>
            <Link href="/qui-sommes-nous" className="link-arrow">{t("En savoir plus sur la fondation", "Learn more about the foundation")}</Link>
          </div>
          <div className="grid grid-2 reveal">
            {[
              { icon: "users", title: t("Proximité", "Closeness"), text: t("Des actions construites avec les habitants et les relais locaux.", "Actions built with residents and local partners.") },
              { icon: "shield", title: t("Transparence", "Transparency"), text: t("Des rapports et budgets publiés, des informations datées.", "Published reports and budgets, dated information.") },
              { icon: "handshake", title: t("Entraide", "Mutual aid"), text: t("La solidarité comme moteur, entre voisins comme entre partenaires.", "Solidarity as a driving force, between neighbours and between partners.") },
              { icon: "developpement", title: t("Durabilité", "Sustainability"), text: t("Des projets pensés pour durer au-delà de notre intervention.", "Projects designed to last beyond our involvement.") },
            ].map((v) => (
              <div key={v.title} className="card">
                <div className="icon-tile accent-green"><Icon name={v.icon} /></div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      {showImpact() ? (
        <section className="section section-green" aria-labelledby="impact-title">
          <div className="container">
            <SectionHead
              eyebrow={t("Notre impact", "Our impact")}
              title={t("Des résultats vérifiables", "Verifiable results")}
              id="impact-title"
              lead={t("Nous ne publions que des chiffres vérifiés et sourcés. Ils seront affichés ici dès leur validation par la fondation.", "We only publish verified figures with their source. They will appear here as soon as the foundation has validated them.")}
            />
            <div className="reveal">
              <ImpactStats items={site.impact} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Programmes */}
      <section className="section" aria-labelledby="programmes-title">
        <div className="container">
          <SectionHead
            eyebrow={t("Nos programmes", "Our programmes")}
            title={t(`${programmes.length} domaines d'action complémentaires`, `${programmes.length} complementary areas of action`)}
            id="programmes-title"
            lead={t("Chaque programme réunit des actions concrètes, avec leurs dates, leurs lieux et, une fois validés, leurs budgets.", "Each programme brings together concrete actions, with their dates, places and, once validated, their budgets.")}
          />
          <div className="grid grid-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.slug} programme={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Activités et campagnes publiées */}
      <section className="section section-warm" aria-labelledby="projets-title">
        <div className="container">
          <SectionHead eyebrow={t("Sur le terrain", "On the ground")} title={t("Activités et campagnes", "Activities and campaigns")} id="projets-title" lead={t("Lieux, dates, calendrier et moyens de participer : chaque fiche est publiée par la fondation.", "Places, dates, schedule and ways to take part: each page is published by the foundation.")} />
          {fiches.length > 0 ? (
            <div className="grid grid-3">
              {fiches.map((f) => (
                <FicheCard key={f.id} fiche={f} />
              ))}
            </div>
          ) : (
            <EmptyState icon="pin" title={t("Les premières activités seront bientôt publiées", "The first activities will be published soon")}>
              <p>{t("Les activités, événements, projets et campagnes apparaîtront ici dès leur publication par la fondation.", "Activities, events, projects and campaigns will appear here as soon as the foundation publishes them.")}</p>
            </EmptyState>
          )}
          <p className="center mt-4"><Link href="/activites" className="btn btn-outline">{t("Voir toutes les activités", "See all activities")}</Link></p>
        </div>
      </section>

      {/* Témoignages */}
      <section className="section" aria-labelledby="temoignages-title">
        <div className="container container-narrow">
          <SectionHead eyebrow={t("Ils en parlent", "In their words")} title={t("Témoignages", "Testimonials")} id="temoignages-title" center />
          {testimonials.length > 0 ? (
            <div className="grid grid-2">
              {testimonials.map((tm) => (
                <figure key={tm.quote} className="card reveal">
                  <blockquote className="testimonial" lang="fr"><p>« {tm.quote} »</p></blockquote>
                  <figcaption className="muted">{tm.author}{tm.role ? `, ${tm.role}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="quote-call reveal">
              <Icon name="quote" />
              <h3>{t("Votre parole compte", "Your voice matters")}</h3>
              <p className="muted">
                {t(
                  "Bénévole, partenaire ou membre d'une communauté accompagnée : vous souhaitez partager votre expérience ? Nous publions uniquement des témoignages recueillis avec votre accord écrit.",
                  "Volunteer, partner or member of a community we support: would you like to share your experience? We only publish testimonials collected with your written consent.",
                )}
              </p>
              <Link href="/contact?type=general" className="btn btn-outline mt-2">{t("Proposer un témoignage", "Share a testimonial")}</Link>
            </div>
          )}
        </div>
      </section>

      {/* Actualités */}
      <section className="section section-warm" aria-labelledby="actus-title">
        <div className="container">
          <SectionHead eyebrow={t("Actualités", "News")} title={t("Les dernières nouvelles", "Latest news")} id="actus-title" />
          {articles.length > 0 ? (
            <div className="grid grid-3">
              {articles.map((a) => (
                <NewsCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <EmptyState icon="calendar" title={t("Aucune actualité publiée pour le moment", "No news published yet")} />
          )}
          <p className="center mt-4"><Link href="/actualites" className="btn btn-outline">{t("Toutes les actualités", "All news")}</Link></p>
        </div>
      </section>

      {/* Engagement */}
      <section className="section" aria-labelledby="engage-title">
        <div className="container">
          <SectionHead eyebrow={t("Agir avec nous", "Get involved")} title={t("Donnez de votre temps ou de vos compétences", "Give your time or your skills")} id="engage-title" />
          <div className="grid grid-2">
            <div className="engage-card accent-sun reveal">
              <div className="icon-tile" style={{ background: "#fff" }}><Icon name="users" /></div>
              <h3>{t("Devenir bénévole", "Become a volunteer")}</h3>
              <p className="mb-0">{t("Encadrement scolaire, logistique, communication, santé… Chaque compétence peut être utile, ponctuellement ou dans la durée.", "Tutoring, logistics, communication, health… Every skill can help, occasionally or over time.")}</p>
              <Link href="/engagez-vous#benevolat" className="btn">{t("Je deviens bénévole", "I want to volunteer")}</Link>
            </div>
            <div className="engage-card accent-teal reveal">
              <div className="icon-tile" style={{ background: "#fff" }}><Icon name="handshake" /></div>
              <h3>{t("Devenir partenaire", "Become a partner")}</h3>
              <p className="mb-0">{t("Entreprises, associations, institutions : construisons ensemble des projets utiles, suivis et évalués.", "Companies, associations, institutions: let's build useful projects together, monitored and evaluated.")}</p>
              <Link href="/engagez-vous#partenariat" className="btn">{t("Proposer un partenariat", "Propose a partnership")}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-label={t("Appel au don", "Call for donations")}>
        <div className="container">
          <DonateBand />
        </div>
      </section>
    </>
  );
}
