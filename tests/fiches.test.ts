import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFicheInput, publicationProblems, safeUrl } from "../src/lib/fiches/validate.ts";
import { isPublic, timing, publishedBudget, slugify, ctaHref, emptyFicheInput } from "../src/lib/fiches/model.ts";

const domains = ["education", "sante"];
const base = {
  ...emptyFicheInput(),
  title: "Journée de dépistage",
  summary: "Une journée de sensibilisation et de dépistage.",
  domain: "sante",
  type: "evenement",
};

test("fiche minimale valide", () => {
  const r = validateFicheInput(base, { domains });
  assert.equal(r.ok, true);
});

test("titre, résumé et domaine obligatoires", () => {
  const r = validateFicheInput({ ...base, title: "", summary: "court", domain: "inconnu" }, { domains });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ["domain", "summary", "title"]);
});

test("dates invalides et fin avant début refusées", () => {
  const r1 = validateFicheInput({ ...base, schedule: { kind: "ponctuel", date: "2026-02-30", time: "25:00", duration: "" } }, { domains });
  assert.equal(r1.ok, false);
  const r2 = validateFicheInput({ ...base, schedule: { kind: "periode", startDate: "2026-05-10", endDate: "2026-05-01" } }, { domains });
  assert.equal(r2.ok, false);
});

test("image sans texte alternatif ni autorisation refusée", () => {
  const r = validateFicheInput({ ...base, mainImage: { mediaId: "0123456789abcdef", alt: "", caption: "", rights: "" } }, { domains });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors["mainImage.alt"]);
    assert.ok(r.errors["mainImage.rights"]);
  }
});

test("montants négatifs ou décimaux refusés", () => {
  const r = validateFicheInput({ ...base, budget: { planned: -5, collected: 10.5, spent: null } }, { domains });
  assert.equal(r.ok, false);
});

test("lien du bouton : https ou chemin interne uniquement", () => {
  assert.equal(safeUrl("/contact"), "/contact");
  assert.equal(safeUrl("https://exemple.org/x"), "https://exemple.org/x");
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("//evil.example"), null);
  assert.equal(safeUrl("http://exemple.org"), null);
});

test("un brouillon ou une fiche archivée n'est jamais publique", () => {
  assert.equal(isPublic({ publishedAt: "2026-01-01T00:00:00Z", status: "brouillon" }), false);
  assert.equal(isPublic({ publishedAt: "2026-01-01T00:00:00Z", status: "archive" }), false);
  assert.equal(isPublic({ publishedAt: null, status: "planifie" }), false);
  assert.equal(isPublic({ publishedAt: "2026-01-01T00:00:00Z", status: "planifie" }), true);
});

test("un événement passé n'est pas présenté comme à venir", () => {
  const f = { status: "planifie" as const, schedule: { kind: "ponctuel" as const, date: "2026-01-10", time: "", duration: "" } };
  assert.equal(timing(f, "2026-03-01"), "passe");
  assert.equal(timing(f, "2026-01-01"), "a_venir");
  assert.equal(timing({ ...f, status: "termine" }, "2026-01-01"), "passe");
});

test("montants affichés uniquement s'ils sont validés", () => {
  assert.equal(publishedBudget({ planned: 1000, collected: 500, spent: null, validated: false, validatedAt: null, validatedBy: null }), null);
  assert.ok(publishedBudget({ planned: 1000, collected: 500, spent: null, validated: true, validatedAt: "2026-01-01", validatedBy: "A" }));
});

test("conditions de publication", () => {
  assert.ok(publicationProblems({ ...emptyFicheInput() }).length >= 3);
  assert.deepEqual(
    publicationProblems({ status: "planifie", description: "Une description suffisamment longue pour publier.", zone: { region: "Thiès", departement: "", commune: "", localite: "" }, schedule: { kind: "ponctuel", date: "2026-05-01", time: "", duration: "" } }),
    [],
  );
});

test("adresse lisible et bouton par défaut", () => {
  assert.equal(slugify("Journée d'été à Kédougou !"), "journee-d-ete-a-kedougou");
  assert.equal(ctaHref({ title: "Test", cta: { kind: "aucun", label: "", url: "" } }), null);
  assert.equal(ctaHref({ title: "Test", cta: { kind: "benevole", label: "", url: "" } }), "/contact?type=benevolat&sujet=Test");
});
