// The New Collection - registry of garments: 18 supplied as generative
// re-shoots (new-images/README.md) with a consistent model and studio
// backdrop, plus two real-photography pieces added Oct 17 2026.
//
// STATUS (Aug 31 2026, evening): this is now a registry, not a browsable
// lookbook - each garment has at most one home on the site: the current
// hero set rotates on the homepage (HERO_SLUGS below), 10 serve as
// presentation imagery on the last mannequin-shot products
// (PRESENTATION_SWAPS in product-reshoots.ts), and the rest wait in the
// registry for a placement. The /collection routes and homepage section
// were removed in that change so no garment appears in two places.
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
  // Hero refresh (Oct 17 2026, corrected same night): real atelier
  // photography, replacing the last two AI-model slides. One garment,
  // one home is the standing rule: the first two picks (Drive folders
  // 42/45) had to be pulled again because catalog.ts's
  // PRODUCT_IMAGE_OVERRIDES already dresses live product pages with
  // those exact photos (Regal Amethyst Co-ord Set, Crimson Tiles dress).
  // These two garments appear nowhere else on the site; all ten source
  // photos are native 2:3 (1024x1536), so the carousel's fixed frames
  // show them whole with no cropping and no trimming.
  garment(
    "21-noor-ajrakh-dress",
    "Noor Ajrakh Dress",
    "Dresses",
    "An Anarkali in warm brown, printed with mustard and blue",
    "A floor-sweeping Anarkali in warm brown, printed with mustard-gold, tan and blue motifs. The V-neckline runs into a buttoned placket; three-quarter sleeves and a full skirt that moves when you do.",
  ),
  garment(
    "22-ruby-heritage-tunic",
    "Ruby Heritage Tunic",
    "Tops",
    "Red embroidered with ivory geometry",
    "A red tunic embroidered across the front with ivory geometric bands, shown over a flared skirt. Quietly festive - the kind of piece that carries an evening on its own.",
  ),
  // Rotation expansion (Oct 17 2026, later the same night): the client
  // asked for six different hero images on ONE consistent studio
  // background. The only white-studio garments in the pool are Noor
  // Ajrakh (43 - above), Midnight Botanical (41) and Regal Amethyst
  // (42), and 41/42 are already the photography of live product pages
  // (catalog.ts PRODUCT_IMAGE_OVERRIDES). The client's instruction
  // wins: these two join the rotation WITH that overlap - a hero that
  // features a shoppable product is standard practice, and every photo
  // here is trimmed to exact 2:3 (empty backdrop only, model intact)
  // so the front-left / back-right / no-cropping rules hold. Sources
  // are copies, not references, so the product galleries keep their
  // full-frame originals.
  garment(
    "23-midnight-botanical-set",
    "Midnight Botanical Set",
    "Co-ord Sets",
    "A dark botanical kaftan over printed trousers",
    "A dark kaftan scattered with botanical print over matching flowing trousers. Easy enough for a slow morning, dressy enough for dinner.",
  ),
  garment(
    "24-regal-amethyst-coord",
    "Regal Amethyst Co-ord",
    "Co-ord Sets",
    "Violet traced with white cutwork florals",
    "A violet tunic with flared sleeves and a high-low hem over matching trousers, traced with white cutwork florals along the sleeves, hemline and trouser cuffs.",
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

// Hero set (Oct 30 2026): the client's new WhatsApp batch, processed by
// .match/prep-new-hero.mjs into public/hero/ as 4:5 portraits (880x1100,
// subject-centered windows - a 2:3 window clipped four of the six, see
// the script). Supersedes the Oct 17 atelier-set rotation (folders 21/
// 23-midnight/24 - those files stay for their product pages). Two of the
// garments carry two poses (01+05 black co-ord, 04+06 ivory co-ord); the
// terracotta set (02) and printed maxi (03) are single-shot and serve as
// each other's companion panel - both warm-beige studio, so the pair
// reads as one editorial spread. Rotation order: the four primary poses
// first, then the two alternate poses.
const HERO_SET: { file: string; name: string; view: string; companion: string; companionView: string }[] = [
  { file: "01.jpg", name: "Black hand-embroidered co-ord set", view: "front view", companion: "05.jpg", companionView: "second pose" },
  { file: "02.jpg", name: "Terracotta co-ord set", view: "front view", companion: "03.jpg", companionView: "printed maxi dress" },
  { file: "03.jpg", name: "Printed maxi dress", view: "front view", companion: "02.jpg", companionView: "terracotta co-ord set" },
  { file: "04.jpg", name: "Ivory co-ord set", view: "front view", companion: "06.jpg", companionView: "second pose" },
  { file: "05.jpg", name: "Black hand-embroidered co-ord set", view: "second pose", companion: "01.jpg", companionView: "front view" },
  { file: "06.jpg", name: "Ivory co-ord set", view: "second pose", companion: "04.jpg", companionView: "front view" },
];

const heroImg = (file: string) => `/hero/${file}`;

export function collectionHeroSlides() {
  return HERO_SET.map((slide) => ({
    url: heroImg(slide.file),
    alt: `${slide.name} - ${slide.view}`,
    name: slide.name,
  }));
}

export function collectionHeroDetails() {
  // Companion panel: the same garment's second pose when one exists
  // (01+05, 04+06); the two single-shot garments show each other (see
  // HERO_SET note). The old back-view rule followed the atelier set's
  // five-view folders - this batch has no back views.
  return HERO_SET.map((slide) => ({
    url: heroImg(slide.companion),
    alt: `${slide.name} - ${slide.companionView}`,
  }));
}
