import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RevealObserver } from "@/components/Reveal";
import { getDictionary } from "@/i18n";

const t = getDictionary();

/** Habillage du site public : en-tête, pied de page et animations. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#contenu" className="skip-link">{t.skipToContent}</a>
      <Header />
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
