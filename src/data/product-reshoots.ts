// Product re-shoots: on-model photography for 23 existing catalog
// products whose Shopify images are mannequin/flat shots. Folders
// 18-40 of new-images/ (see .match/optimize-reshoots.mjs for the
// import that produced public/collection/<slug>/NN.jpg; view order is
// the folder's natural sort - verified front, three-quarter, side,
// back, close-up).
//
// Descriptions, prices and SKUs come from the client's spreadsheet
// (new-images/Untitled spreadsheet.xlsx, Sheet1) verbatim - including
// its quirks, which are flagged here rather than silently fixed:
// - row 11's description is the same text as row 19 (Terra's); it does
//   not describe the coral cutwork garment.
// - rows 08, 10, 13, 16, 17, 19 have no price in the sheet.
// - row 18's price is the pair "2850+1999" (top + pants).
// Prices here are REFERENCE ONLY - what the site charges is the
// Shopify variant price; mismatches are reported, not overridden.
//
// The catalog layer (src/lib/shopify/catalog.ts) applies these as an
// image/description override while keeping the product's Shopify
// identity (handle, variants, prices, stock) untouched, so checkout
// keeps working and the future Shopify CSV import can absorb these
// photos at the source.

export interface ReshootGarment {
  slug: string;
  handle: string;
  sheetName: string;
  sku: string;
  sheetPrice?: string;
  description: string;
  views: string[];
}

const g = (
  slug: string,
  handle: string,
  sku: string,
  sheetPrice: string | undefined,
  description: string,
): ReshootGarment => ({
  slug,
  handle,
  sheetName: slug,
  sku,
  sheetPrice,
  description,
  views: Array.from(
    { length: { "18-ivory-pure-chanderi-silk-top": 5, "19-terra-linen-co-ord-set": 5, "20-flutter-flow-linen-dress": 5, "21-azure-whisper-linen-top": 5, "22-lavender-cascade-linen-dress": 5, "23-celeste-line-linen-top": 5, "24-golden-lattice-linen-wrap-dress": 5, "25-ivory-bloom-hand-embroidered-linen-co-ord-set": 5, "26-ivory-drift-one-shoulder-modal-silk-dress": 5, "27-meadow-whisper-hand-embroidered-linen-dress": 5, "28-scarlet-ember-linen-halter-dress": 5, "29-blush-verse-hand-embroidered-linen-set": 5, "30-alabaster-breeze-kaftan": 4, "31-petal-cascade-dress": 4, "32-miraya-pocket-midi": 4, "33-crimson-grid-sleeveless-top": 4, "34-flutter-and-bloom-button-down": 4, "35-the-riviera-tunic": 3, "36-gilded-garden-chanderi-coord-set": 5, "37-slate-bloom-shirt-dress": 5, "38-cloud-leaf-pure-linen-top": 5, "39-meadow-script-linen-co-ord-set": 5, "40-folk-tale-linen-co-ord-set": 5 }[slug] ?? 0 },
    (_, i) => `/collection/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
  ),
});

export const productReshoots: ReshootGarment[] = [
  g("18-ivory-pure-chanderi-silk-top", "the-ivory-starlight-ikat-set", "SU-M-18", "2850+1999",
    "Crafted for effortless elegance, this Ivory Mul Chanderi Top and Double Ikat Pants set blends comfort with artisanal charm. The lightweight top features a softly gathered neckline, delicate embellishments, and airy three-quarter sleeves, while the statement double ikat wide-leg pants add a bold handcrafted touch. Perfect for brunches, festive gatherings, and everyday sophistication."),
  g("19-terra-linen-co-ord-set", "the-terracotta-horizon-tunic-set", "SU-M-19", undefined,
    "Effortlessly elegant and endlessly comfortable, this pure linen co-ord set features a relaxed mandarin-collar tunic with delicate button detailing, paired with striped wide-leg pants. Crafted from breathable natural linen, it's designed for all-day comfort and timeless style—perfect for work, travel, brunches, and everyday wear."),
  g("20-flutter-flow-linen-dress", "the-flutter-story-papillon-noir-hand-embroidered-linen-dress", "SU-M-20", "5650",
    "Effortlessly striking and endlessly comfortable, this pure linen dress is designed to make a statement with ease. The sleek sleeveless silhouette is adorned with vibrant butterfly embroidery that appears to flutter gracefully across the dress, adding a touch of artistry and whimsy. Crafted from breathable linen in a timeless black hue, it offers a flattering drape and all-day comfort. Perfect for brunches, vacations, and relaxed evenings, this dress blends playful charm with understated elegance."),
  g("21-azure-whisper-linen-top", "azure-whisper-linen-top", "SU-M-21", "3399",
    "Fresh, relaxed, and effortlessly stylish, this pure linen top is designed for easy everyday elegance. Crafted in a soothing sky-blue hue, it features a flattering V-neckline accented with delicate hand embroidery and charming loop-button details for a touch of artisanal character. The contrast ivory trims and gently curved hem add a contemporary finish, while the breathable linen fabric ensures all-day comfort. A perfect blend of comfort, craftsmanship, and timeless style."),
  g("22-lavender-cascade-linen-dress", "amethyst-tide-layered-linen-dress-set", "SU-M-22", "7600",
    "Graceful and effortlessly refined, this pure linen dress is designed to make a statement through its thoughtful details. The flowing silhouette is elevated with cascading layered panels across the bodice and sleeves, creating beautiful movement and a contemporary sculptural look. Rendered in a soft lavender hue, it combines the breathable comfort of linen with understated sophistication. The relaxed fit, elegant neckline, and dramatic tiered sleeves make it a versatile choice for intimate gatherings, festive occasions, and elevated everyday dressing."),
  g("23-celeste-line-linen-top", "celeste-line-linen-top", "SU-M-23", "2499",
    "Fresh, modern, and effortlessly comfortable, this pure linen top is designed for easy everyday elegance. Crafted in a refreshing aqua blue hue, it features a contemporary high neckline and relaxed silhouette that drapes beautifully for a flattering fit. Delicate lace insert detailing along the front and raglan seams adds subtle texture and artisanal charm, while the curved hem lends a soft, modern finish."),
  g("24-golden-lattice-linen-wrap-dress", "golden-lattice-linen-wrap-dress", "SU-M-24", "4900",
    "Fresh, feminine, and effortlessly elegant, this sleeveless dress is crafted in a soft pastel yellow hue adorned with a delicate geometric floral print. The tailored bodice, notched collar, and gently flared silhouette create a flattering shape, while the flowing skirt adds graceful movement with every step. Thoughtfully designed with functional side pockets and a lightweight feel, it offers the perfect balance of comfort and sophistication."),
  g("25-ivory-bloom-hand-embroidered-linen-co-ord-set", "ivory-bloom-hand-embroidered-linen-co-ord-set", "SU-M-25", "5700",
    "Minimalist with a touch of artistry, this sleeveless pure linen top is designed for effortless everyday elegance. Crafted in a soft ivory hue, it features delicate floral embroidery at the shoulder, adding a subtle pop of colour and handcrafted charm. The clean silhouette and breathable linen fabric ensure all-day comfort, while the versatile design makes it easy to pair with trousers, skirts, or coordinating separates."),
  g("26-ivory-drift-one-shoulder-modal-silk-dress", "ivory-drift-one-shoulder-modal-silk-dress", "SU-M-26", "3500",
    "Graceful, artistic, and effortlessly elegant, this one-shoulder midi dress is designed to make a statement with understated charm. Crafted from soft, breathable fabric, it features a delicate all-over print accented by a beautifully detailed border hem that adds depth and character to the silhouette. The asymmetrical neckline is enhanced with a charming shoulder tie detail, lending a modern yet feminine touch. Cut in a relaxed A-line shape, the dress drapes beautifully, offering comfort and movement for every occasion."),
  g("27-meadow-whisper-hand-embroidered-linen-dress", "meadow-whisper-hand-embroidered-linen-dress", "SU-M-27", "5999",
    "The Meadow Whisper Hand-Embroidered Linen Dress is crafted from premium linen in a soothing sage-green tone, chosen for its breathability, lightness, and natural texture. Delicate floral motifs rise gently along the silhouette, hand embroidered with care and precision. The relaxed silhouette is designed for comfort and ease, finished with soft sleeves and a gathered hem that adds movement without excess. Every dress is individually cut, embroidered, and hand finished, making each piece subtly unique."),
  g("28-scarlet-ember-linen-halter-dress", "scarlet-ember-linen-halter-dress", "SU-M-28", "4700",
    "Bold yet effortlessly refined, this scarlet red linen dress features a graceful halter neckline accented with delicate cutwork and soft pleat detailing. The fluid midi silhouette offers beautiful movement and breathable comfort, making it a striking choice for daytime gatherings, evening outings, and everything in between."),
  g("29-blush-verse-hand-embroidered-linen-set", "blush-verse-hand-embroidered-linen-co-ord-set", "SU-M-29", "8990",
    "The Blush Verse Hand-Embroidered Linen Long Skirt and Top Set is crafted from premium linen in a soft blush pink tone, designed as a contemporary expression of slow fashion. The sleeveless crop top features delicate hand embroidery, drawn like a verse across the fabric. It is paired with a flowing high-waisted skirt detailed with subtle vertical lines, giving the set structure while allowing movement. Light, breathable, and thoughtfully constructed, the set balances softness with visual distinction."),
  g("30-alabaster-breeze-kaftan", "alabaster-breeze-kaftan", "SU-M-30", "6900",
    "Fluid, elegant, and effortlessly striking, this pure crepe silk kaftan is designed in a luminous ivory hue that drapes beautifully with every movement. The flowing silhouette is complemented by a statement floral embroidery at the shoulder, adding depth and artistry to its minimalist design. Light, graceful, and timeless, it is a piece that embodies quiet luxury and refined sophistication."),
  g("31-petal-cascade-dress", "petal-cascade-dress", "SU-M-31", "2625",
    "Soft lilac pink hues and delicate floral embroidery come together in this effortlessly elegant Chambray cotton dress. Designed with a graceful halter neckline and flowing maxi silhouette, it offers beautiful movement and all-day comfort. Light, airy, and timeless, it's the perfect choice for warm days, intimate celebrations, and easy summer dressing."),
  g("32-miraya-pocket-midi", "miraya-pocket-midi", "SU-M-32", "2999",
    "Vibrant red hues and bold ivory botanical prints bring this modal cotton midi dress to life. Designed with a mandarin-neck yoke, flowing tiers, ruffled sleeve cuffs, and concealed side pockets, it offers effortless movement and everyday comfort. Soft, breathable, and full of character, it's a joyful piece made for celebrations, getaways, and easy days alike."),
  g("33-crimson-grid-sleeveless-top", "crimson-grid-sleeveless-top", "SU-M-33", "1838",
    "Crafted from pure linen in a rich red and slate blue ikat check, this sleeveless top blends artisanal charm with everyday ease. Featuring a flattering round neckline, structured shoulders, and wooden button detailing at the side, it offers a clean, versatile silhouette that pairs effortlessly with both casual and elevated looks."),
  g("34-flutter-and-bloom-button-down", "flutter-bloom-button-down", "SU-M-34", "3150",
    "Crafted from pure linen in a soft dusty wisteria hue, this relaxed button-down shirt combines effortless comfort with delicate charm. Featuring a classic collar, full front placket, and curved hem, it is elevated with intricate floral and butterfly embroidery that adds a subtle artistic touch. Lightweight, breathable, and versatile, it's perfect for everyday elegance."),
  g("35-the-riviera-tunic", "the-riviera-tunic", "SU-M-35", "1499",
    "Fresh, airy, and effortlessly versatile, this pure linen tunic is designed for easy everyday wear. Featuring a relaxed sleeveless silhouette, a soft scoop neckline, and a wooden button placket, it offers timeless simplicity with a natural, understated charm. Lightweight and breathable, it's the perfect piece for warm days and effortless layering."),
  g("36-gilded-garden-chanderi-coord-set", "the-gilded-garden-shirt", "SU-M-36", "6400",
    "The Gilded Garden Chanderi Co-ord Set is crafted in luminous Chanderi silk, with a soft champagne-gold base that catches light gently without feeling loud. The kurta features dense white floral embroidery across the front, sleeves, and collar, with delicate lace edging adding definition to the neckline, placket, and cuffs. Pearl-style buttons complete the front, keeping the finish refined and feminine. Paired with matching trousers, this set carries the ease of a co-ord while still feeling occasion-ready."),
  g("37-slate-bloom-shirt-dress", "the-slate-bloom-shirt-dress", "SU-M-37", "3800",
    "The Slate Bloom Shirt Dress is crafted in chambray slate linen, designed to be worn as a dress or styled open over trousers. It features a pointed collar, full button placket, knee-length fall, and hand-stitched floral clusters arranged like a garden seen from above. Rose-pink, mauve, saffron yellow, and soft peach flowers sit across the chest and mirrored cuffs, bringing colour to the cool slate base. A cream crochet trim marks the waist seam and repeats at the sleeve edge, giving the silhouette structure without making it fussy."),
  g("38-cloud-leaf-pure-linen-top", "the-cloud-leaf-linen-top", "SU-M-38", "3699",
    "The Cloud Leaf Linen Top is crafted in off-white pure linen, very lightly woven and almost translucent in good light. The cut is generous, with soft sleeves, and a fall that sits below the hip with a curved hem. Across the shoulders and neckline, large cutwork leaf motifs are arranged in a loose cascade, each one open and architectural against the pale fabric. Scalloped edges add a quiet finish to the sleeves and hem."),
  g("39-meadow-script-linen-co-ord-set", "the-meadow-script-linen-shirt", "SU-M-39", "5800",
    "The Meadow Script Linen Co-ord Set is crafted in pure linen, with hand-crafted embroidery arranged like a small meadow across the front. Each motif has a quiet, asymmetrical placement, giving the set the feeling of a one-of-a-kind drawing rather than a repeated pattern. Bishop cuffs, a contemporary curved side hem, and matching wide-leg trousers create movement while keeping the silhouette composed."),
  // 40-folk-tale lives below in PRESENTATION_SWAPS + SWAP_DESCRIPTIONS:
  // its re-shoot folder turned out to be flat-lay photography (no model),
  // so the product takes the Ivory Bloom garment's on-model imagery while
  // keeping this sheet description (which describes the real product).
];

export const reshootsByHandle: Map<string, ReshootGarment> = new Map(
  productReshoots.map((r) => [r.handle, r]),
);

export function getReshootBySlug(slug: string): ReshootGarment | undefined {
  return productReshoots.find((r) => r.slug === slug);
}

// ---------------------------------------------------------------------------
// Presentation swaps: products whose Shopify photography is mannequin-
// style (or reads as such at card size) receive New Collection lookbook
// garments instead - images only, descriptions stay the product's own
// (the lookbook garments are different designs). Pairing is color/
// silhouette-nearest, every garment used once; garments donated here
// leave the hero rotation (one garment, one place on the site).
//
// Batch 1 (the "zoomout_" photo batch, verified headless forms):
//   10 products.
// Batch 2 (client-identified mannequin-reading photos from the ICM/IMG
//   shoots, Aug 31 2026 evening - client's screenshots named Coral Vine
//   and Dark Paisley; Crimson Tiles and the Fuchsia Linen Shirt are the
//   same shoots): 4 products, dressed with 4 garments donated from the
//   hero (hero thinned 8 -> 4 slides in new-collection.ts).
const LOOKBOOK_VIEW_FILES = [
  "01-front-view.jpg",
  "02-three-quarter-front-view.jpg",
  "03-side-view.jpg",
  "04-back-view.jpg",
  "05-close-up-detail.jpg",
];

export const PRESENTATION_SWAPS: Record<string, string> = {
  // handle -> lookbook garment slug
  "claret-cobalt-a-line": "06-red-navy-check-a-line-dress",
  "magenta-reverie": "16-pink-striped-fringe-a-line-dress",
  "olive-grove-dress": "09-camel-cream-charcoal-colourblock-dress",
  "dandelion-blush-shirt": "02-magenta-heart-embroidered-shirt",
  "the-indigo-swallow": "15-navy-shibori-yellow-polka-set",
  "the-mandarin-vine-shirt": "18-cream-teal-mustard-halter-floral-dress",
  "the-horizon-tunic": "11-coral-cutwork-mock-neck-long-dress",
  blossom: "14-pale-yellow-split-neck-tunic-set",
  "lime-green-linen-co-ord-set": "12-hot-pink-high-low-shirt-set",
  "the-saphire-flow-set": "13-deep-red-geometric-print-set",
  // batch 2 (hero-donated garments)
  "coral-vine-linen-dress": "08-mint-butterfly-a-line-dress",
  "dark-paisley-block-print-dress": "17-navy-ochre-small-floral-square-neck-dress",
  "the-crimson-tiles-linen-dress": "07-fuchsia-double-button-maxi-dress",
  "rani-linen-shirt": "01-mauve-embroidered-shirt",
  // batch 3 (client flags, Sep 1 2026): Folk Tale's own re-shoot folder is
  // flat-lay; Verdant Rose was an un-swapped mannequin-reading shot.
  // Both dressed with the last two hero-donated garments (hero thinned
  // 4 -> 2 slides).
  "the-folk-tale-linen-shirt": "10-ivory-floral-embroidered-v-neck-dress",
  "verdant-rose-gathered-dress": "05-brown-running-stitch-botanical-shirt",
};

// Sheet descriptions for swap products where the spreadsheet row
// describes the REAL product (so the description override is honest,
// unlike the usual swap tier which keeps Shopify's text). Folk Tale's
// row does; the lookbook garments' rows describe other designs.
export const SWAP_DESCRIPTIONS: Record<string, string> = {
  "the-folk-tale-linen-shirt":
    "The Folk Tale Linen Co-ord Set is crafted in soft blush pure linen, pairing an embroidered shirt with matching trousers. The shirt features a pointed collar, shell buttons, cuffed sleeves, and a relaxed fit through the body. Scattered across the front, the embroidery does not follow strict order. Small, bold motifs appear like fragments from a folk drawing: a stylised fish, a geometric bird, and flowers in deliberately mismatched colours. Red, blush, green, slate, and gold sit together with a handmade confidence.",
};

export function swapViews(handle: string): string[] | null {
  const slug = PRESENTATION_SWAPS[handle];
  if (!slug) return null;
  return LOOKBOOK_VIEW_FILES.map((f) => `/collection/${slug}/${f}`);
}
