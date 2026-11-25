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

export const metadata = pageMetadata({
  title: "Qui sommes-nous ?",
  description: "Mission, vision, valeurs et méthode d'action de la Fondation Horizon Solidaire au Sénégal.",
  path: "/qui-sommes-nous",
});

const values = [
  { icon: "handshake", title: "Solidarité", text: "Nous croyons à la force de l'entraide et du collectif." },
  { icon: "shield", title: "Intégrité", text: "Nous rendons compte de nos actions et de l'usage des fonds." },
  { icon: "users", title: "Respect et dignité", text: "Chaque personne accompagnée est actrice de son propre parcours." },
  { icon: "developpement", title: "Durabilité", text: "Nous privilégions des solutions qui durent et respectent l'environnement." },
];

const method = [
  { title: "Écouter", text: "Identifier les besoins avec les communautés, les autorités locales et les acteurs de terrain." },
  { title: "Concevoir", text: "Définir des objectifs mesurables, un budget et un calendrier pour chaque projet." },
  { title: "Agir", text: "Mettre en œuvre avec des partenaires locaux et des bénévoles, au plus près des bénéficiaires." },
  { title: "Rendre compte", text: "Mesurer les résultats et publier les informations financières et les rapports." },
];

export default function AboutPage() {
  const { legal } = site;
  return (
    <>
      <PageHero
        title="Qui sommes-nous ?"
        eyebrow="La fondation"
        lead="Une fondation engagée au Sénégal pour l'éducation, la santé, la solidarité et le développement durable des communautés."
        crumbs={[{ label: "Qui sommes-nous ?" }]}
      />

      <section className="section" aria-labelledby="mission">
        <div className="container split">
          <div className="reveal">
            <p className="eyebrow">Mission et vision</p>
            <h2 id="mission">Notre raison d&apos;être</h2>
            <h3>Mission</h3>
            <p>
              Améliorer durablement les conditions de vie des personnes et des communautés vulnérables au Sénégal, à travers
              l&apos;éducation, la santé, l&apos;aide humanitaire, la solidarité et le développement local.
            </p>
            <h3>Vision</h3>
            <p>
              Un Sénégal où chacun peut apprendre, se soigner, être protégé et participer au développement de sa communauté.
              Notre devise le résume : « {site.motto} ».
            </p>
            <p className="small muted">Textes proposés à partir de l&apos;identité de la fondation, à valider par ses instances.</p>
          </div>
          <div className="center reveal">
            <Logo size="lg" />
            <p className="small muted mt-2">{site.logo.src ? site.logo.alt : "Emplacement réservé au logo officiel de la fondation."}</p>
          </div>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="valeurs">
        <div className="container">
          <SectionHead eyebrow="Nos valeurs" title="Ce qui guide chacune de nos actions" id="valeurs" />
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
          <SectionHead eyebrow="Méthode d'action" title="Comment nous travaillons" id="methode" />
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
          <SectionHead eyebrow="Historique" title="Notre parcours" id="historique" />
          {history.length > 0 ? (
            <ol className="steps">
              {history.map((h) => (
                <li key={h.date + h.text}>
                  <h3><time dateTime={h.date}>{formatDate(h.date)}</time></h3>
                  <p>{h.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ToComplete block label="Historique daté de la fondation à compléter (création, étapes clés)" />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="equipe">
        <div className="container">
          <SectionHead eyebrow="Gouvernance" title="Responsables et équipe" id="equipe" />
          {team.length > 0 ? (
            <div className="grid grid-4">
              {team.map((m) => (
                <div key={m.name} className="card center reveal">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={`Portrait de ${m.name}`} width={160} height={160} style={{ borderRadius: "50%", margin: "0 auto", objectFit: "cover" }} loading="lazy" />
                  ) : null}
                  <h3>{m.name}</h3>
                  <p className="muted">{m.role}</p>
                  {m.bio ? <p className="small">{m.bio}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <ToComplete block label="Noms, rôles et photos des responsables à fournir (avec leur accord de publication)" />
          )}
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="statut">
        <div className="container container-narrow">
          <SectionHead eyebrow="Informations légales" title="Statut juridique et enregistrement" id="statut" />
          <dl className="info-list reveal">
            <div><dt>Forme juridique</dt><dd><ValueOr value={legal.legalForm} /></dd></div>
            <div><dt>N° d&apos;enregistrement</dt><dd><ValueOr value={legal.registrationNumber} /></dd></div>
            <div><dt>Autorité d&apos;enregistrement</dt><dd><ValueOr value={legal.registrationAuthority} /></dd></div>
            <div><dt>NINEA</dt><dd><ValueOr value={legal.ninea} /></dd></div>
            <div><dt>Date de création</dt><dd><ValueOr value={legal.foundedOn ? formatDate(legal.foundedOn) : null} /></dd></div>
            <div><dt>Siège</dt><dd><ValueOr value={legal.headquarters} /></dd></div>
            <div><dt>Zones d&apos;intervention</dt><dd><ValueOr value={site.interventionZones.length ? site.interventionZones.join(", ") : null} /></dd></div>
          </dl>
          <div className="mt-3">
            <Notice tone="info">
              <p>Ces informations sont publiées uniquement à partir de documents officiels transmis par la fondation.</p>
            </Notice>
          </div>
        </div>
      </section>

      {partners.length > 0 ? (
        <section className="section" aria-labelledby="partenaires">
          <div className="container">
            <SectionHead eyebrow="Ils nous soutiennent" title="Nos partenaires" id="partenaires" />
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
          <DonateBand title="Rejoignez le mouvement" text="Donateurs, bénévoles et partenaires : chacun peut contribuer à construire un avenir durable." />
          <p className="center mt-3"><Link href="/engagez-vous" className="link-arrow">Découvrir les façons de s&apos;engager</Link></p>
        </div>
      </section>
    </>
  );
}
