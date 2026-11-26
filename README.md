# Site web de la Fondation Horizon Solidaire

Site francophone de la Fondation Horizon Solidaire (Sénégal) : présentation de la fondation, programmes,
activités et campagnes, transparence, actualités, galerie, bénévolat, partenariats, et un **espace
d'administration** pour publier les activités, événements, projets et campagnes sans toucher au code.

> **Dons en ligne : pas encore ouverts.** Le compte PayTech de la fondation n'est pas activé. Le site n'affiche
> aucun formulaire de paiement, aucun bouton « Payer » et n'encaisse rien. La page « Nous soutenir » invite à
> contacter la fondation. L'activation future est décrite plus bas (« Activer PayTech plus tard »).

> **Important.** Le site n'invente aucune donnée réelle. Tout ce qui manque s'affiche « À compléter par
> la fondation » ou reste masqué. La liste complète des informations à fournir se trouve dans
> [`INFORMATIONS-A-FOURNIR.md`](./INFORMATIONS-A-FOURNIR.md).

## Stack technique

- **Next.js 16** (App Router, React 19, TypeScript) : pages rapides et bien référencées, et partie serveur
  intégrée (administration, formulaires, et plus tard PayTech).
- **CSS simple** avec variables de thème (`src/app/globals.css`), sans framework lourd.
- **Dépendances limitées** : `next`, `react`, `react-dom`, `server-only`, plus `postgres` (base de données),
  `@vercel/blob` (stockage des images) et `sharp` (optimisation des images).
- **Hébergement visé : Vercel**, avec deux services gratuits à ajouter depuis l'onglet *Storage* de Vercel :
  une base **PostgreSQL (Neon)** et un magasin **Vercel Blob**. Voir « Espace d'administration ».
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

Autres commandes : `npm run typecheck` (TypeScript) et `npm test` (validation des fiches, mots de passe, sessions,
droits des rôles, formulaires et signature PayTech).

En local, sans aucune variable, le site fonctionne et l'administration enregistre ses données dans `data/`
(voir « Ce qui fonctionne en local »).

## Structure

```
src/
  app/
    (site)/               Pages publiques (accueil, programmes, activites, actualites, faire-un-don…)
    admin/                Espace d'administration (connexion, fiches, comptes, historique, messages)
    api/admin/            Routes protégées : session, installation, fiches, médias, comptes
    api/contact/          Formulaires contact / bénévolat / partenariat
    media/[id]/[variante] Diffusion contrôlée des images et PDF importés
  components/             Composants partagés ; admin/ pour l'administration
  config/
    site.ts               Identité, logo, coordonnées, statut juridique, chiffres d'impact
    donations.ts          Dons en ligne (désactivés), devises prévues
  content/                Contenus fixes : programmes, actualités, galerie, rapports, équipe, FAQ
  lib/
    auth/                 Mots de passe, sessions, rôles, comptes
    db/                   Base de données (PostgreSQL ou fichiers locaux) et stockage des fichiers
    fiches/               Modèle, validation, enregistrement et images des fiches
    payments/             PayTech, préparé mais NON branché
public/images/            Logo et images d'illustration
data/                     Données locales de développement (non versionné)
tests/                    Tests automatisés
```

## Modifier les contenus

Tous les contenus sont dans `src/config/` et `src/content/`, sous forme de fichiers TypeScript commentés.
Après modification : `npm run build` puis redémarrage (ou redéploiement).

- **Logo** : déposez le fichier dans `public/images/`, puis renseignez `logo.src`, `logo.width` et `logo.height`
  (dimensions réelles du fichier) dans `src/config/site.ts`. Les proportions sont préservées automatiquement.
- **Chiffres d'impact** : `site.impact`. Une valeur `null` affiche « Données à renseigner ».
- **Activités, événements, projets et campagnes** : ils ne sont plus dans le code. Ils se gèrent dans l'espace
  d'administration (`/admin`), voir plus bas.
- **Exemples de démonstration** (actualités) : marqués « Exemple fictif ». Ils ne sont pas indexés et sont
  retirés en passant `site.showExamples` à `false`.
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

## Espace d'administration

Adresse : **`https://votre-site/admin`** (en local : `http://localhost:3000/admin`). Il n'y a aucun lien vers cet
espace dans le site public ; il n'est pas indexé par les moteurs de recherche.

### Ce qu'il faut configurer chez l'hébergeur (une seule fois)

L'administration a besoin de trois choses. Tant qu'elles manquent, `/admin` affiche une page « Configuration »
qui indique ce qui manque (sans jamais afficher de valeur secrète), et le site public reste consultable.

| Variable | Rôle | Comment l'obtenir |
|---|---|---|
| `DATABASE_URL` | Base de données (fiches, comptes, historique, messages) | Vercel > projet > **Storage** > *Create Database* > **Neon (PostgreSQL)**, puis *Connect Project* : la variable est ajoutée automatiquement (elle peut s'appeler `POSTGRES_URL`, le site accepte les deux). Tout autre PostgreSQL hébergé convient (Supabase…). |
| `BLOB_READ_WRITE_TOKEN` ou `BLOB_STORE_ID` | Stockage des images et PDF importés | Vercel > **Storage** > *Create* > **Blob**, accès **Private**, puis *Connect Project* : la variable est ajoutée automatiquement (cocher « Add a read-write token » est possible mais pas obligatoire). |
| `AUTH_SECRET` | Signature des sessions de connexion | Une longue chaîne aléatoire (32 caractères minimum). Sur un ordinateur : `openssl rand -base64 48`. |
| `ADMIN_SETUP_TOKEN` | Code à usage unique pour créer le premier administrateur | Une chaîne aléatoire d'au moins 16 caractères que vous choisissez. Peut être supprimée une fois le premier compte créé. |

Ajoutez `AUTH_SECRET` et `ADMIN_SETUP_TOKEN` dans Vercel > projet > **Settings > Environment Variables**, puis
**redéployez** (onglet *Deployments* > *Redeploy*). Aucun mot de passe par défaut n'existe dans le code.

Le magasin Blob doit être créé en accès **Private** : les fichiers ne sont alors lisibles qu'à travers le site,
qui vérifie que la fiche est publiée. (`BLOB_ACCESS=public` n'est à utiliser que si votre magasin est public.)

### Créer le premier compte administrateur

1. Ouvrez `https://votre-site/admin` : vous arrivez sur « Créer le premier administrateur ».
2. Saisissez le code `ADMIN_SETUP_TOKEN`, votre nom, votre e-mail et un mot de passe de 12 caractères minimum
   (une phrase de plusieurs mots est idéale).
3. Le compte est créé et vous êtes connecté. **La page d'installation se ferme définitivement** dès qu'un compte
   existe. Vous pouvez ensuite retirer `ADMIN_SETUP_TOKEN` des variables Vercel.

Les autres comptes se créent dans **Comptes** : l'administrateur choisit un mot de passe provisoire, le transmet
par un moyen sûr, et la personne le change dans **Mon compte**. Mot de passe oublié : un administrateur en
définit un nouveau (bouton « Nouveau mot de passe »).

### Rôles

| Action | Éditeur | Administrateur |
|---|---|---|
| Créer une fiche, modifier une fiche non publiée, importer images et PDF | oui | oui |
| Modifier une fiche déjà publiée | non | oui |
| Publier, retirer du site, archiver, sortir des archives | non | oui |
| Supprimer définitivement (seulement une fiche jamais publiée) | non | oui |
| Valider les montants (budget, collecté, dépensé) pour les afficher | non | oui |
| Gérer les comptes, consulter l'historique et les messages reçus | non | oui |

Il reste toujours au moins un administrateur actif (le site refuse de désactiver ou rétrograder le dernier).
Désactiver un compte, changer son rôle ou son mot de passe le déconnecte immédiatement de tous ses appareils.

### Créer, modifier, publier et archiver une fiche

1. **Fiches > Nouvelle fiche.** Remplissez : type (activité, événement, projet, campagne), domaine d'action
   (les programmes du site), titre, résumé, description, zone (région, département, commune, localité), dates
   (une date avec heure et durée, ou une période), calendrier détaillé (étapes), budget, images, documents PDF,
   bouton d'appel à l'action (participer, devenir bénévole, en savoir plus, soutenir la campagne) et statut
   (brouillon, planifié, en cours, terminé).
2. **Enregistrer** ne publie jamais. La fiche reste invisible du public, ses images aussi. Le bouton **Aperçu**
   montre la page telle qu'elle apparaîtra.
3. **Publier** (administrateur) : possible si le statut n'est pas « brouillon » et si la description, la zone
   et la date sont renseignées. La fiche apparaît alors dans « Activités », sur l'accueil, dans la page du
   programme et dans le sitemap.
4. **Modifier** une fiche publiée (administrateur) : les changements sont en ligne dès l'enregistrement.
   L'adresse de la page ne change plus après la première publication.
5. **Retirer du site** : la fiche redevient invisible, sans être archivée.
6. **Archiver** : la fiche disparaît du site, des filtres, des compteurs et du sitemap, et n'est plus
   modifiable ; ses images ne sont plus servies. **Sortir des archives** la remet en brouillon non publié.
7. **Supprimer** n'est possible que pour une fiche jamais publiée, après avoir tapé SUPPRIMER. Une fiche déjà
   publiée s'archive.

Ce que voit le public : uniquement les fiches publiées et non archivées. Un événement dont la date est passée
est affiché « Date passée » ou « Terminé », jamais « À venir ». Les montants n'apparaissent que s'ils ont été
cochés « validés » par un administrateur ; si un éditeur les modifie ensuite, la validation est annulée.

### Images et documents

- **Import** depuis un ordinateur ou un téléphone (appareil photo ou galerie), avec aperçu immédiat, et boutons
  « Remplacer » et « Retirer ».
- **Formats acceptés** : JPEG, PNG, WebP (20 Mo maximum avant traitement, 400 px de large minimum). Les photos
  d'iPhone (HEIC) sont converties en JPEG par le téléphone lors de l'envoi.
- **Dans le navigateur**, l'image est redressée, réduite à 2400 px maximum et réencodée (moins de 4 Mo), ce qui
  supprime aussi les métadonnées, dont la position GPS.
- **Sur le serveur**, le vrai format est revérifié (un faux fichier est refusé), l'envoi est limité à **4 Mo**,
  puis deux versions WebP sont produites : **1600 px** (écrans haute résolution) et **800 px** (téléphones,
  vignettes). Le navigateur du visiteur choisit la bonne taille.
- **Texte alternatif obligatoire**, légende facultative, et une case **autorisations** obligatoire : « aucune
  personne reconnaissable » ou « accord écrit des personnes, et des parents ou tuteurs pour les mineurs ».
  Sans accord écrit, ne publiez pas de photo où l'on reconnaît un enfant ou un bénéficiaire.
- **Documents** : PDF uniquement, 4 Mo maximum chacun.
- **Où sont stockés les fichiers** : dans le magasin **Vercel Blob** privé (dossier `fhs/img/` et `fhs/doc/`), ou
  dans `data/uploads/` en local. Ils sont diffusés par `/media/<identifiant>/<lg|md|pdf>`, qui ne répond aux
  visiteurs que si la fiche est publiée. Remplacer ou retirer une image d'une fiche supprime l'ancien fichier
  à l'enregistrement ; les imports abandonnés sont nettoyés après 24 heures.

### Historique

Chaque création, modification, publication, retrait, archivage, suppression, validation de montants et
changement de compte est enregistré avec l'auteur, la date et l'action (menu **Historique**, administrateurs).
Aucune donnée sensible n'y figure (ni mot de passe, ni adresse IP).

### Sauvegarde

- **Base de données** : Neon conserve un historique permettant de restaurer la base à un instant passé
  (*Restore*, durée selon votre offre). Faites aussi, chaque mois, un export complet depuis un ordinateur :
  `pg_dump "$DATABASE_URL" > sauvegarde-AAAA-MM-JJ.sql` (toutes les données sont dans la table `fhs_documents`).
  Restauration : `psql "$DATABASE_URL" < sauvegarde-AAAA-MM-JJ.sql`.
- **Images et documents** : téléchargez le contenu du magasin Blob (Vercel > Storage > Blob > *Browse*, ou
  l'outil en ligne de commande `vercel blob`). Gardez les sauvegardes dans un endroit protégé : elles
  contiennent des données personnelles (comptes, messages).
- **En local** : sauvegardez le dossier `data/`.

### Ce qui fonctionne en local et ce qui demande une configuration

| Situation | Fonctionnement |
|---|---|
| Sur votre ordinateur, sans variable | Tout fonctionne : données dans `data/db/`, images dans `data/uploads/`. Il faut seulement `AUTH_SECRET` et `ADMIN_SETUP_TOKEN` dans `.env.local` pour se connecter. |
| Serveur avec disque persistant (VPS) | Comme en local ; sauvegardez `data/`. Une base PostgreSQL reste recommandée. |
| Vercel sans base ni Blob | Le site public fonctionne (aucune activité affichée), l'administration affiche « Configuration ». Les messages de contact ne sont enregistrés que si `FORMS_WEBHOOK_URL` est défini. |
| Vercel avec Neon, Blob, `AUTH_SECRET` | Tout fonctionne et les données sont conservées. |

Ce qui a été vérifié avant livraison : le parcours complet (installation, comptes, fiche avec image et PDF,
publication, validation du budget, événement passé, droits de l'éditeur, archivage, suppression, refus des faux
fichiers et des requêtes non autorisées) avec une vraie base PostgreSQL 16 et avec le stockage local.
**Vercel Blob n'a pas pu être testé** sans magasin réel : faites un essai d'import d'image après sa création.

### Limites connues

- Le limiteur de tentatives de connexion est en mémoire : sur Vercel, chaque instance a son propre compteur.
  Activez en plus la protection de Vercel (*Firewall*) si des attaques sont constatées.
- Pas d'envoi d'e-mail (mot de passe oublié, notification de nouveau message) : ce serait à ajouter avec un
  service d'e-mail transactionnel.
- Les actualités, la galerie et les rapports restent dans le code (`src/content/`).

## Dons : état actuel et activation future de PayTech

### Aujourd'hui

- Aucun paiement n'est intégré ni simulé. La page `/faire-un-don` (« Nous soutenir ») explique que le paiement
  en ligne sera bientôt disponible, qu'aucun don ne peut être encaissé sur le site, et invite à contacter la
  fondation. Aucune coordonnée bancaire n'y est publiée.
- Le site ne demande jamais de coordonnées bancaires, de numéro de carte ni de code Mobile Money.
- Le code PayTech est **préparé mais non branché** (`src/lib/payments/`) : client de création de paiement
  (`paytech.ts`) et vérification de la signature des notifications (`paytech-signature.ts`, testée). Aucune
  route du site ne l'utilise. `donationConfig.onlineDonationsEnabled` vaut `false`.
- Devises prévues (`donationConfig.plannedCurrencies`) : **XOF/FCFA, EUR, USD, CAD, GBP, MAD**, codes acceptés
  par PayTech dans le paramètre `currency`. Aucune n'est présentée comme disponible.

### Activer PayTech plus tard

Documentation de référence : <https://docs.intech.sn/doc_paytech.php>.

1. **Compte** : créer le compte sur paytech.sn et demander son activation (contact@paytech.sn, objet
   « Activation Compte PayTech », pièces demandées : notamment NINEA et documents de la fondation).
2. **Confirmer par écrit avec PayTech** : les moyens de paiement ouverts au compte (Orange Money, Wave, Free
   Money, carte…), les **devises** réellement acceptées pour ce compte parmi XOF, EUR, USD, CAD, GBP, MAD, les
   frais, et l'existence ou non du don récurrent (non décrit dans la documentation consultée).
3. **Clés** : récupérer la clé API et la clé secrète dans le tableau de bord PayTech, et les ajouter
   **uniquement** dans Vercel > Settings > Environment Variables : `PAYTECH_API_KEY`, `PAYTECH_API_SECRET`,
   `PAYTECH_ENV=test`. Jamais dans le code, jamais dans une variable `NEXT_PUBLIC_*`.
4. **Développement** (à faire par un développeur, environ une journée) :
   - une route serveur `POST /api/dons` qui valide montant, devise et affectation, enregistre le don « en
     attente » dans la base (collection `dons`) avec une référence unique, puis appelle `requestPayment()` ;
   - une route `POST /api/paytech/ipn` qui vérifie la signature avec `verifyIpn()`, contrôle référence, montant,
     devise et environnement, et **seule** fait passer un don à « payé » (jamais sur la base d'un retour visible
     dans le navigateur) ;
   - les pages de retour (merci, annulé) qui affichent l'état lu sur le serveur ;
   - le formulaire de don (montants en FCFA 2 000 à 50 000 et montant libre, choix de la devise si confirmé) ;
   - les logos de moyens de paiement, **seulement** ceux confirmés par PayTech (`confirmedPaymentMethods`).
5. **Essais** en `PAYTECH_ENV=test` : paiement réussi, annulé, échoué, notification rejouée, montant modifié.
   En mode test, PayTech débite un petit montant (100 à 150 FCFA d'après sa documentation).
6. **Ouverture** : passer `onlineDonationsEnabled` à `true`, `PAYTECH_ENV=prod`, mettre à jour la page
   « Conditions de don », la FAQ et la politique de confidentialité, puis faire un vrai don de faible montant.

## Logo et images

- **Logo officiel** : fourni par la fondation, recadré (sans bandes noires, sans retouche ni déformation) dans
  `public/images/logo/` : `logo-embleme.png` (en-tête, pied de page, icône du site) et `logo-fondation-complet.png` (visuel officiel, aussi utilisé en bannière d'accueil)
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

## Messages des formulaires

Les messages (contact, bénévolat, partenariat) sont enregistrés dans la base de données et consultables par les
administrateurs dans **Administration > Messages**. Ils peuvent aussi être transférés vers un webhook HTTPS
(`FORMS_WEBHOOK_URL`) pour être reçus par e-mail via Make, Zapier, n8n, etc.

## Sécurité, accessibilité et performances

- En-têtes de sécurité (CSP stricte, HSTS en production, anti-iframe, `nosniff`) dans `next.config.ts`.
- Formulaires : validation serveur, vérification d'origine (anti-CSRF), limite de débit, champ piège et délai
  minimal anti-robots, sans captcha contraignant.
- Navigation au clavier, lien d'évitement, focus visible, libellés et messages d'erreur reliés aux champs,
  annonces pour lecteurs d'écran, contrastes AA, réduction des animations respectée (`prefers-reduced-motion`).
- Pages légères, images en WebP aux bonnes dimensions, polices optimisées, aucune bibliothèque
  JavaScript tierce.
- SEO : titres et descriptions par page, Open Graph, image de partage générée, `sitemap.xml` (fiches publiées
  incluses automatiquement), `robots.txt`, données structurées FAQ. L'administration n'est pas indexée.
- Administration : mots de passe hachés (scrypt), cookie de session `HttpOnly`, `SameSite=Lax` et `Secure`,
  expiration après 8 heures, vérification d'origine sur chaque modification, droits vérifiés côté serveur pour
  chaque action, validation serveur de toutes les données, limitation des tentatives de connexion.
