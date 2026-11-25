import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
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
            <li><Link href="/projets">Voir nos projets</Link></li>
            <li><Link href="/contact">Nous contacter</Link></li>
          </ul>
          <Link href="/faire-un-don" className="btn btn-sun mt-2"><Icon name="heart" />Faire un don</Link>
        </div>
      </div>
    </section>
  );
}
