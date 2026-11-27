import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Notice, ToComplete } from "@/components/Markers";
import { DonateBand, PageHero, SectionHead } from "@/components/ui";
import { documentCategories, documents, transparencyUpdatedAt } from "@/content/rapports";
import { i18n } from "@/i18n/server";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Transparence et rapports", "Transparency and reports"),
    description: t(
      "Comment les dons sont reçus, affectés, utilisés et contrôlés. Rapports annuels, bilans financiers et budgets de projets.",
      "How donations are received, allocated, used and checked. Annual reports, financial statements and project budgets.",
    ),
    path: "/transparence",
    locale,
  });
}

export default async function TransparencyPage() {
  const { locale, t } = await i18n();
  const en = locale === "en";
  const journey = [
    {
      title: t("Réception du don", "Receiving the donation"),
      text: t(
        "Le don en ligne n'est pas encore ouvert. Lorsqu'il le sera, le paiement passera par la plateforme sécurisée PayTech, et un don ne sera enregistré comme reçu qu'après confirmation directe de PayTech à notre serveur.",
        "Online giving is not open yet. When it is, payment will go through the secure PayTech platform, and a donation will only be recorded as received after PayTech confirms it directly to our server.",
      ),
    },
    {
      title: t("Enregistrement et affectation", "Recording and allocation"),
      text: t(
        "Chaque don reçoit une référence unique. Il est affecté au projet ou au programme choisi, ou aux besoins prioritaires s'il n'est pas affecté.",
        "Each donation receives a unique reference. It is allocated to the chosen project or programme, or to priority needs if none was chosen.",
      ),
    },
    {
      title: t("Décision et engagement", "Decision and commitment"),
      text: t(
        "Les dépenses sont engagées selon le budget du projet, validé au préalable, et justifiées par des pièces comptables.",
        "Spending follows the project budget, approved in advance, and is backed by accounting records.",
      ),
    },
    {
      title: t("Mise en œuvre sur le terrain", "Work on the ground"),
      text: t(
        "Les actions sont menées avec les partenaires locaux et les bénéficiaires, avec un suivi des étapes.",
        "Actions are carried out with local partners and the people concerned, with each step monitored.",
      ),
    },
    {
      title: t("Compte rendu public", "Public reporting"),
      text: t(
        "Les montants reçus, les dépenses et les résultats sont publiés sur les fiches d'activités et de campagnes et dans les rapports, uniquement après validation par la fondation, avec leur date de mise à jour.",
        "Amounts received, spending and results are published on the activity and campaign pages and in the reports, only after validation by the foundation, with the date they were updated.",
      ),
    },
  ];

  return (
    <>
      <PageHero
        title={t("Transparence et rapports", "Transparency and reports")}
        eyebrow={t("Rendre des comptes", "Accountability")}
        lead={t(
          "La confiance se construit avec des informations vérifiables. Voici comment chaque don est suivi, et où consulter nos documents.",
          "Trust is built on verifiable information. Here is how each donation is tracked, and where to find our documents.",
        )}
        crumbs={[{ label: t("Transparence", "Transparency") }]}
      >
        <p className="small muted mt-2">
          {t("Dernière mise à jour de cette page :", "This page was last updated:")}{" "}
          {transparencyUpdatedAt ? <time dateTime={transparencyUpdatedAt}>{formatDate(transparencyUpdatedAt, locale)}</time> : <ToComplete label={t("date à renseigner", "date to be added")} />}
        </p>
      </PageHero>

      <section className="section" aria-labelledby="parcours">
        <div className="container container-narrow">
          <SectionHead eyebrow={t("Le parcours d'un don", "The journey of a donation")} title={t("De votre don à son utilisation", "From your donation to how it is used")} id="parcours" />
          <ol className="steps reveal">
            {journey.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
          <p className="small muted mt-3">
            {t(
              "Processus présenté à titre de cadre ; ses modalités précises (validation, contrôle, frais de fonctionnement) seront détaillées dans la politique de dons de la fondation.",
              "This process is presented as a framework; its exact terms (approval, checks, running costs) will be set out in the foundation's donation policy.",
            )}
          </p>
        </div>
      </section>

      <section className="section section-warm" aria-labelledby="documents">
        <div className="container">
          <SectionHead
            eyebrow={t("Documents", "Documents")}
            title={t("Rapports, bilans et politiques", "Reports, statements and policies")}
            id="documents"
            lead={t("Seuls des documents réels et validés par la fondation sont publiés ici.", "Only real documents validated by the foundation are published here.")}
          />
          <div className="grid grid-2">
            {documentCategories.map((cat) => {
              const docs = documents.filter((d) => d.category === cat.name).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
              return (
                <div key={cat.name} className="card reveal">
                  <div className="row-wrap"><div className="icon-tile accent-blue"><Icon name="doc" /></div><h3>{en ? cat.nameEn : cat.name}</h3></div>
                  <p>{en ? cat.descriptionEn : cat.description}</p>
                  {docs.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {docs.map((d) => (
                        <li key={d.file} style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                          <a href={d.file} download>{d.title}</a>{d.sizeLabel ? <span className="small muted"> ({d.sizeLabel})</span> : null}
                          <div className="small muted">
                            {t("Publié le", "Published on")} {formatDate(d.publishedAt, locale)}
                            {d.updatedAt ? ` · ${t("mis à jour le", "updated on")} ${formatDate(d.updatedAt, locale)}` : ""}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted small">{t("Aucun document publié pour le moment.", "No documents published yet.")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="fiscalite">
        <div className="container container-narrow stack">
          <h2 id="fiscalite">{t("Reçus et fiscalité", "Receipts and tax")}</h2>
          <Notice tone="warn" title={t("Avertissement", "Please note")}>
            <p>
              {t(
                "La délivrance de reçus fiscaux et les éventuels avantages fiscaux liés à un don dépendent du statut juridique réel de la fondation et de la législation applicable dans votre pays de résidence. Aucune déductibilité n'est garantie à ce stade. Ces informations seront précisées par la fondation dès validation.",
                "Whether tax receipts can be issued, and any tax benefit linked to a donation, depends on the foundation's actual legal status and on the law of your country of residence. No tax deductibility is guaranteed at this stage. The foundation will provide this information once confirmed.",
              )}
            </p>
          </Notice>
          <p>
            {t(
              "Vous souhaitez consulter un document en particulier ou poser une question sur l'utilisation des fonds ?",
              "Would you like to see a specific document or ask a question about how funds are used?",
            )}{" "}
            <Link href="/contact">{t("Contactez-nous", "Contact us")}</Link>.
          </p>
        </div>
      </section>

      <section className="section-tight"><div className="container"><DonateBand /></div></section>
    </>
  );
}
