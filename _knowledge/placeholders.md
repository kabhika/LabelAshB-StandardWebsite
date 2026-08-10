# Placeholders

None. Every non-commerce fact required for Phase 1-2 was available live
(Shopify Admin `pages` + Storefront `shop.*Policy` fields) and is in
`facts.json` / `facts-policies.json` verbatim — no `[[token]]` placeholders
were needed.

## Known data-staleness vs. PRD.md / PLAN.md

Both docs were written before this session and quote a 47-product / 46-active
catalog. The live count as of Phase 1 (2026-08-10) is **50 total / 49 active /
1 draft / 0 archived** (confirmed via Admin `productsCount` and cross-checked
against the Storefront API pull, which returned exactly 49). The draft
product is still "Midnight Marigold Co-ord Set", unchanged. Treat the "46"
figure in PRD.md §Success Criteria and BUILD_PROMPT.md's Phase 1 gate as
stale; 49 is current ground truth.

## Section 1 decisions (PRD.md) — still open

Not placeholders, but real unconfirmed business decisions blocking a real
launch:
- Migration architecture (headless) — recommended, not yet confirmed by Binita
- Domain DNS cutover to Vercel — not yet confirmed
- Draft product handling — currently excluded (matches recommendation)
- Image hosting on `cdn.shopify.com` — recommended, not yet confirmed
