import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Notice, ToComplete } from "@/components/Markers";
import { DonateBand, PageHero, SectionHead } from "@/components/ui";
import { documentCategories, documents, transparencyUpdatedAt } from "@/content/rapports";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Transparence et rapports",
  description: "Comment les dons sont reçus, affectés, utilisés et contrôlés. Rapports annuels, bilans financiers et budgets de projets.",
  path: "/transparence",
});

const journey = [
  { title: "Réception du don", text: "Le don en ligne n'est pas encore ouvert. Lorsqu'il le sera, le paiement passera par la plateforme sécurisée PayTech, et un don ne sera enregistré comme reçu qu'après confirmation directe de PayTech à notre serveur." },
  { title: "Enregistrement et affectation", text: "Chaque don reçoit une référence unique. Il est affecté au projet ou au programme choisi, ou aux besoins prioritaires s'il n'est pas affecté." },
  { title: "Décision et engagement", text: "Les dépenses sont engagées selon le budget du projet, validé au préalable, et justifiées par des pièces comptables." },
  { title: "Mise en œuvre sur le terrain", text: "Les actions sont menées avec les partenaires locaux et les bénéficiaires, avec un suivi des étapes." },
  { title: "Compte rendu public", text: "Les montants reçus, les dépenses et les résultats sont publiés sur les fiches d'activités et de campagnes et dans les rapports, uniquement après validation par la fondation, avec leur date de mise à jour." },
];

export default function TransparencyPage() {
  return (
    <>
      <PageHero
        title="Transparence et rapports"
        eyebrow="Rendre des comptes"
        lead="La confiance se construit avec des informations vérifiables. Voici comment chaque don est suivi, et où consulter nos documents."
        crumbs={[{ label: "Transparence" }]}
      >
        <p className="small muted mt-2">
          Dernière mise à jour de cette page : {transparencyUpdatedAt ? <time dateTime={transparencyUpdatedAt}>{formatDate(transparencyUpdatedAt)}</time> : <ToComplete label="date à renseigner" />}
        </p>
      </PageHero>

      <section className="section" aria-labelledby="parcours">
        <div className="container container-narrow">
          <SectionHead eyebrow="Le parcours d'un don" title="De votre don à son utilisation" id="parcours" />
          <ol className="steps reveal">
            {journey.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
          <p className="small muted mt-3">Processus présenté à titre de cadre ; ses modalités précises (validation, contrôle, frais de fonctionnement) seront détaillées dans la politique de dons de la fondation.</p>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="documents">
        <div className="container">
          <SectionHead eyebrow="Documents" title="Rapports, bilans et politiques" id="documents" lead="Seuls des documents réels et validés par la fondation sont publiés ici." />
          <div className="grid grid-2">
            {documentCategories.map((cat) => {
              const docs = documents.filter((d) => d.category === cat.name).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
              return (
                <div key={cat.name} className="card reveal">
                  <div className="row-wrap"><div className="icon-tile accent-blue"><Icon name="doc" /></div><h3>{cat.name}</h3></div>
                  <p>{cat.description}</p>
                  {docs.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {docs.map((d) => (
                        <li key={d.file} style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                          <a href={d.file} download>{d.title}</a>{d.sizeLabel ? <span className="small muted"> ({d.sizeLabel})</span> : null}
                          <div className="small muted">
                            Publié le {formatDate(d.publishedAt)}{d.updatedAt ? ` · mis à jour le ${formatDate(d.updatedAt)}` : ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted small">Aucun document publié pour le moment.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fiscalite">
        <div className="container container-narrow stack">
          <h2 id="fiscalite">Reçus et fiscalité</h2>
          <Notice tone="warn" title="Avertissement">
            <p>
              La délivrance de reçus fiscaux et les éventuels avantages fiscaux liés à un don dépendent du statut juridique
              réel de la fondation et de la législation applicable dans votre pays de résidence. Aucune déductibilité n&apos;est
              garantie à ce stade. Ces informations seront précisées par la fondation dès validation.
            </p>
          </Notice>
          <p>
            Vous souhaitez consulter un document en particulier ou poser une question sur l&apos;utilisation des fonds ?{" "}
            <Link href="/contact">Contactez-nous</Link>.
          </p>
        </div>
      </section>

      <section className="section-tight"><div className="container"><DonateBand /></div></section>
    </>
  );
}
