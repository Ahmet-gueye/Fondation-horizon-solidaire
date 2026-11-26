import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, passwordProblem, verifyPassword } from "../src/lib/auth/password.ts";
import { createToken, readToken } from "../src/lib/auth/token.ts";
import { can } from "../src/lib/auth/roles.ts";

const SECRET = "un-secret-de-test-suffisamment-long-0123456789";

test("mot de passe : hachage et vérification", async () => {
  const h = await hashPassword("une phrase de passe solide");
  assert.ok(h.startsWith("scrypt$"));
  assert.ok(!h.includes("une phrase"));
  assert.equal(await verifyPassword("une phrase de passe solide", h), true);
  assert.equal(await verifyPassword("mauvais mot de passe", h), false);
});

test("mot de passe trop court refusé", () => {
  assert.ok(passwordProblem("court"));
  assert.ok(passwordProblem("aaaaaaaaaaaaaaaa"));
  assert.equal(passwordProblem("une phrase de passe solide"), null);
});

test("jeton de session signé, falsification et expiration détectées", () => {
  const t = createToken({ uid: "u1", sv: 1, exp: Date.now() + 60_000 }, SECRET);
  assert.deepEqual(readToken(t, SECRET)?.uid, "u1");
  assert.equal(readToken(t, "autre-secret-tout-aussi-long-0123456789abcdef"), null);
  const [data, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "admin", sv: 1, exp: Date.now() + 60_000 })).toString("base64url");
  assert.equal(readToken(`${forged}.${sig}`, SECRET), null);
  assert.equal(readToken(`${data}.${sig}x`, SECRET), null);
  const old = createToken({ uid: "u1", sv: 1, exp: Date.now() - 1 }, SECRET);
  assert.equal(readToken(old, SECRET), null);
});

test("droits : l'éditeur ne publie pas, l'administrateur oui", () => {
  assert.equal(can("editeur", "fiche.creer"), true);
  assert.equal(can("editeur", "fiche.publier"), false);
  assert.equal(can("editeur", "budget.valider"), false);
  assert.equal(can("editeur", "comptes.gerer"), false);
  assert.equal(can("admin", "fiche.publier"), true);
  assert.equal(can(null, "fiche.creer"), false);
});
