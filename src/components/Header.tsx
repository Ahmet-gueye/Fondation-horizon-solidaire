"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/config/site";
import { getDictionary, locales } from "@/i18n";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const t = getDictionary();

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function LanguageSwitcher() {
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
      <summary aria-label={`${t.language} : Français`}>
        <Icon name="globe" />
        FR
      </summary>
      <ul className="lang-menu" aria-label={t.language}>
        {locales.map((l) => (
          <li key={l.code}>
            {l.enabled ? (
              <span className="is-active" lang={l.code} aria-current="true">
                {l.label} <Icon name="check" className="icon" />
              </span>
            ) : (
              <span className="is-disabled" lang={l.code} aria-disabled="true">
                {l.label} <small>{t.languageSoon}</small>
              </span>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Header() {
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
        <Link href="/" className="brand" aria-label={`${site.name}, retour à l'accueil`}>
          <Logo />
          <span className="brand-name">
            <strong>{site.name}</strong>
            <small>{site.motto}</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Navigation principale">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <Link href="/faire-un-don" className="btn btn-sun btn-sm header-donate">
            <Icon name="heart" />
            {t.donate}
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
            <span className="visually-hidden">{open ? t.closeMenu : t.menu}</span>
          </button>
        </div>
      </div>

      <div id="menu-mobile" className="mobile-panel" hidden={!open}>
        <nav aria-label="Navigation mobile">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/engagez-vous" aria-current={isActive(pathname, "/engagez-vous") ? "page" : undefined}>
                Bénévolat et partenariats
              </Link>
            </li>
          </ul>
        </nav>
        <Link href="/faire-un-don" className="btn btn-sun btn-block">
          <Icon name="heart" />
          {t.donate}
        </Link>
      </div>
    </header>
  );
}
