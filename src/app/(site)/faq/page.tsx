import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getFaq } from "@/content/faq";
import { i18n } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, t } = await i18n();
  return pageMetadata({
    title: t("Questions fréquentes", "Frequently asked questions"),
    description: t(
      "Réponses aux questions fréquentes sur les dons, la transparence et l'engagement auprès de la Fondation Horizon Solidaire.",
      "Answers to frequently asked questions about donations, transparency and getting involved with Fondation Horizon Solidaire.",
    ),
    path: "/faq",
    locale,
  });
}

export default async function FaqPage() {
  const { locale, t } = await i18n();
  const faq = getFaq(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
  return (
    <>
      <PageHero title={t("Questions fréquentes", "Frequently asked questions")} eyebrow="FAQ" crumbs={[{ label: t("Questions fréquentes", "FAQ") }]} />
      <section className="section">
        <div className="container container-narrow">
          <div className="faq">
            {faq.map((q) => (
              <details key={q.question}>
                <summary>{q.question}</summary>
                <div><p className="mb-0">{q.answer}</p></div>
              </details>
            ))}
          </div>
          <p className="mt-4">
            {t("Vous ne trouvez pas votre réponse ?", "Can't find your answer?")} <Link href="/contact">{t("Posez-nous votre question", "Ask us your question")}</Link>.
          </p>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
