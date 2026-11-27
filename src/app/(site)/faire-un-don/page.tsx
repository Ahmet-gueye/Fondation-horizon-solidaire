import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EmailLinks, Notice, ToComplete } from "@/components/Markers";
import { DonationForm } from "@/components/DonationForm";
import { PageHero } from "@/components/ui";
import { donationConfig } from "@/config/donations";
import { site } from "@/config/site";
import { getPublicProgrammes } from "@/content/programmes";
import { i18n } from "@/i18n/server";
import { currentUser } from "@/lib/auth/session";
import { getPublicFicheBySlug } from "@/lib/fiches/repo";
import { paymentMode } from "@/lib/payments/dons";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  const open = paymentMode() === "prod";
  return pageMetadata({
    title: t("Soutenir la fondation", "Support the foundation"),
    description: open
      ? t("Faites un don en ligne sécurisé à la Fondation Horizon Solidaire, via PayTech.", "Make a secure online donation to Fondation Horizon Solidaire, through PayTech.")
      : t(
          "Le paiement en ligne sera bientôt disponible. Découvrez comment soutenir dès maintenant la Fondation Horizon Solidaire.",
          "Online payment will be available soon. Find out how you can support Fondation Horizon Solidaire right now.",
        ),
    path: "/faire-un-don",
    locale,
  });
}

export default async function DonatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale, t } = await i18n();
  const sp = await searchParams;
  const phone = site.contact.phone;
  const mode = paymentMode();
  const showForm = mode === "prod" || (mode === "test" && Boolean(await currentUser()));
  const programmes = getPublicProgrammes(locale);
  const programmeParam = typeof sp.programme === "string" && programmes.some((p) => p.slug === sp.programme) ? sp.programme : "";
  const fiche = typeof sp.campagne === "string" && /^[a-z0-9-]{1,80}$/.test(sp.campagne) ? await getPublicFicheBySlug(sp.campagne) : null;

  if (showForm) {
    return (
      <>
        <PageHero
          title={t("Faire un don", "Make a donation")}
          eyebrow={t("Soutenir la fondation", "Support the foundation")}
          lead={t(
            "Merci de soutenir nos actions au Sénégal. Le paiement se fait sur la page sécurisée de PayTech, avec les moyens de paiement qu'elle vous propose.",
            "Thank you for supporting our work in Senegal. Payment is made on PayTech's secure page, using the payment methods it offers you.",
          )}
          crumbs={[{ label: t("Faire un don", "Donate") }]}
        />
        <section className="section">
          <div className="container split" style={{ alignItems: "start" }}>
            <div className="stack">
              {mode === "test" ? (
                <Notice tone="warn" title={t("Mode test PayTech", "PayTech test mode")}>
                  <p>
                    {t(
                      "Ce formulaire n'est visible que par les personnes connectées à l'administration. En mode test, PayTech débite un petit montant (environ 100 à 150 FCFA), quel que soit le montant choisi. Les visiteurs voient toujours la page « bientôt disponible ».",
                      "This form is only visible to people signed in to the administration. In test mode, PayTech charges a small amount (about 100 to 150 FCFA), whatever amount is chosen. Visitors still see the “coming soon” page.",
                    )}
                  </p>
                </Notice>
              ) : null}
              <DonationForm
                locale={locale}
                currencies={donationConfig.currencies.map((c) => ({ code: c.code, label: locale === "en" ? c.labelEn : c.label, min: c.min, max: c.max }))}
                suggested={donationConfig.suggestedAmounts}
                programmes={programmes.map((p) => ({ slug: p.slug, title: p.title }))}
                initialProgramme={programmeParam}
                campagne={fiche ? { slug: fiche.slug, title: fiche.title } : null}
              />
            </div>
            <aside className="stack">
              <div className="summary">
                <h2 style={{ fontSize: "1.2rem" }}>{t("Votre don en toute confiance", "Give with confidence")}</h2>
                <ul className="checklist">
                  <li>{t("Paiement sur la plateforme sécurisée PayTech", "Payment on PayTech's secure platform")}</li>
                  <li>{t("Aucune donnée de carte ou de Mobile Money sur notre site", "No card or Mobile Money data on our website")}</li>
                  <li>{t("Chaque don reçoit une référence unique", "Every donation gets a unique reference")}</li>
                  <li>{t("Utilisation des fonds publiée sur la page Transparence", "Use of funds published on the Transparency page")}</li>
                </ul>
                <Link href="/transparence" className="link-arrow">{t("Comment les dons sont utilisés", "How donations are used")}</Link>
              </div>
              <div className="summary">
                <h2 style={{ fontSize: "1.1rem" }}>{t("Une question ?", "A question?")}</h2>
                <ul className="contact-list">
                  {phone ? <li><Icon name="phone" /><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li> : null}
                  <li><Icon name="mail" /><EmailLinks emails={site.contact.emails} /></li>
                </ul>
                <p className="small muted mb-0">
                  {t(
                    "Méfiez-vous de toute demande de paiement qui ne viendrait pas de ce site ou des contacts officiels ci-dessus.",
                    "Be wary of any payment request that does not come from this website or from the official contacts above.",
                  )}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={t("Soutenir la fondation", "Support the foundation")}
        eyebrow={t("Faire un don", "Donate")}
        lead={t(
          "Merci de votre envie de soutenir nos actions au Sénégal. Le don en ligne est en cours de préparation.",
          "Thank you for wanting to support our work in Senegal. Online giving is being prepared.",
        )}
        crumbs={[{ label: t("Soutenir la fondation", "Support the foundation") }]}
      />
      <section className="section">
        <div className="container container-narrow stack">
          <Notice tone="info" title={t("Le paiement en ligne sera bientôt disponible", "Online payment will be available soon")}>
            <p>
              {t(
                "Aucun don ne peut actuellement être encaissé sur ce site. Le site ne vous demandera jamais vos coordonnées bancaires, votre numéro de carte ou votre code Mobile Money.",
                "No donation can currently be collected on this website. The website will never ask for your bank details, your card number or your Mobile Money code.",
              )}
            </p>
          </Notice>

          <div className="card">
            <div className="icon-tile accent-green"><Icon name="mail" /></div>
            <h2 style={{ fontSize: "1.35rem" }}>{t("Vous souhaitez nous soutenir dès maintenant ?", "Would you like to support us now?")}</h2>
            <p>
              {t(
                "Contactez directement la fondation : l'équipe vous indiquera les moyens de soutien possibles pour le moment (don, dons en nature, mécénat de compétences, partenariat).",
                "Contact the foundation directly: the team will tell you the ways you can help for now (donation, in-kind donations, skills sponsorship, partnership).",
              )}
            </p>
            <ul className="contact-list">
              {phone ? (
                <li><Icon name="phone" /><a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>
              ) : (
                <li><Icon name="phone" /><ToComplete label={t("Téléphone à compléter", "Phone number to be added")} /></li>
              )}
              <li><Icon name="mail" /><EmailLinks emails={site.contact.emails} /></li>
            </ul>
            <div className="row-wrap mt-2">
              <Link href="/contact?type=projet" className="btn"><Icon name="mail" />{t("Écrire à la fondation", "Write to the foundation")}</Link>
              <Link href="/engagez-vous" className="btn btn-outline">{t("Donner de son temps", "Give your time")}</Link>
            </div>
            <p className="small muted mb-0">
              {t(
                "Pour votre sécurité : la fondation ne publie aucune coordonnée de paiement sur ce site pour le moment. Méfiez-vous de toute demande de paiement qui ne viendrait pas des contacts officiels ci-dessus.",
                "For your safety: the foundation does not publish any payment details on this website for the moment. Be wary of any payment request that does not come from the official contacts above.",
              )}
            </p>
          </div>

          <div className="card">
            <h2 style={{ fontSize: "1.2rem" }}>{t("Ce qui est prévu", "What is planned")}</h2>
            <p>
              {t(
                "Le don en ligne passera par la plateforme de paiement sécurisée PayTech, dès que le compte de la fondation sera activé et testé. Les devises envisagées sont :",
                "Online giving will go through the secure PayTech payment platform, as soon as the foundation's account has been activated and tested. The currencies being considered are:",
              )}{" "}
              {donationConfig.currencies.map((c) => `${locale === "en" ? c.labelEn : c.label} (${c.code})`).join(", ")}.
            </p>
            <p className="small muted mb-0">
              {t(
                "Ces devises et moyens de paiement ne sont pas encore disponibles. Cette page sera mise à jour lorsque le paiement en ligne sera ouvert.",
                "These currencies and payment methods are not available yet. This page will be updated when online payment opens.",
              )}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
