"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/config/site";
import { locales, makeT, type Locale, type T } from "@/i18n";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function LanguageSwitcher({ locale, t }: { locale: Locale; t: T }) {
  const pathname = usePathname() ?? "/";
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <details className="lang" ref={ref}>
      <summary aria-label={`${t("Langue", "Language")} : ${locales.find((l) => l.code === locale)?.label}`}>
        <Icon name="globe" />
        {locales.find((l) => l.code === locale)?.short}
      </summary>
      <ul className="lang-menu" aria-label={t("Langue", "Language")}>
        {locales.map((l) => (
          <li key={l.code}>
            {l.code === locale ? (
              <span className="is-active" lang={l.code} aria-current="true">
                {l.label} <Icon name="check" className="icon" />
              </span>
            ) : (
              // Lien classique (pas de préchargement) : il enregistre le choix puis revient sur cette page.
              <a
                href={`/langue/${l.code}?retour=${encodeURIComponent(pathname)}`}
                onClick={(e) => { e.currentTarget.href = `/langue/${l.code}?retour=${encodeURIComponent(pathname + window.location.search)}`; }}
                lang={l.code}
                hrefLang={l.code}
                rel="nofollow"
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Header({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${site.name}, ${t("retour à l'accueil", "back to home page")}`}>
          <Logo />
          <span className="brand-name">
            <strong>{site.name}</strong>
            <small>{locale === "en" ? site.en.motto : site.motto}</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label={t("Navigation principale", "Main navigation")}>
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {locale === "en" ? item.en : item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher locale={locale} t={t} />
          <Link href="/faire-un-don" className="btn btn-sun btn-sm header-donate">
            <Icon name="heart" />
            {t("Nous soutenir", "Support us")}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} />
            <span className="visually-hidden">{open ? t("Fermer le menu", "Close menu") : t("Menu", "Menu")}</span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" className="mobile-panel" hidden={!open}>
        <nav aria-label={t("Navigation mobile", "Mobile navigation")}>
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {locale === "en" ? item.en : item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/engagez-vous" aria-current={isActive(pathname, "/engagez-vous") ? "page" : undefined}>
                {t("Bénévolat et partenariats", "Volunteering and partnerships")}
              </Link>
            </li>
          </ul>
        </nav>
        <Link href="/faire-un-don" className="btn btn-sun btn-block">
          <Icon name="heart" />
          {t("Nous soutenir", "Support us")}
        </Link>
      </div>
    </header>
  );
}
