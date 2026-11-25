# Informations à fournir avant la mise en production

Le site n'invente aucune information sur la fondation. Tant qu'un élément manque, il s'affiche
avec la mention « À compléter par la fondation » ou il est masqué. Voici ce qu'il faut transmettre,
et le fichier où le renseigner.

## 1. Identité et marque

| Information | Où la renseigner |
|---|---|
| **Fichier du logo officiel** (PNG ou SVG, fond transparent si possible) + ses dimensions en pixels | `public/images/` puis `src/config/site.ts` → `logo` |
| Image de partage réseaux sociaux (1200 × 630 px), facultative | `public/images/` puis `site.shareImage` |
| Validation des textes « mission », « vision », « valeurs » et « méthode » proposés | `src/app/qui-sommes-nous/page.tsx` |

## 2. Coordonnées officielles

- Adresse e-mail officielle, téléphone, WhatsApp éventuel, adresse postale, horaires → `site.contact`
- Comptes officiels de réseaux sociaux (URL exactes) → `site.socials`

## 3. Statut juridique (à partir des documents officiels uniquement)

- Forme juridique exacte, numéro d'enregistrement ou de récépissé, autorité d'enregistrement
- NINEA, date de création, siège
- Directeur ou directrice de la publication, hébergeur du site (nom et adresse)
→ `site.legal`

## 4. Gouvernance et historique

- Noms, rôles et photos des responsables, **avec leur accord de publication** → `src/content/equipe.ts`
- Étapes datées de l'historique → `history` dans le même fichier
- Partenaires confirmés par écrit, avec autorisation d'afficher leur nom ou logo → `src/content/partenaires.ts`

## 5. Activités

- **Zones d'intervention confirmées** (régions, départements, communes) → `site.interventionZones`
- Confirmation des programmes réellement menés. Le programme « Eau, hygiène et assainissement »
  est masqué tant qu'il n'est pas confirmé (`confirmed: false`) → `src/content/programmes.ts`
- Pour chaque programme : activités, zones, calendrier, budget, résultats vérifiés, photos avec consentement
- Pour chaque projet réel : région ou commune, besoin, bénéficiaires visés, objectifs, étapes, budget,
  **montant reçu vérifié et date de mise à jour**, calendrier, résultats → `src/content/projets.ts`
- Le projet à mettre en avant sur l'accueil (`featured: true`, uniquement avec des chiffres réels)

## 6. Chiffres d'impact

- Valeurs vérifiées et leur source (ex. « Rapport annuel 2025 ») → `site.impact`
- Sinon, choisir d'afficher « Données à renseigner » ou de masquer la section (`showImpactWhenEmpty`)

## 7. Contenus éditoriaux

- Premières actualités réelles (titre, date, catégorie, texte, image libre de droits) → `src/content/actualites.ts`
- Photos et vidéos avec droits d'usage et consentements (parents ou tuteurs pour les mineurs) → `src/content/galerie.ts`
- Témoignages réels avec consentement écrit daté → `src/content/temoignages.ts`
- Rapports annuels, bilans financiers, budgets, statuts et politiques (PDF) → `public/documents/` + `src/content/rapports.ts`
- Relecture des questions fréquentes → `src/content/faq.ts`
- Passer `site.showExamples` à `false` pour retirer tous les exemples de démonstration

## 8. Dons et paiement

- **Accès PayTech** : compte créé et **activé en production** (PayTech demande notamment NINEA,
  pièce d'identité, registre de commerce ou équivalent, statuts, justificatif d'adresse : à vérifier
  auprès de PayTech pour une fondation)
- Clé API et clé secrète (à saisir chez l'hébergeur, **jamais** dans le code ni par e-mail non chiffré)
- **Moyens de paiement confirmés** par PayTech pour votre compte (Orange Money, Wave, Free Money,
  carte bancaire…) → `PAYTECH_TARGET_PAYMENT` et `donationConfig.confirmedPaymentMethods`
- Frais appliqués et qui les supporte → `donationConfig.feesNotice`
- Montants minimum et maximum souhaités → `donationConfig.minAmount` / `maxAmount`
- Politique de dons : affectation et réaffectation, dons anonymes autorisés ou non, remboursements
- Don mensuel : la documentation PayTech consultée ne décrit pas de paiement récurrent ; à confirmer avec PayTech
- Reçus et fiscalité : possibilité légale d'émettre des reçus, mentions obligatoires
- E-mail de confirmation automatique : à prévoir seulement avec un service d'envoi configuré

## 9. Données personnelles et mentions légales

- Validation de la politique de confidentialité (loi sénégalaise n° 2008-12, formalités éventuelles auprès de la CDP)
- Durées de conservation des données de dons et de messages
- Validation des conditions de don et des mentions légales par un conseil
