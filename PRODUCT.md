# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: women who want clothing that feels personal, graceful, and carefully made — multifaceted professionals and others who value refined comfort and individuality. Shopping occasions span desk-to-dinner versatility, party wear, relaxed casual styles, and everyday essentials. Inferred from About page and FAQ copy in `_knowledge/facts.json`; not separately confirmed with the user this session.

## Product Purpose

Label AshB is a small independent Indian atelier selling handcrafted linen, silk, and cotton dresses, tops, and co-ord sets, ready-to-ship or made to order. Success is a shopper finding a considered, well-made piece and completing a purchase (direct checkout or WhatsApp/email order).

## Positioning

Not a batch-processed apparel brand. Every piece starts on paper, is prototyped, refined for fit, and finished with hand attention to detail and fabric selection (handloom linen, pure silk crepe, Indian mulberry silk). A neighboring fast-fashion or mass e-commerce competitor could not truthfully claim the same made-to-order, small-atelier process.

## Operating Context

- Storefront runs on Shopify (Storefront API for live commerce data: price, stock, variants, images) plus a Next.js frontend (this repo).
- Sizing spans XS to 6XL; most garments are relaxed/anti-fit silhouettes.
- Ready-to-ship items dispatch within 2 working days, deliver in 3-5 business days domestically; made-to-order/customized pieces take 2-3 weeks.
- Returns are limited: made-to-order model, exchanges only for genuine fit issues (customer pays return shipping).
- Care: dry clean only for most pieces (natural fibers, hand-block prints).
- Direct contact channels (email, WhatsApp, phone) are a first-class ordering path alongside on-site checkout.
- Fabric is sourced white, then hand-dyed with plant dyes to the requested color before being made into garments. Workshop runs on solar energy and employs people from underprivileged backgrounds. Confirmed directly by Abhishek (Coralstone Services, managing this site for his sister Binita, the business owner) 2026-08-22, not yet on a Shopify Admin page - see `_knowledge/facts.json` craftPractices.

## Capabilities and Constraints

- All commerce data (price, stock, title, description, images, variants) is fetched live from the Shopify Storefront API at request time — never hardcoded or duplicated into static content.
- Non-commerce brand/policy copy lives in `_knowledge/facts.json`, sourced from Shopify Admin pages; treat as the copy source of truth, do not invent new claims.
- No free-text search on-site, only category/material filters — do not imply search exists in copy or schema.
- International shipping via DHL Express with customer-borne import duties.

## Brand Commitments

- Name: Label AshB (site title metadata uses bare "Label AshB", not a "%s | Label AshB" template on the homepage).
- Voice: quiet, understated, craft-forward — "made with time, care, and a clear eye for detail." Avoid hype/sale-driven e-commerce language.
- Existing accent color (#34365e, indigo) was sampled from a real product photo ("The Indigo Swallow" linen shirt), not invented — evidence for future palette decisions, though this redesign is authorized to replace the visual world per the user's new direction.

## Evidence on Hand

- Full About copy, FAQ copy, size guide, care instructions, and contact details: `_knowledge/facts.json`.
- Live product catalog and images: Shopify Storefront API via `src/lib/shopify/catalog.ts`.
- No testimonials, press, or case studies on hand — do not fabricate any.

## Product Principles

1. Commerce data is always live from Shopify; presentation layer never hardcodes or duplicates it.
2. Voice stays quiet and craft-forward, never hype-driven or discount-led.
3. Small-atelier, made-to-order process is the core differentiator and should read through in both copy and pacing of the experience, not just claimed in text.
4. Sizing and process constraints (XS-6XL, 2-3 week made-to-order lead time, dry-clean-only, limited returns) are real operational facts that any redesign must not obscure or contradict.
