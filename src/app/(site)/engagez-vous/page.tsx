import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/ui";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Bénévolat et partenariats", "Volunteering and partnerships"),
    description: t("Devenez bénévole ou partenaire de la Fondation Horizon Solidaire au Sénégal.", "Become a volunteer or partner of Fondation Horizon Solidaire in Senegal."),
    path: "/engagez-vous",
    locale,
  });
}

export default async function EngagePage() {
  const { locale, t } = await i18n();
  return (
    <>
      <PageHero
        title={t("Engagez-vous à nos côtés", "Get involved with us")}
        eyebrow={t("Agir avec nous", "Get involved")}
        lead={t(
          "Votre temps, vos compétences ou votre organisation peuvent faire la différence. Choisissez la forme d'engagement qui vous ressemble.",
          "Your time, your skills or your organisation can make a difference. Choose the kind of involvement that suits you.",
        )}
        crumbs={[{ label: t("Bénévolat et partenariats", "Volunteering and partnerships") }]}
      />

      <section className="section" id="benevolat" aria-labelledby="benevolat-title">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="icon-tile accent-sun"><Icon name="users" /></div>
            <h2 id="benevolat-title" className="mt-2">{t("Devenir bénévole", "Become a volunteer")}</h2>
            <p className="lead">{t("Ponctuellement ou régulièrement, sur le terrain ou à distance.", "Occasionally or regularly, on the ground or remotely.")}</p>
            <ul className="checklist">
              <li>{t("Soutien scolaire et animation d'ateliers", "Tutoring and running workshops")}</li>
              <li>{t("Logistique lors des distributions et événements", "Logistics at distributions and events")}</li>
              <li>{t("Communication, photo, rédaction", "Communication, photography, writing")}</li>
              <li>{t("Compétences professionnelles (santé, gestion, informatique…)", "Professional skills (health, management, IT…)")}</li>
            </ul>
            <p className="small muted">{t("Les missions proposées dépendent des projets en cours. Nous vous recontactons pour en discuter.", "The missions on offer depend on current projects. We will get back to you to discuss them.")}</p>
          </div>
          <ContactForm locale={locale} initialType="benevolat" lockType title={t("Formulaire de bénévolat", "Volunteering form")} />
        </div>
      </section>

      <section className="section section-warm" id="partenariat" aria-labelledby="partenariat-title">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="icon-tile accent-teal"><Icon name="handshake" /></div>
            <h2 id="partenariat-title" className="mt-2">{t("Proposer un partenariat", "Propose a partnership")}</h2>
            <p className="lead">{t("Entreprises, fondations, associations, collectivités : agissons ensemble.", "Companies, foundations, associations, local authorities: let's act together.")}</p>
            <ul className="checklist">
              <li>{t("Financement d'un projet ou d'un programme", "Funding a project or a programme")}</li>
              <li>{t("Mécénat de compétences ou dons en nature", "Skills sponsorship or in-kind donations")}</li>
              <li>{t("Mise en œuvre conjointe sur le terrain", "Joint work on the ground")}</li>
              <li>{t("Mobilisation de vos collaborateurs", "Involving your staff")}</li>
            </ul>
            <p className="small muted">{t("Chaque partenariat fait l'objet d'un accord écrit précisant les engagements de chacun et les modalités de compte rendu.", "Each partnership is covered by a written agreement setting out each party's commitments and how results are reported.")}</p>
          </div>
          <ContactForm locale={locale} initialType="partenariat" lockType title={t("Formulaire de partenariat", "Partnership form")} />
        </div>
      </section>
    </>
  );
}
