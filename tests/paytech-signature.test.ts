import { test } from "node:test";
import assert from "node:assert/strict";
import { computeIpnHmac, sha256Hex, verifyIpn } from "../src/lib/paytech-signature.ts";

const KEY = "cle-api-de-test";
const SECRET = "secret-api-de-test";

test("HMAC valide (final_item_price) accepté", () => {
  const hmac = computeIpnHmac("10000", "FHS-20261125-ABCDEF1234", KEY, SECRET);
  const r = verifyIpn({ ref_command: "FHS-20261125-ABCDEF1234", item_price: "10000", final_item_price: "10000", hmac_compute: hmac }, KEY, SECRET);
  assert.deepEqual(r, { valid: true, method: "hmac" });
});

test("HMAC calculé sur item_price si final_item_price absent", () => {
  const hmac = computeIpnHmac("5000", "REF1", KEY, SECRET);
  assert.equal(verifyIpn({ ref_command: "REF1", item_price: "5000", hmac_compute: hmac }, KEY, SECRET).valid, true);
});

test("HMAC falsifié refusé (montant modifié)", () => {
  const hmac = computeIpnHmac("100", "REF1", KEY, SECRET);
  assert.equal(verifyIpn({ ref_command: "REF1", item_price: "10000", hmac_compute: hmac }, KEY, SECRET).valid, false);
});

test("Empreintes SHA-256 valides acceptées", () => {
  const r = verifyIpn({ ref_command: "R", api_key_sha256: sha256Hex(KEY), api_secret_sha256: sha256Hex(SECRET) }, KEY, SECRET);
  assert.deepEqual(r, { valid: true, method: "sha256" });
});

test("Empreintes invalides refusées", () => {
  assert.equal(verifyIpn({ api_key_sha256: sha256Hex("x"), api_secret_sha256: sha256Hex(SECRET) }, KEY, SECRET).valid, false);
});

test("Sans signature : refus", () => {
  assert.equal(verifyIpn({ ref_command: "R", item_price: "1" }, KEY, SECRET).valid, false);
});

test("Sans identifiants configurés : refus", () => {
  assert.equal(verifyIpn({ hmac_compute: "abc" }, "", "").valid, false);
});
