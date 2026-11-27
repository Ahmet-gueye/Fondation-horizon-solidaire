import { test } from "node:test";
import assert from "node:assert/strict";
import { isDonationRef, newDonationRef, sameAmount, validateDonation } from "../src/lib/payments/donation-validate.ts";
import { computeIpnHmac, verifyIpn } from "../src/lib/payments/paytech-signature.ts";

const progs = ["education", "sante"];

test("don valide en FCFA", () => {
  const r = validateDonation({ amount: 5000, currency: "XOF", programme: "sante", terms: true }, progs);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual([r.data.amount, r.data.currency, r.data.programme], [5000, "XOF", "sante"]);
});

test("montant hors limites, décimal ou devise inconnue refusés", () => {
  assert.equal(validateDonation({ amount: 100, currency: "XOF", terms: true }, progs).ok, false);
  assert.equal(validateDonation({ amount: 10.5, currency: "EUR", terms: true }, progs).ok, false);
  assert.equal(validateDonation({ amount: 10, currency: "JPY", terms: true }, progs).ok, false);
  assert.equal(validateDonation({ amount: 20_000_000, currency: "XOF", terms: true }, progs).ok, false);
});

test("programme inconnu, e-mail invalide et conditions non acceptées refusés", () => {
  const r = validateDonation({ amount: 5000, currency: "XOF", programme: "pirate", donorEmail: "abc", terms: false }, progs);
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ["donorEmail", "programme", "terms"]);
});

test("messages en anglais", () => {
  const r = validateDonation({ amount: 1, currency: "XOF", terms: true, locale: "en" }, progs);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.errors.amount ?? "", /between/);
});

test("référence de don unique et reconnaissable", () => {
  const a = newDonationRef(new Date("2026-11-27T10:00:00Z"));
  assert.match(a, /^FHS-20261127-[A-Z2-9]{10}$/);
  assert.equal(isDonationRef(a), true);
  assert.equal(isDonationRef("FHS-2026-x"), false);
  assert.notEqual(newDonationRef(), newDonationRef());
});

test("comparaison des montants annoncés par PayTech", () => {
  assert.equal(sameAmount(5000, "5000"), true);
  assert.equal(sameAmount(5000, "5000.00"), true);
  assert.equal(sameAmount(5000, "100"), false);
  assert.equal(sameAmount(5000, undefined, "5000"), true);
});

test("IPN : HMAC calculé sur final_item_price accepté", () => {
  const hmac = computeIpnHmac("4500", "R1", "k", "s");
  assert.equal(verifyIpn({ ref_command: "R1", item_price: "5000", final_item_price: "4500", hmac_compute: hmac }, "k", "s").valid, true);
  assert.equal(verifyIpn({ ref_command: "R1", item_price: "5000", final_item_price: "4500", hmac_compute: "00" }, "k", "s").valid, false);
});
