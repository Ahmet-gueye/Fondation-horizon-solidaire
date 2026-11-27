"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Page d'erreur (composant navigateur) : la langue est lue sur la balise <html lang>. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [en, setEn] = useState(false);
  useEffect(() => setEn(document.documentElement.lang === "en"), []);
  return (
    <section className="section">
      <div className="container">
        <div className="status-card" role="alert">
          <h1 style={{ fontSize: "1.8rem" }}>{en ? "Something went wrong" : "Un problème est survenu"}</h1>
          <p>{en ? "The page could not be displayed properly. You can try again or go back to the home page." : "La page n'a pas pu s'afficher correctement. Vous pouvez réessayer ou revenir à l'accueil."}</p>
          <div className="hero-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="btn" onClick={() => reset()}>{en ? "Try again" : "Réessayer"}</button>
            <Link href="/" className="btn btn-outline">{en ? "Home" : "Accueil"}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
