// PRD.md Section 1 lists the domain decision as unconfirmed (keep
// labelashb.in vs. move DNS to Vercel). Using the real target domain here
// since that's the intended production URL either way; swap via env var
// if that decision changes before launch.
const configuredSite = process.env.NEXT_PUBLIC_SITE_URL || "https://www.labelashb.in";
const site = new URL(configuredSite);
if (site.hostname === "labelashb.in") site.hostname = "www.labelashb.in";
export const SITE_URL = site.origin;
