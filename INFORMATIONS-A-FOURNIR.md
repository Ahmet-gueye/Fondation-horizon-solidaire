# Informations à fournir avant la mise en production

Le site n'invente aucune information sur la fondation. Tant qu'un élément manque, il s'affiche
avec la mention « À compléter par la fondation » ou il est masqué. Voici ce qu'il faut transmettre,
et le fichier où le renseigner.

## 1. Identité et marque

| Information | Où la renseigner |
|---|---|
| ✅ Logo officiel : intégré. Une version vectorielle (SVG) ou en haute définition améliorerait la netteté | `public/images/logo/` et `site.logo` |
| Image de partage réseaux sociaux (1200 × 630 px), facultative | `public/images/` puis `site.shareImage` |
| Validation des textes « mission », « vision », « valeurs » et « méthode » proposés | `src/app/qui-sommes-nous/page.tsx` |

## 2. Coordonnées officielles

- ✅ E-mails (seydigaye9@gmail.com, gayetapha1@gmail.com) et téléphone (+221 77 755 39 99) : intégrés
- Restent à fournir : WhatsApp éventuel, adresse postale, horaires → `site.contact`
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
- Les activités, événements, projets et campagnes réels : ils se saisissent désormais dans l'espace
  d'administration (`/admin`), avec lieu, dates, calendrier, budget validé, photos autorisées et documents
- Les personnes qui auront un compte (administrateurs et éditeurs)

## 6. Chiffres d'impact

- Valeurs vérifiées et leur source (ex. « Rapport annuel 2025 ») → `site.impact`
- Sinon, choisir d'afficher « Données à renseigner » ou de masquer la section (`showImpactWhenEmpty`)

## 7. Contenus éditoriaux

- Premières actualités réelles (titre, date, catégorie, texte, image libre de droits) → `src/content/actualites.ts`
- Vos propres photos pour remplacer les images d'illustration Unsplash actuelles (`src/content/images.ts`)
- Photos et vidéos avec droits d'usage et consentements (parents ou tuteurs pour les mineurs) → `src/content/galerie.ts`
- Témoignages réels avec consentement écrit daté → `src/content/temoignages.ts`
- Rapports annuels, bilans financiers, budgets, statuts et politiques (PDF) → `public/documents/` + `src/content/rapports.ts`
- Relecture des questions fréquentes → `src/content/faq.ts`
- Passer `site.showExamples` à `false` pour retirer tous les exemples de démonstration

## 8. Dons et paiement (le don en ligne n'est pas encore ouvert)

- **Activation du compte PayTech** (PayTech demande notamment NINEA, pièce d'identité, statuts, justificatif
  d'adresse : à vérifier auprès de PayTech pour une fondation)
- Clé API et clé secrète, à saisir **uniquement** chez l'hébergeur (jamais dans le code ni par e-mail non chiffré)
- **Confirmation écrite de PayTech** : moyens de paiement ouverts (Orange Money, Wave, Free Money, carte…),
  devises acceptées pour votre compte parmi XOF, EUR, USD, CAD, GBP et MAD, frais, don récurrent possible ou non
- Politique de dons : affectation et réaffectation, dons anonymes autorisés ou non, remboursements
- Reçus et fiscalité : possibilité légale d'émettre des reçus, mentions obligatoires
- En attendant : la façon dont la fondation souhaite recevoir les soutiens provisoires (le site invite seulement
  à la contacter, sans publier de coordonnées bancaires)

## 8 bis. Hébergement et administration

- Accès au compte Vercel du site, pour ajouter la base Neon, le magasin Blob et les variables `AUTH_SECRET`
  et `ADMIN_SETUP_TOKEN` (voir README, « Espace d'administration »)
- La personne qui créera le premier compte administrateur

## 9. Données personnelles et mentions légales

- Validation de la politique de confidentialité (loi sénégalaise n° 2008-12, formalités éventuelles auprès de la CDP)
- Durées de conservation des données de dons et de messages
- Validation des conditions de don et des mentions légales par un conseil
