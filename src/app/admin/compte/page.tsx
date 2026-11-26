import { PasswordForm } from "@/components/admin/AdminForms";
import { roleLabels } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="admin-narrow stack">
      <h1>Mon compte</h1>
      <p>{user.name} · {user.email} · {roleLabels[user.role]}</p>
      <h2 style={{ fontSize: "1.25rem" }}>Changer mon mot de passe</h2>
      <PasswordForm />
    </div>
  );
}
