# DESIGN.md

Token reference for the homepage rebuild. Source of truth is `src/app/globals.css`
(`@theme` block); this file explains what each token is for and when to reach for it.

## Status

Scoped to `src/app/globals.css` only. `src/app/page.tsx` still references the old
paper/terracotta/blush/azure/alabaster/celeste/coral/claret classes removed below —
that's expected, the homepage rebuild (Phase 4) is what remaps them to the new palette.
Until then the homepage renders without those background/border/text colors.

## Color: jewel-tone on warm ivory

```
--color-labelashb-ivory:   #f7f2e9   warm off-white ground
--color-labelashb-indigo:  #2d3557   primary accent
--color-labelashb-emerald: #1f4d3f   secondary accent
--color-labelashb-wine:    #5c1a2e   tertiary accent
```

Ink (near-black text) is **not** a new token. The sitewide `--color-labelashb-ink`
(`#17181c`, defined at the top of the `@theme` block) already sits within 5 units per
channel of the requested `#1c1a17` — redefining it would be visually indistinguishable
and would fork a single text color into two near-duplicate tokens. Use
`--color-labelashb-ink` for this system too.

Same reasoning for the Button accent: sitewide `--color-labelashb-accent` (`#34365e`)
sits within ~10 units per channel of `--color-labelashb-indigo` (`#2d3557`) —
indistinguishable at UI sizes. Button/nav/focus rings keep using
`--color-labelashb-accent`; `--color-labelashb-indigo` is for the homepage's jewel
palette (large color fields, editorial accents), not a second Button color.

Replaced entirely, not supplemented: `--color-labelashb-paper`, `-terracotta`,
`-blush`, `-azure`, `-alabaster`, `-celeste`, `-coral`, `-claret`. These are gone from
`globals.css`.

Unchanged sitewide tokens (still in `@theme`, not part of this redesign):
`--color-labelashb-ink`, `-ink-soft`, `-ground`, `-ground-alt`, `-border`, `-accent`,
`-accent-hover`, `-accent-foreground`, `-accent-soft`, `-error`, `-error-soft`.

## Structural tokens

### Section vertical rhythm

Three fluid tiers, all `--spacing-labelashb-section-*` (extends Tailwind's spacing
scale, so they work with `gap-*`, `py-*`, `mt-*`, etc.):

| Token | Range | Use |
|---|---|---|
| `section-compact` | `2rem` → `3rem` | Tight internal groups — a section's own header-to-content gap, stacked related items |
| `section-standard` | `3rem` → `5rem` | Gap between sub-groups within one section |
| `section-generous` | `4rem` → `8rem` | **Default.** Gap between major homepage sections (hero → editorial → gallery → footer CTA, etc.) |

Default to generous between anything a visitor would call "a new part of the page."
Drop to standard or compact only for rhythm inside one section, never between sections.

### Card anatomy (image-swap product galleries)

| Token | Value | Use |
|---|---|---|
| `--aspect-labelashb-card` | `4 / 5` | Product image aspect ratio — `aspect-labelashb-card` |
| `--spacing-labelashb-card-caption` | `1rem` | Gap between image and caption — `gap-labelashb-card-caption` |
| `--labelashb-duration-card-hover` | `400ms` | Image-swap hover transition. Plain `:root` custom property, **not** in `@theme` — Tailwind v4 has no `--duration-<name>` scale namespace (verified against `node_modules/tailwindcss/theme.css`), so a `@theme` entry here would silently generate zero utilities. A Tailwind arbitrary-value duration class referencing this var also fails at build time — Lightning CSS can't parse a var() reference inside that bracket syntax, and Tailwind's candidate scanner picks up the class-shaped text even when it only appears in a comment or doc, so avoid spelling that pattern out literally anywhere in the repo. Consume via an inline style's `transitionDuration` set to `var(--labelashb-duration-card-hover)` instead (see `ProductCardGallery.tsx`). |

### Carousel

| Token | Value | Use |
|---|---|---|
| `--spacing-labelashb-carousel-gap` | `1.25rem` | Gap between slides — `gap-labelashb-carousel-gap` |
| `--spacing-labelashb-carousel-control` | `2.75rem` | Arrow/dot control hit-target, 44px WCAG 2.5.5 touch target — `w-labelashb-carousel-control h-labelashb-carousel-control` |
| `--spacing-labelashb-carousel-dot` | `0.5rem` | Dot indicator diameter (visual size, not the tappable area — wrap in the control-size hit target above) — `w-labelashb-carousel-dot h-labelashb-carousel-dot` |

Snap behavior is not a token: use Tailwind's built-in `snap-x snap-mandatory` on the
track and `snap-start` (or `snap-center`) on each slide.

## Why namespace everything `labelashb-`

A bare `--spacing-*` or `--duration-*` key collides with Tailwind's built-in scale and
silently breaks utilities sitewide (documented at the top of `globals.css`). Every
custom token in this system is namespaced so it can never collide.
