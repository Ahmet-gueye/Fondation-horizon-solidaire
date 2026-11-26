import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/AdminForms";
import { Logo } from "@/components/Logo";
import { can, roleLabels } from "@/lib/auth/roles";
import { currentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Administration" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <div className="admin">
      <a href="#admin-contenu" className="skip-link">Aller au contenu</a>
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <Link href="/admin" className="admin-brand">
            <Logo />
            <span>Administration</span>
          </Link>
          {user ? (
            <nav aria-label="Administration" className="admin-nav">
              <Link href="/admin">Fiches</Link>
              {can(user.role, "comptes.gerer") ? <Link href="/admin/comptes">Comptes</Link> : null}
              {can(user.role, "historique.voir") ? <Link href="/admin/historique">Historique</Link> : null}
              {can(user.role, "messages.voir") ? <Link href="/admin/messages">Messages</Link> : null}
              <Link href="/admin/compte">Mon compte</Link>
              <Link href="/" target="_blank">Voir le site</Link>
              <span className="admin-who">{user.name} · {roleLabels[user.role]}</span>
              <LogoutButton />
            </nav>
          ) : (
            <Link href="/" className="admin-back">Retour au site</Link>
          )}
        </div>
      </header>
      <main id="admin-contenu" className="admin-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
