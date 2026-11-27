import { DonateBand, PageHero, ProgrammeCard } from "@/components/ui";
import { getPublicProgrammes } from "@/content/programmes";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Nos programmes", "Our programmes"),
    description: t(
      "Éducation, santé, urgences, solidarité, autonomisation et développement local : les programmes de la Fondation Horizon Solidaire au Sénégal.",
      "Education, health, emergencies, solidarity, empowerment and local development: the programmes of Fondation Horizon Solidaire in Senegal.",
    ),
    path: "/programmes",
    locale,
  });
}

export default async function ProgrammesPage() {
  const { locale, t } = await i18n();
  const programmes = getPublicProgrammes(locale);
  return (
    <>
      <PageHero
        title={t("Nos programmes", "Our programmes")}
        eyebrow={t("Domaines d'action", "Areas of action")}
        lead={t(
          "Nos programmes regroupent des actions concrètes. Pour chacune, nous publions les dates, les lieux, les photos et, une fois validés, les budgets.",
          "Our programmes bring together concrete actions. For each one, we publish the dates, places, photos and, once validated, the budgets.",
        )}
        crumbs={[{ label: t("Nos programmes", "Our programmes") }]}
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.slug} programme={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-tight">
        <div className="container"><DonateBand /></div>
      </section>
    </>
  );
}
