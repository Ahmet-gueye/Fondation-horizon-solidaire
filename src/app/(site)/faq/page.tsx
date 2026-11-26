import Link from "next/link";
import { PageHero } from "@/components/ui";
import { faq } from "@/content/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Questions fréquentes", description: "Réponses aux questions fréquentes sur les dons, la transparence et l'engagement auprès de la Fondation Horizon Solidaire.", path: "/faq" });

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
  return (
    <>
      <PageHero title="Questions fréquentes" eyebrow="FAQ" crumbs={[{ label: "Questions fréquentes" }]} />
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
          <p className="mt-4">Vous ne trouvez pas votre réponse ? <Link href="/contact">Posez-nous votre question</Link>.</p>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
