import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { EmailLinks, ToComplete } from "@/components/Markers";
import { PageHero } from "@/components/ui";
import { site } from "@/config/site";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Contact", "Contact"),
    description: t(
      "Contactez la Fondation Horizon Solidaire : demande générale, bénévolat, partenariat ou soutien à un projet.",
      "Contact Fondation Horizon Solidaire: general enquiry, volunteering, partnership or support for a project.",
    ),
    path: "/contact",
    locale,
  });
}

const allowed = ["general", "benevolat", "partenariat", "projet"] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { locale, t } = await i18n();
  const type = allowed.find((v) => v === sp.type) ?? "general";
  const sujet = typeof sp.sujet === "string" ? sp.sujet.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 120) : "";
  const { contact } = site;
  return (
    <>
      <PageHero
        title={t("Contactez-nous", "Contact us")}
        eyebrow={t("Échangeons", "Let's talk")}
        lead={t(
          "Une question, une envie de vous engager, une idée de partenariat ? Écrivez-nous, nous vous répondrons.",
          "A question, a wish to get involved, an idea for a partnership? Write to us and we will reply.",
        )}
        crumbs={[{ label: t("Contact", "Contact") }]}
      />
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <ContactForm key={`${type}-${sujet}-${locale}`} locale={locale} initialType={type} initialMessage={sujet ? `${t("Au sujet de :", "About:")} ${sujet}\n\n` : ""} />
          <aside className="stack">
            <div className="summary">
              <h2 style={{ fontSize: "1.25rem" }}>{t("Coordonnées de la fondation", "Foundation contact details")}</h2>
              <ul className="trust-list">
                <li><Icon name="mail" /><span><EmailLinks emails={contact.emails} label={t("E-mail officiel à compléter", "Official email to be added")} /></span></li>
                <li><Icon name="phone" /><span>{contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : <ToComplete label={t("Téléphone à compléter", "Phone number to be added")} />}</span></li>
                {contact.whatsapp ? <li><Icon name="phone" /><span>WhatsApp : {contact.whatsapp}</span></li> : null}
                <li><Icon name="pin" /><span>{contact.address ?? <ToComplete label={t("Adresse à compléter", "Address to be added")} />}</span></li>
                <li><Icon name="calendar" /><span>{contact.openingHours ?? <ToComplete label={t("Horaires à compléter", "Opening hours to be added")} />}</span></li>
              </ul>
            </div>
            <p className="small muted">{t("Vos données servent uniquement à répondre à votre demande. Elles ne sont ni vendues ni cédées.", "Your data is only used to answer your request. It is never sold or passed on.")}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
