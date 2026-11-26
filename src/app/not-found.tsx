import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PublicShell } from "@/components/PublicShell";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <PublicShell>
      <section className="section">
        <div className="container">
          <div className="status-card">
            <div className="status-icon accent-sun"><Icon name="search" /></div>
            <p className="eyebrow">Erreur 404</p>
            <h1 style={{ fontSize: "2rem" }}>Cette page est introuvable</h1>
            <p>Le lien est peut-être erroné, ou la page a été déplacée. Voici quelques pistes :</p>
            <ul style={{ listStyle: "none", padding: 0 }} className="stack">
              <li><Link href="/">Revenir à l&apos;accueil</Link></li>
              <li><Link href="/programmes">Découvrir nos programmes</Link></li>
              <li><Link href="/activites">Voir nos activités et campagnes</Link></li>
              <li><Link href="/contact">Nous contacter</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
