import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/Markers";
import { DonateBand, ImpactStats, NewsCard, ProgrammeCard, ProgressBlock, ProjectCard, SectionHead, showImpact } from "@/components/ui";
import { site } from "@/config/site";
import { getArticles } from "@/content/actualites";
import { getPublicProgrammes } from "@/content/programmes";
import { getFeaturedProject, getProjects } from "@/content/projets";
import { testimonials } from "@/content/temoignages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Accueil",
  description: site.description,
  path: "/",
});

export default function HomePage() {
  const programmes = getPublicProgrammes();
  const projects = getProjects().slice(0, 3);
  const featured = getFeaturedProject();
  const articles = getArticles().slice(0, 3);

  return (
    <>
      {/* Bannière */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-inner">
          <div>
            <p className="hero-motto">{site.motto}</p>
            <h1 id="hero-title">
              Agir ensemble pour un <em>horizon solidaire</em> au Sénégal
            </h1>
            <p className="lead">
              Éducation, santé, aide d&apos;urgence, solidarité et développement local : la Fondation Horizon Solidaire
              accompagne les communautés avec des actions concrètes, suivies et rendues publiques.
            </p>
            <div className="hero-actions">
              <Link href="/faire-un-don" className="btn btn-sun"><Icon name="heart" />Soutenir nos actions</Link>
              <Link href="/projets" className="btn btn-outline">Découvrir nos projets</Link>
            </div>
          </div>
          <figure className="hero-visual">
            <Image
              src={site.logo.full.src}
              alt="Visuel officiel de la Fondation Horizon Solidaire : logo (mains entourant une poignée de main sous un soleil), devise « Ensemble, construisons un avenir durable » et six domaines d'action : éducation pour tous, santé pour tous, aide humanitaire, solidarité communautaire, développement durable, entraide et partage."
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
            <p className="eyebrow">Notre mission</p>
            <h2 id="mission-title">Être aux côtés des communautés, là où le besoin est réel</h2>
            <p className="lead">
              La fondation agit au Sénégal pour que chaque personne puisse apprendre, se soigner, faire face aux
              coups durs et construire son avenir.
            </p>
            <p>
              Nous partons des besoins exprimés localement, travaillons avec les acteurs de terrain et rendons compte de
              l&apos;utilisation de chaque franc reçu. Notre conviction tient en une phrase : on construit plus durablement
              ensemble que seul.
            </p>
            <Link href="/qui-sommes-nous" className="link-arrow">En savoir plus sur la fondation</Link>
          </div>
          <div className="grid grid-2 reveal">
            {[
              { icon: "users", title: "Proximité", text: "Des actions construites avec les habitants et les relais locaux." },
              { icon: "shield", title: "Transparence", text: "Des rapports et budgets publiés, des informations datées." },
              { icon: "handshake", title: "Entraide", text: "La solidarité comme moteur, entre voisins comme entre partenaires." },
              { icon: "developpement", title: "Durabilité", text: "Des projets pensés pour durer au-delà de notre intervention." },
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
              eyebrow="Notre impact"
              title="Des résultats vérifiables"
              id="impact-title"
              lead="Nous ne publions que des chiffres vérifiés et sourcés. Ils seront affichés ici dès leur validation par la fondation."
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
            eyebrow="Nos programmes"
            title={`${programmes.length} domaines d'action complémentaires`}
            id="programmes-title"
            lead="Chaque programme réunit des projets concrets, avec des objectifs, un budget et des résultats publiés."
          />
          <div className="grid grid-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.slug} programme={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Projet prioritaire (seulement avec des données réelles) */}
      {featured ? (
        <section className="section section-warm" aria-labelledby="featured-title">
          <div className="container">
            <div className="feature-box reveal">
              <div>
                <p className="eyebrow">Projet prioritaire</p>
                <h2 id="featured-title">{featured.title}</h2>
                <p className="lead">{featured.summary}</p>
                <Link href={`/projets/${featured.slug}`} className="link-arrow">Voir la fiche du projet</Link>
              </div>
              <div className="stack">
                <ProgressBlock project={featured} />
                <Link href={`/faire-un-don?affectation=projet:${featured.slug}`} className="btn btn-sun"><Icon name="heart" />Soutenir ce projet</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Projets */}
      <section className={`section${featured ? "" : " section-warm"}`} aria-labelledby="projets-title">
        <div className="container">
          <SectionHead eyebrow="Sur le terrain" title="Nos projets" id="projets-title" lead="Chaque fiche présente le besoin, les étapes, le budget et l'état d'avancement." />
          {projects.length > 0 ? (
            <div className="grid grid-3">
              {projects.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon="pin" title="Les premiers projets seront bientôt publiés">
              <p>Les fiches projets apparaîtront ici dès leur validation par la fondation.</p>
            </EmptyState>
          )}
          <p className="center mt-4"><Link href="/projets" className="btn btn-outline">Voir tous les projets</Link></p>
        </div>
      </section>

      {/* Témoignages */}
      <section className="section" aria-labelledby="temoignages-title">
        <div className="container container-narrow">
          <SectionHead eyebrow="Ils en parlent" title="Témoignages" id="temoignages-title" center />
          {testimonials.length > 0 ? (
            <div className="grid grid-2">
              {testimonials.map((tm) => (
                <figure key={tm.quote} className="card reveal">
                  <blockquote className="testimonial"><p>« {tm.quote} »</p></blockquote>
                  <figcaption className="muted">{tm.author}{tm.role ? `, ${tm.role}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="quote-call reveal">
              <Icon name="quote" />
              <h3>Votre parole compte</h3>
              <p className="muted">
                Bénévole, partenaire ou membre d&apos;une communauté accompagnée : vous souhaitez partager votre expérience ?
                Nous publions uniquement des témoignages recueillis avec votre accord écrit.
              </p>
              <Link href="/contact?type=general" className="btn btn-outline mt-2">Proposer un témoignage</Link>
            </div>
          )}
        </div>
      </section>

      {/* Actualités */}
      <section className="section section-warm" aria-labelledby="actus-title">
        <div className="container">
          <SectionHead eyebrow="Actualités" title="Les dernières nouvelles" id="actus-title" />
          {articles.length > 0 ? (
            <div className="grid grid-3">
              {articles.map((a) => (
                <NewsCard key={a.slug} article={a} />
              ))}
            </div>
          ) : (
            <EmptyState icon="calendar" title="Aucune actualité publiée pour le moment" />
          )}
          <p className="center mt-4"><Link href="/actualites" className="btn btn-outline">Toutes les actualités</Link></p>
        </div>
      </section>

      {/* Engagement */}
      <section className="section" aria-labelledby="engage-title">
        <div className="container">
          <SectionHead eyebrow="Agir avec nous" title="Donnez de votre temps ou de vos compétences" id="engage-title" />
          <div className="grid grid-2">
            <div className="engage-card accent-sun reveal">
              <div className="icon-tile" style={{ background: "#fff" }}><Icon name="users" /></div>
              <h3>Devenir bénévole</h3>
              <p className="mb-0">Encadrement scolaire, logistique, communication, santé… Chaque compétence peut être utile, ponctuellement ou dans la durée.</p>
              <Link href="/engagez-vous#benevolat" className="btn">Je deviens bénévole</Link>
            </div>
            <div className="engage-card accent-teal reveal">
              <div className="icon-tile" style={{ background: "#fff" }}><Icon name="handshake" /></div>
              <h3>Devenir partenaire</h3>
              <p className="mb-0">Entreprises, associations, institutions : construisons ensemble des projets utiles, suivis et évalués.</p>
              <Link href="/engagez-vous#partenariat" className="btn">Proposer un partenariat</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-label="Appel au don">
        <div className="container">
          <DonateBand />
        </div>
      </section>
    </>
  );
}
