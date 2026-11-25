import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bénévolat et partenariats",
  description: "Devenez bénévole ou partenaire de la Fondation Horizon Solidaire au Sénégal.",
  path: "/engagez-vous",
});

export default function EngagePage() {
  return (
    <>
      <PageHero title="Engagez-vous à nos côtés" eyebrow="Agir avec nous" lead="Votre temps, vos compétences ou votre organisation peuvent faire la différence. Choisissez la forme d'engagement qui vous ressemble." crumbs={[{ label: "Bénévolat et partenariats" }]} />

      <section className="section" id="benevolat" aria-labelledby="benevolat-title">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="icon-tile accent-sun"><Icon name="users" /></div>
            <h2 id="benevolat-title" className="mt-2">Devenir bénévole</h2>
            <p className="lead">Ponctuellement ou régulièrement, sur le terrain ou à distance.</p>
            <ul className="checklist">
              <li>Soutien scolaire et animation d&apos;ateliers</li>
              <li>Logistique lors des distributions et événements</li>
              <li>Communication, photo, rédaction</li>
              <li>Compétences professionnelles (santé, gestion, informatique…)</li>
            </ul>
            <p className="small muted">Les missions proposées dépendent des projets en cours. Nous vous recontactons pour en discuter.</p>
          </div>
          <ContactForm initialType="benevolat" lockType title="Formulaire de bénévolat" />
        </div>
      </section>

      <section className="section section-warm" id="partenariat" aria-labelledby="partenariat-title">
        <div className="container split" style={{ alignItems: "start" }}>
          <div>
            <div className="icon-tile accent-teal"><Icon name="handshake" /></div>
            <h2 id="partenariat-title" className="mt-2">Proposer un partenariat</h2>
            <p className="lead">Entreprises, fondations, associations, collectivités : agissons ensemble.</p>
            <ul className="checklist">
              <li>Financement d&apos;un projet ou d&apos;un programme</li>
              <li>Mécénat de compétences ou dons en nature</li>
              <li>Mise en œuvre conjointe sur le terrain</li>
              <li>Mobilisation de vos collaborateurs</li>
            </ul>
            <p className="small muted">Chaque partenariat fait l&apos;objet d&apos;un accord écrit précisant les engagements de chacun et les modalités de compte rendu.</p>
          </div>
          <ContactForm initialType="partenariat" lockType title="Formulaire de partenariat" />
        </div>
      </section>
    </>
  );
}
