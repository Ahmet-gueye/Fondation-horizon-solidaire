import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RevealObserver } from "@/components/Reveal";
import { i18n } from "@/i18n/server";

/** Habillage du site public : en-tête, pied de page et animations. */
export async function PublicShell({ children }: { children: React.ReactNode }) {
  const { locale, t } = await i18n();
  return (
    <>
      <a href="#contenu" className="skip-link">{t("Aller au contenu principal", "Skip to main content")}</a>
      <Header locale={locale} />
      <main id="contenu" tabIndex={-1} lang={locale}>
        {children}
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
