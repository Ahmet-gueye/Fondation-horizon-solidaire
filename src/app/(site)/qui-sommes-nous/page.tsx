import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { Notice, ToComplete, ValueOr } from "@/components/Markers";
import { DonateBand, PageHero, SectionHead } from "@/components/ui";
import { site } from "@/config/site";
import { history, team } from "@/content/equipe";
import { partners } from "@/content/partenaires";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { i18n } from "@/i18n/server";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Qui sommes-nous ?", "About us"),
    description: t("Mission, vision, valeurs et méthode d'action de la Fondation Horizon Solidaire au Sénégal.", "Mission, vision, values and way of working of Fondation Horizon Solidaire in Senegal."),
    path: "/qui-sommes-nous",
    locale,
  });
}

export default async function AboutPage() {
  const { locale, t } = await i18n();
  const { legal } = site;
  const tc = t("À compléter par la fondation", "To be provided by the foundation");
  const values = [
    { icon: "handshake", title: t("Solidarité", "Solidarity"), text: t("Nous croyons à la force de l'entraide et du collectif.", "We believe in the strength of mutual aid and of working together.") },
    { icon: "shield", title: t("Intégrité", "Integrity"), text: t("Nous rendons compte de nos actions et de l'usage des fonds.", "We report on our actions and on how funds are used.") },
    { icon: "users", title: t("Respect et dignité", "Respect and dignity"), text: t("Chaque personne accompagnée est actrice de son propre parcours.", "Every person we support is in charge of their own path.") },
    { icon: "developpement", title: t("Durabilité", "Sustainability"), text: t("Nous privilégions des solutions qui durent et respectent l'environnement.", "We favour solutions that last and respect the environment.") },
  ];
  const method = [
    { title: t("Écouter", "Listen"), text: t("Identifier les besoins avec les communautés, les autorités locales et les acteurs de terrain.", "Identify needs with communities, local authorities and people on the ground.") },
    { title: t("Concevoir", "Design"), text: t("Définir des objectifs mesurables, un budget et un calendrier pour chaque projet.", "Set measurable goals, a budget and a timeline for each project.") },
    { title: t("Agir", "Act"), text: t("Mettre en œuvre avec des partenaires locaux et des bénévoles, au plus près des bénéficiaires.", "Carry out the work with local partners and volunteers, as close as possible to the people concerned.") },
    { title: t("Rendre compte", "Report"), text: t("Mesurer les résultats et publier les informations financières et les rapports.", "Measure results and publish financial information and reports.") },
  ];
  return (
    <>
      <PageHero
        title={t("Qui sommes-nous ?", "About us")}
        eyebrow={t("La fondation", "The foundation")}
        lead={t("Une fondation engagée au Sénégal pour l'éducation, la santé, la solidarité et le développement durable des communautés.", "A foundation committed in Senegal to education, health, solidarity and the sustainable development of communities.")}
        crumbs={[{ label: t("Qui sommes-nous ?", "About us") }]}
      />

      <section className="section" aria-labelledby="mission">
        <div className="container split">
          <div className="reveal">
            <p className="eyebrow">{t("Mission et vision", "Mission and vision")}</p>
            <h2 id="mission">{t("Notre raison d'être", "Why we exist")}</h2>
            <h3>{t("Mission", "Mission")}</h3>
            <p>
              {t(
                "Améliorer durablement les conditions de vie des personnes et des communautés vulnérables au Sénégal, à travers l'éducation, la santé, l'aide humanitaire, la solidarité et le développement local.",
                "To lastingly improve the living conditions of vulnerable people and communities in Senegal, through education, health, humanitarian aid, solidarity and local development.",
              )}
            </p>
            <h3>{t("Vision", "Vision")}</h3>
            <p>
              {locale === "en"
                ? `A Senegal where everyone can learn, receive care, be protected and take part in the development of their community. Our motto sums it up: “${site.en.motto}”.`
                : `Un Sénégal où chacun peut apprendre, se soigner, être protégé et participer au développement de sa communauté. Notre devise le résume : « ${site.motto} ».`}
            </p>
            <p className="small muted">{t("Textes proposés à partir de l'identité de la fondation, à valider par ses instances.", "Texts drafted from the foundation's identity, to be approved by its governing bodies.")}</p>
          </div>
          <div className="center reveal">
            <Logo size="lg" />
            <p className="small muted mt-2">{site.logo.src ? t("Le logo officiel de la fondation.", "The foundation's official logo.") : t("Emplacement réservé au logo officiel de la fondation.", "Space reserved for the foundation's official logo.")}</p>
          </div>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="valeurs">
        <div className="container">
          <SectionHead eyebrow={t("Nos valeurs", "Our values")} title={t("Ce qui guide chacune de nos actions", "What guides everything we do")} id="valeurs" />
          <div className="grid grid-4">
            {values.map((v) => (
              <div key={v.title} className="card reveal">
                <div className="icon-tile accent-green"><Icon name={v.icon} /></div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="methode">
        <div className="container container-narrow">
          <SectionHead eyebrow={t("Méthode d'action", "Our method")} title={t("Comment nous travaillons", "How we work")} id="methode" />
          <ol className="steps reveal">
            {method.map((m) => (
              <li key={m.title}>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="historique">
        <div className="container container-narrow">
          <SectionHead eyebrow={t("Historique", "History")} title={t("Notre parcours", "Our journey")} id="historique" />
          {history.length > 0 ? (
            <ol className="steps">
              {history.map((h) => (
                <li key={h.date + h.text}>
                  <h3><time dateTime={h.date}>{formatDate(h.date, locale)}</time></h3>
                  <p lang="fr">{h.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ToComplete block label={t("Historique daté de la fondation à compléter (création, étapes clés)", "Dated history of the foundation to be provided (creation, key milestones)")} />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="equipe">
        <div className="container">
          <SectionHead eyebrow={t("Gouvernance", "Governance")} title={t("Responsables et équipe", "Leaders and team")} id="equipe" />
          {team.length > 0 ? (
            <div className="grid grid-4">
              {team.map((m) => (
                <div key={m.name} className="card center reveal">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={t(`Portrait de ${m.name}`, `Portrait of ${m.name}`)} width={160} height={160} style={{ borderRadius: "50%", margin: "0 auto", objectFit: "cover" }} loading="lazy" />
                  ) : null}
                  <h3>{m.name}</h3>
                  <p className="muted">{m.role}</p>
                  {m.bio ? <p className="small">{m.bio}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <ToComplete block label={t("Noms, rôles et photos des responsables à fournir (avec leur accord de publication)", "Names, roles and photos of the leaders to be provided (with their consent to publication)")} />
          )}
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="statut">
        <div className="container container-narrow">
          <SectionHead eyebrow={t("Informations légales", "Legal information")} title={t("Statut juridique et enregistrement", "Legal status and registration")} id="statut" />
          <dl className="info-list reveal">
            <div><dt>{t("Forme juridique", "Legal form")}</dt><dd><ValueOr value={legal.legalForm} label={tc} /></dd></div>
            <div><dt>{t("N° d'enregistrement", "Registration number")}</dt><dd><ValueOr value={legal.registrationNumber} label={tc} /></dd></div>
            <div><dt>{t("Autorité d'enregistrement", "Registration authority")}</dt><dd><ValueOr value={legal.registrationAuthority} label={tc} /></dd></div>
            <div><dt>NINEA</dt><dd><ValueOr value={legal.ninea} label={tc} /></dd></div>
            <div><dt>{t("Date de création", "Date founded")}</dt><dd><ValueOr value={legal.foundedOn ? formatDate(legal.foundedOn, locale) : null} label={tc} /></dd></div>
            <div><dt>{t("Siège", "Head office")}</dt><dd><ValueOr value={legal.headquarters} label={tc} /></dd></div>
            <div><dt>{t("Zones d'intervention", "Areas of work")}</dt><dd><ValueOr value={site.interventionZones.length ? site.interventionZones.join(", ") : null} label={tc} /></dd></div>
          </dl>
          <div className="mt-3">
            <Notice tone="info">
              <p>{t("Ces informations sont publiées uniquement à partir de documents officiels transmis par la fondation.", "This information is published only from official documents provided by the foundation.")}</p>
            </Notice>
          </div>
        </div>
      </section>

      {partners.length > 0 ? (
        <section className="section" aria-labelledby="partenaires">
          <div className="container">
            <SectionHead eyebrow={t("Ils nous soutiennent", "They support us")} title={t("Nos partenaires", "Our partners")} id="partenaires" />
            <ul className="grid grid-4" role="list">
              {partners.map((p) => (
                <li key={p.name} className="card center">{p.url ? <a href={p.url} rel="noopener noreferrer">{p.name}</a> : p.name}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section-tight">
        <div className="container">
          <DonateBand title={t("Rejoignez le mouvement", "Join the movement")} text={t("Donateurs, bénévoles et partenaires : chacun peut contribuer à construire un avenir durable.", "Donors, volunteers and partners: everyone can help build a sustainable future.")} />
          <p className="center mt-3"><Link href="/engagez-vous" className="link-arrow">{t("Découvrir les façons de s'engager", "Discover ways to get involved")}</Link></p>
        </div>
      </section>
    </>
  );
}
