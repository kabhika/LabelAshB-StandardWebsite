// The New Collection - 18 garments supplied as generative re-shoots
// (new-images/README.md) with a consistent model and studio backdrop.
//
// STATUS (Aug 31 2026, evening): this is now a registry, not a browsable
// lookbook - every garment has a single home on the site: 8 rotate on
// the homepage hero (HERO_SLUGS below) and 10 serve as presentation
// imagery on the last mannequin-shot products (PRESENTATION_SWAPS in
// product-reshoots.ts). The /collection routes and homepage section were
// removed in the same change so no garment appears in two places.
//
// Content rules for this file:
// - Names follow the brand's poetic-noun voice ("Petal Cascade",
//   "Meadow Whisper") and are checked against live catalog titles to avoid
//   collisions. They are proposals - Binita has final say.
// - Descriptions state only what is visible in the images: colour,
//   silhouette, neckline, embroidery motif, length, styling. No fabric
//   claims (unverifiable from images), no prices (not set yet).
// - Category assignment follows the garment type, matching the three
//   catalog categories the rest of the site already filters on.

import { getReshootBySlug } from "./product-reshoots";

export type CollectionCategory = "Dresses" | "Tops" | "Co-ord Sets";

export interface CollectionGarment {
  slug: string;
  name: string;
  category: CollectionCategory;
  shortDescription: string;
  description: string;
  views: {
    front: string;
    threeQuarter: string;
    side: string;
    back: string;
    detail: string;
  };
}

const img = (slug: string, file: string) => `/collection/${slug}/${file}`;

const garment = (
  slug: string,
  name: string,
  category: CollectionCategory,
  shortDescription: string,
  description: string,
): CollectionGarment => ({
  slug,
  name,
  category,
  shortDescription,
  description,
  views: {
    front: img(slug, "01-front-view.jpg"),
    threeQuarter: img(slug, "02-three-quarter-front-view.jpg"),
    side: img(slug, "03-side-view.jpg"),
    back: img(slug, "04-back-view.jpg"),
    detail: img(slug, "05-close-up-detail.jpg"),
  },
});

export const collectionGarments: CollectionGarment[] = [
  garment(
    "01-mauve-embroidered-shirt",
    "Mauve Sonnet Shirt",
    "Tops",
    "Dusty mauve with tone-on-tone embroidery",
    "A hip-length shirt in dusty mauve, embroidered tone-on-tone across the body. The spread collar, full button placket and buttoned cuffs make it as easy over trousers as it is on its own.",
  ),
  garment(
    "02-magenta-heart-embroidered-shirt",
    "Heartline Magenta Shirt",
    "Tops",
    "Deep magenta scattered with heart embroidery",
    "Deep magenta scattered with tiny heart embroidery. A relaxed collared shirt with buttoned cuffs - playful without saying a word.",
  ),
  garment(
    "03-purple-applique-v-neck-tunic",
    "Dusk Applique Tunic",
    "Tops",
    "Deep purple traced with contrast applique",
    "A deep-purple tunic traced with contrast applique along the neckline and hem. The V-neck keeps it open and easy - wear it over slim trousers for the longest line.",
  ),
  garment(
    "04-coral-blue-leaf-mandarin-shirt",
    "Leafsong Mandarin Shirt",
    "Tops",
    "Coral ground, blue leaf vines, mandarin collar",
    "A coral shirt embroidered with blue leaf vines along the placket, collar and yoke. The mandarin collar keeps it neat - jewellery optional.",
  ),
  garment(
    "05-brown-running-stitch-botanical-shirt",
    "Botanical Stitch Shirt",
    "Tops",
    "Warm brown outlined with running-stitch stems",
    "A warm brown shirt outlined with botanical running-stitch embroidery, stem by stem. Understated on purpose - the stitch is the story.",
  ),
  garment(
    "06-red-navy-check-a-line-dress",
    "The Weekend Check Dress",
    "Dresses",
    "Red-and-navy check A-line with a white collar",
    "A bold red-and-navy check A-line with a crisp white collar, cut to swing just below the knee. Picnic-table classic, cut for grown-ups.",
  ),
  garment(
    "07-fuchsia-double-button-maxi-dress",
    "Fuchsia Chapter Maxi",
    "Dresses",
    "Fuchsia maxi with a double-button bodice",
    "A fuchsia maxi with a double-button placket running down the bodice and a skirt that moves with you. Deep, bright and unapologetic.",
  ),
  garment(
    "08-mint-butterfly-a-line-dress",
    "Butterfly Meadow Dress",
    "Dresses",
    "Pale mint scattered with embroidered butterflies",
    "Pale mint scattered with embroidered butterflies. A square neck and full skirt keep it light on the busiest of days.",
  ),
  garment(
    "09-camel-cream-charcoal-colourblock-dress",
    "Dune Colourblock Dress",
    "Dresses",
    "Camel, cream and charcoal in quiet panels",
    "Camel, cream and charcoal in quiet colourblock panels. A below-the-knee midi that structures an outfit on its own.",
  ),
  garment(
    "10-ivory-floral-embroidered-v-neck-dress",
    "Chamomile Dress",
    "Dresses",
    "Ivory ground, tiny multicolour flowers",
    "An ivory dress embroidered all over with tiny multicolour flowers, softened by a V-neckline. The kind of dress that carries a day out by itself.",
  ),
  garment(
    "11-coral-cutwork-mock-neck-long-dress",
    "Coral Cutwork Maxi",
    "Dresses",
    "Coral cutwork bands down a mock-neck column",
    "Coral cutwork in bands down a long, mock-neck silhouette. Airy because of the openwork, dramatic because of the length.",
  ),
  garment(
    "12-hot-pink-high-low-shirt-set",
    "High Notes Shirt Set",
    "Co-ord Sets",
    "Hot-pink high-low shirt with trousers",
    "A hot-pink shirt with a high-low hem over matching trousers. Two pieces, one statement.",
  ),
  garment(
    "13-deep-red-geometric-print-set",
    "Tile & Terra Set",
    "Co-ord Sets",
    "Deep red with a fine geometric border print",
    "Deep red printed with a fine geometric border, cut as a kurta-and-trouser set. Quietly festive.",
  ),
  garment(
    "14-pale-yellow-split-neck-tunic-set",
    "First Light Tunic Set",
    "Co-ord Sets",
    "Pale yellow, split neck, cutwork trim",
    "A pale-yellow tunic set with a split neck and delicate cutwork trim. Soft colour, soft lines.",
  ),
  garment(
    "15-navy-shibori-yellow-polka-set",
    "Night Sky Polka Set",
    "Co-ord Sets",
    "Navy shibori texture, yellow polka dots",
    "Navy shibori texture dotted with yellow polka, as a shirt-and-trouser set. The print does the talking.",
  ),
  garment(
    "16-pink-striped-fringe-a-line-dress",
    "Carnation Fringe Dress",
    "Dresses",
    "Pink stripes finishing in a fringe hem",
    "Pink-and-white stripes on an A-line that finishes in a fringe. It moves with every step.",
  ),
  garment(
    "17-navy-ochre-small-floral-square-neck-dress",
    "Night Garden Dress",
    "Dresses",
    "Navy ground, small ochre flowers, square neck",
    "A navy ground scattered with small ochre flowers, a square neck and short puffed sleeves. An easy everyday dress with a romantic streak.",
  ),
  garment(
    "18-cream-teal-mustard-halter-floral-dress",
    "Meadowlark Halter Dress",
    "Dresses",
    "Cream, teal and mustard florals on a halter",
    "Cream, teal and mustard florals on a halter dress that ties at the neck. Made for warm evenings.",
  ),
];

export const collectionCategories: CollectionCategory[] = [
  "Dresses",
  "Tops",
  "Co-ord Sets",
];

export function getGarment(slug: string): CollectionGarment | undefined {
  return collectionGarments.find((g) => g.slug === slug);
}

// Hero curation (Sep 1 2026): the rotation has been progressively
// emptied by the mannequin sweeps - batches 2 and 3 donated six of the
// eight evening picks to product pages (products win over hero, per the
// client's precedent). Two slides remain: coral mandarin and purple
// tunic. Restore variety when the next image batch arrives - candidate
// garments must not be placed on any product page.
const HERO_SLUGS = [
  "04-coral-blue-leaf-mandarin-shirt",
  "03-purple-applique-v-neck-tunic",
];

// Kept for future re-shoot hero picks: display names for reshoot slugs
// (their Shopify titles aren't known at build time).
const RESHOOT_HERO_NAMES: Record<string, string> = {};

interface HeroGarment {
  name: string;
  short: string;
  front: string;
  detail: string;
}

function heroGarment(slug: string): HeroGarment | null {
  const lookbook = getGarment(slug);
  if (lookbook) {
    return {
      name: lookbook.name,
      short: lookbook.shortDescription,
      front: lookbook.views.front,
      detail: lookbook.views.detail,
    };
  }
  const reshoot = getReshootBySlug(slug);
  if (reshoot) {
    return {
      name: RESHOOT_HERO_NAMES[slug] ?? slug,
      short: reshoot.description.split(/[.!?]/)[0] + ".",
      front: reshoot.views[0],
      detail: reshoot.views[reshoot.views.length - 1],
    };
  }
  return null;
}

export function collectionHeroSlides() {
  return HERO_SLUGS.map((slug) => {
    const g = heroGarment(slug)!;
    return {
      url: g.front,
      alt: `${g.name} - ${g.short}`,
      name: g.name,
    };
  });
}

export function collectionHeroDetails() {
  return HERO_SLUGS.map((slug) => {
    const g = heroGarment(slug)!;
    return {
      url: g.detail,
      alt: `${g.name} - close-up detail`,
    };
  });
}
