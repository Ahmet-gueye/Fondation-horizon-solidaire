import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AdminForms";
import { adminReady, currentUser } from "@/lib/auth/session";
import { countUsers } from "@/lib/auth/users";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (!adminReady()) redirect("/admin/configuration");
  if (await currentUser()) redirect("/admin");
  const noUser = (await countUsers()) === 0;
  return (
    <div className="admin-narrow stack">
      <h1>Connexion</h1>
      <p className="muted">Espace réservé aux personnes autorisées par la Fondation Horizon Solidaire.</p>
      {noUser ? (
        <div className="notice notice-info"><p className="mb-0">Aucun compte n&apos;existe encore. <Link href="/admin/installation">Créer le premier administrateur</Link>.</p></div>
      ) : null}
      <LoginForm />
      <p className="small muted">Mot de passe oublié ? Demandez à un administrateur de vous en attribuer un nouveau.</p>
    </div>
  );
}
