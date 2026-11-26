import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/AdminForms";
import { adminReady } from "@/lib/auth/session";
import { countUsers } from "@/lib/auth/users";
import { getSetupToken } from "@/lib/env";

export const metadata = { title: "Installation" };

export default async function SetupPage() {
  if (!adminReady()) redirect("/admin/configuration");
  if ((await countUsers()) > 0) redirect("/admin/connexion");
  return (
    <div className="admin-narrow stack">
      <h1>Créer le premier administrateur</h1>
      {getSetupToken() ? (
        <>
          <p>Cette page ne sert qu&apos;une fois. Dès que le premier compte est créé, elle se ferme définitivement.</p>
          <SetupForm />
        </>
      ) : (
        <div className="notice notice-warn">
          <p className="mb-0">
            Installation fermée. Définissez d&apos;abord la variable <code>ADMIN_SETUP_TOKEN</code> (16 caractères minimum) chez votre
            hébergeur, redéployez le site, puis revenez sur cette page. Voir le README, section « Espace d&apos;administration ».
          </p>
        </div>
      )}
    </div>
  );
}
