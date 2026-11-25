# Site web de la Fondation Horizon Solidaire

Site francophone de la Fondation Horizon Solidaire (Sénégal) : présentation de la fondation, programmes,
projets, transparence, actualités, galerie, bénévolat, partenariats et **dons en ligne via PayTech**.

> **Important.** Le site n'invente aucune donnée réelle. Tout ce qui manque s'affiche « À compléter par
> la fondation » ou reste masqué. La liste complète des informations à fournir se trouve dans
> [`INFORMATIONS-A-FOURNIR.md`](./INFORMATIONS-A-FOURNIR.md).

## Stack technique

- **Next.js 16** (App Router, React 19, TypeScript) : pages rapides et bien référencées, et partie serveur
  intégrée pour PayTech (clés secrètes, création des paiements, notifications).
- **CSS simple** avec variables de thème (`src/app/globals.css`), sans framework lourd.
- **Aucune dépendance superflue** : `next`, `react`, `react-dom`, `server-only`.
- Polices auto-hébergées au build (aucune requête vers Google côté visiteur), aucun traceur, aucun cookie
  non essentiel : pas de bandeau de consentement nécessaire.

## Installation et lancement

Prérequis : Node.js 20.9 ou plus récent.

```bash
npm install
cp .env.example .env.local      # puis adaptez les valeurs
npm run dev                     # http://localhost:3000
```

Production :

```bash
npm run build
npm start                       # port 3000 par défaut (PORT=8080 npm start pour changer)
```

Autres commandes : `npm run typecheck` (TypeScript) et `npm test` (tests de la signature PayTech et des validations).

## Structure

```
src/
  app/                    Pages (une par dossier) et routes API
    api/dons/             Création d'un don + statut + simulation
    api/paytech/ipn/      Réception des notifications PayTech (IPN)
    api/contact/          Formulaires contact / bénévolat / partenariat
  components/             Composants partagés (en-tête, pied de page, cartes, formulaires…)
  config/
    site.ts               Identité, logo, coordonnées, statut juridique, chiffres d'impact
    donations.ts          Montants, bornes, frais, moyens de paiement confirmés
  content/                Contenus éditables : programmes, projets, actualités, galerie,
                          rapports, équipe, témoignages, partenaires, FAQ
  i18n/                   Textes d'interface et préparation wolof / anglais
  lib/                    PayTech, validation, sécurité, stockage, formatage
public/images/            Logo et images
public/documents/         Rapports PDF (à créer)
data/                     Dons et messages enregistrés (non versionné)
tests/                    Tests automatisés
```

## Modifier les contenus

Tous les contenus sont dans `src/config/` et `src/content/`, sous forme de fichiers TypeScript commentés.
Après modification : `npm run build` puis redémarrage (ou redéploiement).

- **Logo** : déposez le fichier dans `public/images/`, puis renseignez `logo.src`, `logo.width` et `logo.height`
  (dimensions réelles du fichier) dans `src/config/site.ts`. Les proportions sont préservées automatiquement.
- **Chiffres d'impact** : `site.impact`. Une valeur `null` affiche « Données à renseigner ».
- **Projets** : `src/content/projets.ts`. La barre de progression n'apparaît que si `budget`, `collected`
  **et** `financialsUpdatedAt` sont renseignés. `acceptsDonations: true` rend le projet sélectionnable dans le
  formulaire de don. `featured: true` le met en avant sur l'accueil.
- **Exemples de démonstration** : marqués « Exemple à remplacer » ou « Exemple fictif ». Ils n'acceptent jamais
  de don, ne sont pas indexés et sont retirés en passant `site.showExamples` à `false`.
- **Documents de transparence** : PDF dans `public/documents/` + entrée dans `src/content/rapports.ts`
  (avec date de publication et de mise à jour).
- **Vidéos** : utilisez une URL d'intégration `https://www.youtube-nocookie.com/embed/...` (déjà autorisée
  par la politique de sécurité du site, `next.config.ts`).

### Préparer une version wolof ou anglaise

Les textes d'interface sont centralisés dans `src/i18n/fr.ts`, et le sélecteur de langue affiche déjà
Wolof et English comme « en préparation ». Pour activer une langue : faire traduire et **relire** les textes
par une personne compétente (pas de traduction automatique non relue), créer `wo.ts`, passer `enabled: true`
dans `src/i18n/index.ts`, puis ajouter un segment `[lang]` au routage (voir la documentation Next.js
« Internationalization »).

## Dons et PayTech : configuration sécurisée

Documentation de référence consultée : <https://docs.intech.sn/doc_paytech.php> (novembre 2026).

### Fonctionnement

1. Le donateur choisit montant et affectation. Le navigateur envoie la demande à **notre serveur** (`/api/dons`).
2. Le serveur valide tout (montant entier en XOF entre les bornes, affectation autorisée, consentement), vérifie
   l'origine de la requête, applique une limite de débit et une clé d'idempotence (pas de doublon en cas de
   double clic), enregistre le don « en attente » avec une référence unique `FHS-AAAAMMJJ-XXXXXXXXXX`.
3. Le serveur appelle `POST https://paytech.sn/api/payment/request-payment` avec les en-têtes `API_KEY` /
   `API_SECRET`, puis redirige le donateur vers la page sécurisée PayTech (`redirect_url`). Le site ne voit
   jamais les données de carte ou de paiement mobile.
4. PayTech notifie le serveur sur `/api/paytech/ipn`. Le serveur vérifie la signature **HMAC-SHA256**
   (`hmac_compute` = HMAC(secret, `montant|ref_command|clé`)), ou à défaut les empreintes SHA-256 des clés,
   puis contrôle la référence, le montant, la devise et l'environnement. **C'est la seule façon de passer
   un don à « payé ».** Une notification rejouée est sans effet et un don payé ne peut plus être annulé.
5. La page de retour (`/faire-un-don/merci`) interroge le serveur et affiche l'état réel : confirmé,
   en attente de confirmation, annulé, échoué ou introuvable.

Les journaux (sortie standard) ne contiennent ni nom, ni e-mail, ni téléphone : seulement la référence,
le montant et l'événement.

### Les trois modes (`PAYTECH_MODE`)

| Mode | Usage | Effet |
|---|---|---|
| `simulation` (défaut) | Démonstration, développement | Aucun appel à PayTech. Une page « Paiement simulé » permet de tester succès, annulation et échec. Bandeau visible sur la page de don. |
| `test` | Essais internes avec PayTech | Vraie page PayTech, mais PayTech débite un petit montant de test (100 à 150 FCFA d'après la doc) quel que soit le montant. Ne pas ouvrir au public. |
| `prod` | Site en ligne | Paiements réels. Le compte PayTech doit être activé par PayTech. |

Sans `PAYTECH_API_KEY` **et** `PAYTECH_API_SECRET`, le site reste en simulation quel que soit le mode demandé.

### Mise en service pas à pas

1. Créer le compte sur paytech.sn et demander l'activation (contact@paytech.sn, objet « Activation Compte
   PayTech », pièces demandées par PayTech).
2. Récupérer la clé API et la clé secrète dans le tableau de bord PayTech.
3. Chez l'hébergeur, définir `NEXT_PUBLIC_SITE_URL` (en **https**), `PAYTECH_MODE=test`, `PAYTECH_API_KEY`,
   `PAYTECH_API_SECRET`. L'URL de notification `https://votre-domaine/api/paytech/ipn` est transmise
   automatiquement à chaque paiement (PayTech exige le HTTPS pour l'IPN).
4. Faire un don de test, vérifier qu'il passe à « payé » dans `data/donations.json` et sur la page de remerciement.
5. Renseigner les moyens de paiement **confirmés** (`PAYTECH_TARGET_PAYMENT`, `donationConfig.confirmedPaymentMethods`)
   et le texte sur les frais (`donationConfig.feesNotice`).
6. Passer `PAYTECH_MODE=prod`, rebuild, et faire un vrai don de faible montant pour valider.

**Ne mettez jamais les clés dans le code, dans un fichier versionné ou dans une variable `NEXT_PUBLIC_*`.**
Le module `src/lib/env.ts` est marqué `server-only` : le build échoue s'il est importé côté navigateur.

### Limites connues

- **Don mensuel** : désactivé. La documentation PayTech consultée ne décrit pas de paiement récurrent.
- **E-mail de confirmation et reçus** : non envoyés. Le site l'indique honnêtement au donateur. À ajouter avec
  un service d'e-mail transactionnel une fois la politique de reçus validée.
- **Remboursements** : l'API PayTech `refund-payment` existe mais n'est pas branchée (opération à faire depuis
  le tableau de bord PayTech, ou à développer).
- L'appel réel à PayTech n'a pas pu être testé depuis l'environnement de développement (pas d'identifiants) :
  la création de paiement, la redirection et l'IPN signée ont été testées avec des clés fictives et des
  notifications simulées. Un essai en mode `test` avec les vraies clés est indispensable.

## Logo et images

- **Logo officiel** : fourni par la fondation, recadré (sans bandes noires, sans retouche ni déformation) dans
  `public/images/logo/` : `logo-embleme.png` (en-tête, pied de page, icône du site) et `logo-fondation-complet.jpg`
  (page « Qui sommes-nous ? », image de partage). L'icône d'onglet est `src/app/icon.png` / `apple-icon.png`.
- **Images d'illustration** : photos libres de droits sous [licence Unsplash](https://unsplash.com/license) ou
  [licence Pexels](https://www.pexels.com/license/) (usage gratuit, sans autorisation préalable), **hébergées sur le
  site** dans `public/images/illustrations/` (aucune requête vers un service tiers). Elles sont déclarées dans
  `src/content/images.ts`, affichées avec la mention « Image d'illustration » et un crédit, et **ne représentent pas
  des actions de la fondation**. Chaque photo a été regardée avant d'être retenue : contexte africain, sénégalais
  dès que possible. Remplacez-les par vos propres photos (avec consentement) dès que possible.

| Fichier | Usage | Photographe | Lieu indiqué | Source |
|---|---|---|---|---|
| marche-senegal.jpg | Accueil, Autonomisation | Wietse Jongsma | Sénégal | https://unsplash.com/photos/people-are-selling-goods-at-a-bustling-marketplace-DTUFoTIhzgU |
| village-senegal.jpg | Aide humanitaire | Wietse Jongsma | Sénégal | https://unsplash.com/photos/people-are-working-in-a-small-african-village-DJa0dqgMluM |
| lac-rose-sel.jpg | Exemple projet femmes | Seyni Diouck | Lac Rose, Sénégal | https://unsplash.com/photos/2g8mNsYL5u8 |
| celebration-senegal.jpg | Exemple d'article, galerie | Felipe Esono Nguema | Sénégal | https://www.pexels.com/photo/vibrant-celebration-with-senegal-flags-36598097/ |
| pecheurs-dakar.jpg | Exemple d'article, galerie | Amaury Michaux | Dakar, Sénégal | https://www.pexels.com/photo/fishermen-with-fishing-boat-on-sea-shore-in-senegal-18189731/ |
| plage-goree.jpg | Galerie | Amaury Michaux | Dakar, Sénégal | https://www.pexels.com/photo/sea-shore-in-town-in-senegal-18189694/ |
| rue-rufisque.jpg | Réserve | Papa Birame Faye | Rufisque, Sénégal | https://www.pexels.com/photo/man-on-a-chaise-in-a-narrow-alley-14598168/ |
| reunion-communautaire.jpg | Solidarité, galerie | Random Institute | non précisé | https://unsplash.com/photos/a-diverse-group-of-people-sitting-together-fOeH7Nh2oy0 |
| formation-classe.jpg | Éducation, galerie | Aristide Ouedraogo | non précisé | https://www.pexels.com/photo/african-classroom-training-session-with-uniformed-students-31820972/ |
| agricultrices.jpg | Développement local | Annie Spratt | Sierra Leone | https://unsplash.com/photos/woman-planting-during-daytime-QYcSeY7vuZM |
| etude-cahier.jpg | Exemple projet éducation, galerie | David Geneugelijk | non précisé | https://unsplash.com/photos/a-student-carefully-draws-lines-with-a-ruler-zzcHmwBaG0w |
| soignant-stethoscope.jpg | Santé, exemple projet santé | Hush Naidoo Jade Photography | Durban, Afrique du Sud | https://unsplash.com/photos/5HrQmJkIP_U |

Les photos mettant des enfants au premier plan ont été volontairement écartées.

## Stockage des données et hébergement

Les dons et messages sont enregistrés en JSON dans `DATA_DIR` (par défaut `./data`, fichiers en lecture
restreinte). Cela convient à un **serveur Node avec disque persistant** (VPS, conteneur avec volume, hébergeur
Node managé). Pensez à sauvegarder ce dossier et à le protéger (il contient des données personnelles).

Sur une plateforme « serverless » comme Vercel, le disque n'est pas persistant (le site y écrit par défaut dans `/tmp`, ce qui suffit pour une démonstration en mode simulation, mais les données peuvent disparaître à tout moment) : remplacez `src/lib/store.ts`
par une base de données (PostgreSQL, Turso/SQLite…) en gardant les mêmes fonctions `mutate` et `findOne`.
Le limiteur de débit est en mémoire : derrière plusieurs instances, ajoutez une limite au niveau de l'hébergeur.

Les messages de contact peuvent aussi être transférés vers un webhook HTTPS (`FORMS_WEBHOOK_URL`) pour être
reçus par e-mail via Make, Zapier, n8n, etc.

## Sécurité, accessibilité et performances

- En-têtes de sécurité (CSP stricte, HSTS en production, anti-iframe, `nosniff`) dans `next.config.ts`.
- Formulaires : validation serveur, vérification d'origine (anti-CSRF), limite de débit, champ piège et délai
  minimal anti-robots, sans captcha contraignant.
- Navigation au clavier, lien d'évitement, focus visible, libellés et messages d'erreur reliés aux champs,
  annonces pour lecteurs d'écran, contrastes AA, réduction des animations respectée (`prefers-reduced-motion`).
- Pages statiques pré-générées, illustrations vectorielles légères, polices optimisées, aucune bibliothèque
  JavaScript tierce.
- SEO : titres et descriptions par page, Open Graph, image de partage générée, `sitemap.xml`, `robots.txt`,
  données structurées FAQ. Les pages d'exemple et de paiement ne sont pas indexées.
