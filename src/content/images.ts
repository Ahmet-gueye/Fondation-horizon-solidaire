/**
 * Images d'illustration libres de droits (licence Unsplash : usage gratuit,
 * commercial ou non, sans autorisation requise — https://unsplash.com/license).
 *
 * IMPORTANT : ces photos NE représentent PAS des actions, des bénéficiaires ni des
 * lieux d'intervention de la fondation. Elles sont toujours signalées « Image
 * d'illustration » sur le site. Remplacez-les par vos propres photos (avec
 * consentement) dès que possible.
 *
 * Les images sont servies par le CDN d'Unsplash (images.unsplash.com).
 * Pour les auto-héberger : téléchargez-les dans `public/images/` et remplacez `src`.
 */

export type StockImage = {
  src: string;
  alt: string;
  author: string;
  page: string; // page Unsplash de la photo (crédit et licence)
  location?: string;
};

const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const stock = {
  marche: {
    src: u("photo-1746510532757-12f5313275f1"),
    alt: "Marché animé au Sénégal, des commerçants vendent leurs produits",
    author: "Wietse Jongsma",
    page: "https://unsplash.com/photos/people-are-selling-goods-at-a-bustling-marketplace-DTUFoTIhzgU",
    location: "Sénégal",
  },
  village: {
    src: u("photo-1747889268735-31192c2a6df4"),
    alt: "Habitants au travail dans un petit village du Sénégal",
    author: "Wietse Jongsma",
    page: "https://unsplash.com/photos/people-are-working-in-a-small-african-village-DJa0dqgMluM",
    location: "Sénégal",
  },
  lacRose: {
    src: u("photo-1510263491918-15eb421bc6c1"),
    alt: "Paysage du lac Rose au Sénégal",
    author: "Seyni Diouck",
    page: "https://unsplash.com/photos/2g8mNsYL5u8",
    location: "Lac Rose, Sénégal",
  },
  stethoscope: {
    src: u("photo-1521089542882-2e5f5df7cae7"),
    alt: "Stéthoscope, symbole des soins de santé",
    author: "Hush Naidoo Jade Photography",
    page: "https://unsplash.com/photos/5HrQmJkIP_U",
  },
  consultation: {
    src: u("photo-1631558554226-fb65b25aa939"),
    alt: "Une soignante en blouse échange avec une patiente",
    author: "National Cancer Institute",
    page: "https://unsplash.com/photos/a-woman-in-a-doctors-coat-talking-to-another-woman-4SiOVKH3DYA",
  },
  livres: {
    src: u("photo-1666281269793-da06484657e8"),
    alt: "Groupe de femmes tenant des livres",
    author: "Fatima Yusuf",
    page: "https://unsplash.com/photos/a-group-of-women-holding-books-0sljWIZH4IQ",
  },
  regle: {
    src: u("photo-1744809495173-217ca4faa8bc"),
    alt: "Un élève trace des lignes à la règle dans son cahier",
    author: "David Geneugelijk",
    page: "https://unsplash.com/photos/a-student-carefully-draws-lines-with-a-ruler-zzcHmwBaG0w",
  },
  sacs: {
    src: u("photo-1786719664233-f7adaf17393a"),
    alt: "Des personnes chargent des sacs de vivres dans un camion",
    author: "Karata My",
    page: "https://unsplash.com/photos/people-loading-sacks-into-truck-heovropZuTA",
  },
  groupe: {
    src: u("photo-1761666520005-3ffcf13e74c8"),
    alt: "Un groupe de personnes assises ensemble pour échanger",
    author: "Random Institute",
    page: "https://unsplash.com/photos/a-diverse-group-of-people-sitting-together-fOeH7Nh2oy0",
  },
  cultures: {
    src: u("photo-1509099381441-ea3c0cf98b94"),
    alt: "Femmes cultivant leur champ",
    author: "Annie Spratt",
    page: "https://unsplash.com/photos/woman-planting-during-daytime-QYcSeY7vuZM",
    location: "Sierra Leone",
  },
  benevoles: {
    src: u("photo-1599059813005-11265ba4b4ce"),
    alt: "Des bénévoles trient des dons alimentaires",
    author: "Joel Muniz",
    page: "https://unsplash.com/photos/volunteers-sorting-canned-food-donations-3k3l2brxmwQ",
  },
  champ: {
    src: u("photo-1734036871909-906fb9b3d474"),
    alt: "Champ verdoyant avec des maisons au loin",
    author: "Joe Ol",
    page: "https://unsplash.com/photos/a-green-field-with-houses-in-the-distance-ZY0u6We7rDE",
  },
  pirogues: {
    src: u("photo-1761471420566-5ca748e79afc"),
    alt: "Pirogues colorées amarrées dans un port bordé de palmiers",
    author: "Mohamed Habib Mbodj",
    page: "https://unsplash.com/photos/colorful-fishing-boats-docked-in-a-harbor-with-palm-trees-3CHwHTZGJiU",
  },
} satisfies Record<string, StockImage>;
