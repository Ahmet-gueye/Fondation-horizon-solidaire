import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { ToComplete } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Contactez la Fondation Horizon Solidaire : demande générale, bénévolat, partenariat ou soutien à un projet.",
  path: "/contact",
});

const allowed = ["general", "benevolat", "partenariat", "projet"] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const type = allowed.find((t) => t === sp.type) ?? "general";
  const { contact } = site;
  return (
    <>
      <PageHero title="Contactez-nous" eyebrow="Échangeons" lead="Une question, une envie de vous engager, une idée de partenariat ? Écrivez-nous, nous vous répondrons." crumbs={[{ label: "Contact" }]} />
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <ContactForm key={type} initialType={type} />
          <aside className="stack">
            <div className="summary">
              <h2 style={{ fontSize: "1.25rem" }}>Coordonnées de la fondation</h2>
              <ul className="trust-list">
                <li><Icon name="mail" /><span>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <ToComplete label="E-mail officiel à compléter" />}</span></li>
                <li><Icon name="phone" /><span>{contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : <ToComplete label="Téléphone à compléter" />}</span></li>
                {contact.whatsapp ? <li><Icon name="phone" /><span>WhatsApp : {contact.whatsapp}</span></li> : null}
                <li><Icon name="pin" /><span>{contact.address ?? <ToComplete label="Adresse à compléter" />}</span></li>
                <li><Icon name="calendar" /><span>{contact.openingHours ?? <ToComplete label="Horaires à compléter" />}</span></li>
              </ul>
            </div>
            <p className="small muted">Vos données servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni cédées.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
