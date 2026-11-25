import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContact, validateDonation } from "../src/lib/validation.ts";

const rules = { minAmount: 500, maxAmount: 5_000_000, allowedAllocations: ["programme:education"], recurringEnabled: false, allowAnonymous: true, askPhone: false };
const base = { amount: 10000, allocation: "general", frequency: "ponctuel", name: "Awa Test", email: "awa@example.org", consent: true, idempotencyKey: "0123456789abcdef0123" };

test("don valide", () => {
  const r = validateDonation(base, rules);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.data.allocation, null);
});

test("montant hors bornes ou non entier refusé", () => {
  assert.equal(validateDonation({ ...base, amount: 100 }, rules).ok, false);
  assert.equal(validateDonation({ ...base, amount: 10_000_000 }, rules).ok, false);
  assert.equal(validateDonation({ ...base, amount: 1000.5 }, rules).ok, false);
  assert.equal(validateDonation({ ...base, amount: "abc" }, rules).ok, false);
});

test("affectation inconnue refusée", () => {
  assert.equal(validateDonation({ ...base, allocation: "projet:inexistant" }, rules).ok, false);
  assert.equal(validateDonation({ ...base, allocation: "programme:education" }, rules).ok, true);
});

test("don mensuel refusé tant que non activé", () => {
  assert.equal(validateDonation({ ...base, frequency: "mensuel" }, rules).ok, false);
});

test("don anonyme sans nom ni e-mail accepté", () => {
  assert.equal(validateDonation({ ...base, anonymous: true, name: "", email: "" }, rules).ok, true);
});

test("consentement obligatoire", () => {
  assert.equal(validateDonation({ ...base, consent: false }, rules).ok, false);
});

test("contact : partenariat exige l'organisation", () => {
  const msg = { type: "partenariat", name: "Test", email: "t@example.org", message: "Bonjour, je souhaite échanger.", consent: true };
  assert.equal(validateContact(msg).ok, false);
  assert.equal(validateContact({ ...msg, organisation: "Association X" }).ok, true);
});
