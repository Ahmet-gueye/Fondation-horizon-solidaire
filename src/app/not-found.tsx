import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PublicShell } from "@/components/PublicShell";
import { i18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await i18n();
  return { title: t("Page introuvable", "Page not found") };
}

export default async function NotFound() {
  const { t } = await i18n();
  return (
    <PublicShell>
      <section className="section">
        <div className="container">
          <div className="status-card">
            <div className="status-icon accent-sun"><Icon name="search" /></div>
            <p className="eyebrow">{t("Erreur 404", "Error 404")}</p>
            <h1 style={{ fontSize: "2rem" }}>{t("Cette page est introuvable", "This page cannot be found")}</h1>
            <p>{t("Le lien est peut-être erroné, ou la page a été déplacée. Voici quelques pistes :", "The link may be wrong, or the page may have moved. Here are a few suggestions:")}</p>
            <ul style={{ listStyle: "none", padding: 0 }} className="stack">
              <li><Link href="/">{t("Revenir à l'accueil", "Back to the home page")}</Link></li>
              <li><Link href="/programmes">{t("Découvrir nos programmes", "Discover our programmes")}</Link></li>
              <li><Link href="/activites">{t("Voir nos activités et campagnes", "See our activities and campaigns")}</Link></li>
              <li><Link href="/contact">{t("Nous contacter", "Contact us")}</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
