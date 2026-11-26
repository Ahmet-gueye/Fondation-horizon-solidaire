import "server-only";
import { randomUUID } from "node:crypto";
import { getStore, type Doc } from "@/lib/db/docstore";
import type { Role } from "./roles";

export type UserData = {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  active: boolean;
  /** Incrémenté pour invalider toutes les sessions ouvertes (désactivation, nouveau mot de passe). */
  sessionVersion: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type User = Doc<UserData>;
/** Vue d'un compte sans l'empreinte du mot de passe (pour l'interface). */
export type PublicUser = Omit<User, "passwordHash">;

const C = "utilisateurs";

export function toPublicUser(u: User): PublicUser {
  const { passwordHash: _ignored, ...rest } = u;
  return rest;
}

export async function listUsers() {
  const users = await getStore().list<UserData>(C);
  return users.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

export async function countUsers() {
  return (await getStore().list<UserData>(C)).length;
}

export async function getUser(id: string) {
  return getStore().get<UserData>(C, id);
}

export async function getUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return (await getStore().list<UserData>(C)).find((u) => u.email === e) ?? null;
}

export async function createUser(input: { email: string; name: string; role: Role; passwordHash: string }) {
  const now = new Date().toISOString();
  return getStore().insert<UserData>(C, randomUUID(), {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    role: input.role,
    passwordHash: input.passwordHash,
    active: true,
    sessionVersion: 1,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
}

export async function saveUser(user: User, changes: Partial<UserData>) {
  const { id, version, ...data } = user;
  return getStore().update<UserData>(C, id, { ...data, ...changes, updatedAt: new Date().toISOString() }, version);
}
