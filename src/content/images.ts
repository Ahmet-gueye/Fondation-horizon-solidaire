/**
 * Images d'illustration libres de droits, hébergées sur le site (`public/images/illustrations/`).
 * Licences : Unsplash (https://unsplash.com/license) et Pexels (https://www.pexels.com/license/) :
 * usage gratuit, sans autorisation préalable. Chaque photo a été regardée avant d'être retenue
 * (contexte africain, de préférence sénégalais ; pas d'enfant identifiable au premier plan).
 *
 * IMPORTANT : ces photos NE représentent PAS des actions, des bénéficiaires ni des lieux
 * d'intervention de la fondation. Elles sont toujours signalées « Image d'illustration ».
 * Remplacez-les par vos propres photos (avec consentement) dès que possible.
 */

export type StockImage = {
  src: string;
  alt: string;
  author: string;
  source: "Unsplash" | "Pexels";
  page: string; // page de la photo (crédit et licence)
  location?: string;
};

const dir = "/images/illustrations";

export const stock = {
  marche: {
    src: `${dir}/marche-senegal.jpg`,
    alt: "Femmes vendant fruits, légumes et céréales sur un marché au Sénégal",
    author: "Wietse Jongsma",
    source: "Unsplash",
    page: "https://unsplash.com/photos/people-are-selling-goods-at-a-bustling-marketplace-DTUFoTIhzgU",
    location: "Sénégal",
  },
  village: {
    src: `${dir}/village-senegal.jpg`,
    alt: "Habitants d'un village sénégalais portant des bassines entre les cases",
    author: "Wietse Jongsma",
    source: "Unsplash",
    page: "https://unsplash.com/photos/people-are-working-in-a-small-african-village-DJa0dqgMluM",
    location: "Sénégal",
  },
  lacRose: {
    src: `${dir}/lac-rose-sel.jpg`,
    alt: "Travailleurs récoltant le sel au bord du lac Rose",
    author: "Seyni Diouck",
    source: "Unsplash",
    page: "https://unsplash.com/photos/2g8mNsYL5u8",
    location: "Lac Rose, Sénégal",
  },
  reunion: {
    src: `${dir}/reunion-communautaire.jpg`,
    alt: "Hommes et femmes réunis lors d'une rencontre communautaire",
    author: "Random Institute",
    source: "Unsplash",
    page: "https://unsplash.com/photos/a-diverse-group-of-people-sitting-together-fOeH7Nh2oy0",
    location: "Afrique de l'Ouest",
  },
  agricultrices: {
    src: `${dir}/agricultrices.jpg`,
    alt: "Femmes cultivant leur parcelle au milieu des palmiers",
    author: "Annie Spratt",
    source: "Unsplash",
    page: "https://unsplash.com/photos/woman-planting-during-daytime-QYcSeY7vuZM",
    location: "Sierra Leone",
  },
  cahier: {
    src: `${dir}/etude-cahier.jpg`,
    alt: "Une élève trace des lignes à la règle dans son cahier",
    author: "David Geneugelijk",
    source: "Unsplash",
    page: "https://unsplash.com/photos/a-student-carefully-draws-lines-with-a-ruler-zzcHmwBaG0w",
  },
  formation: {
    src: `${dir}/formation-classe.jpg`,
    alt: "Un formateur anime une séance devant une salle d'apprenants",
    author: "Aristide Ouedraogo",
    source: "Pexels",
    page: "https://www.pexels.com/photo/african-classroom-training-session-with-uniformed-students-31820972/",
    location: "Afrique",
  },
  soignant: {
    src: `${dir}/soignant-stethoscope.jpg`,
    alt: "Un soignant souriant tend son stéthoscope",
    author: "Hush Naidoo Jade Photography",
    source: "Unsplash",
    page: "https://unsplash.com/photos/5HrQmJkIP_U",
    location: "Durban, Afrique du Sud",
  },
  celebration: {
    src: `${dir}/celebration-senegal.jpg`,
    alt: "Jeunes adultes célébrant avec des drapeaux du Sénégal",
    author: "Felipe Esono Nguema",
    source: "Pexels",
    page: "https://www.pexels.com/photo/vibrant-celebration-with-senegal-flags-36598097/",
    location: "Sénégal",
  },
  pecheurs: {
    src: `${dir}/pecheurs-dakar.jpg`,
    alt: "Pêcheurs ramenant leur pirogue sur la plage",
    author: "Amaury Michaux",
    source: "Pexels",
    page: "https://www.pexels.com/photo/fishermen-with-fishing-boat-on-sea-shore-in-senegal-18189731/",
    location: "Dakar, Sénégal",
  },
  goree: {
    src: `${dir}/plage-goree.jpg`,
    alt: "Plage animée au pied des maisons colorées",
    author: "Amaury Michaux",
    source: "Pexels",
    page: "https://www.pexels.com/photo/sea-shore-in-town-in-senegal-18189694/",
    location: "Dakar, Sénégal",
  },
  rufisque: {
    src: `${dir}/rue-rufisque.jpg`,
    alt: "Charrette tirée par un cheval dans une rue de Rufisque",
    author: "Papa Birame Faye",
    source: "Pexels",
    page: "https://www.pexels.com/photo/man-on-a-chaise-in-a-narrow-alley-14598168/",
    location: "Rufisque, Sénégal",
  },
} satisfies Record<string, StockImage>;

/** Grande photo de la page d'accueil. */
export const heroImage = stock.marche;
