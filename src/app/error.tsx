"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="section">
      <div className="container">
        <div className="status-card" role="alert">
          <h1 style={{ fontSize: "1.8rem" }}>Un problème est survenu</h1>
          <p>La page n&apos;a pas pu s&apos;afficher correctement. Vous pouvez réessayer ou revenir à l&apos;accueil.</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="btn" onClick={() => reset()}>Réessayer</button>
            <Link href="/" className="btn btn-outline">Accueil</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
