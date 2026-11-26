import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../src/lib/validation.ts";

test("contact : partenariat exige l'organisation", () => {
  const msg = { type: "partenariat", name: "Test", email: "t@example.org", message: "Bonjour, je souhaite échanger.", consent: true };
  assert.equal(validateContact(msg).ok, false);
  assert.equal(validateContact({ ...msg, organisation: "Association X" }).ok, true);
});
