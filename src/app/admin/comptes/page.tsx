import { UsersManager } from "@/components/admin/AdminForms";
import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/users";

export const metadata = { title: "Comptes" };

export default async function UsersPage() {
  const me = await requireUser("comptes.gerer");
  const users = (await listUsers()).map(({ id, name, email, role, active, lastLoginAt }) => ({ id, name, email, role, active, lastLoginAt }));
  return (
    <div className="stack">
      <h1>Comptes</h1>
      <div className="notice notice-info">
        <div>
          <p><strong>Éditeur</strong> : crée des fiches et modifie celles qui ne sont pas encore publiées. Ne peut ni publier, ni archiver, ni valider des montants.</p>
          <p className="mb-0"><strong>Administrateur</strong> : tout ce que fait un éditeur, plus publier, retirer, archiver, supprimer un brouillon, valider les montants, gérer les comptes et consulter l&apos;historique et les messages.</p>
        </div>
      </div>
      <UsersManager users={users} meId={me.id} />
    </div>
  );
}
