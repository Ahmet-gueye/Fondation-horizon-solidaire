import { audit } from "@/lib/audit";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { isRole, roleLabels } from "@/lib/auth/roles";
import { apiUser } from "@/lib/auth/session";
import { createUser, getUserByEmail } from "@/lib/auth/users";
import { isJson, jsonError } from "@/lib/security";
import { cleanText, isEmail } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Création d'un compte par un administrateur (mot de passe provisoire choisi par lui). */
export async function POST(request: Request) {
  const admin = await apiUser(request, "comptes.gerer");
  if (admin instanceof Response) return admin;
  if (!isJson(request)) return jsonError(415, "Format invalide.");
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const errors: Record<string, string> = {};
  const name = cleanText(body?.name, 80);
  const email = cleanText(body?.email, 254).toLowerCase();
  const role = body?.role;
  const password = typeof body?.password === "string" ? body.password : "";
  if (name.length < 2) errors.name = "Indiquez le nom.";
  if (!isEmail(email)) errors.email = "Adresse e-mail invalide.";
  else if (await getUserByEmail(email)) errors.email = "Un compte existe déjà avec cette adresse.";
  if (!isRole(role)) errors.role = "Choisissez un rôle.";
  const pb = passwordProblem(password);
  if (pb) errors.password = pb;
  if (Object.keys(errors).length || !isRole(role)) return jsonError(422, "Merci de vérifier les champs signalés.", errors);
  const user = await createUser({ name, email, role, passwordHash: await hashPassword(password) });
  await audit(admin, "compte.creation", { id: user.id, label: user.name }, roleLabels[role]);
  return Response.json({ ok: true });
}
