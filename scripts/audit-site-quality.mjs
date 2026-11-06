// Site-wide quality audit against the live store:
//   - every sitemap URL (+ extra routes): status, redirects, title/meta/h1
//   - placeholder/error markers in visible text ("TODO", "undefined", ...)
//   - every internal link and image referenced by those pages -> resolved?
//   - robots.txt
// Output: audit-quality-out/*.json + per-page .txt text dumps for copy review.
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "https://www.labelashb.in";
const OUT = "audit-quality-out";
mkdirSync(OUT, { recursive: true });

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LabelAshB-Audit/1.0";

const xml = await (await fetch(`${BASE}/sitemap.xml`, { headers: { "user-agent": UA } })).text();
const sitemapUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

// Routes that exist but may not be in the sitemap, plus a deliberate 404 probe.
const extraPaths = [
  "/checkout", "/checkout/success", "/admin/orders", "/style-tile",
  "/size-guide", "/returns", "/shipping", "/privacy", "/about", "/contact",
  "/products", "/nonexistent-page-audit-probe",
];
const seen = new Set([`${BASE}/`]);
const urls = [`${BASE}/`, ...sitemapUrls, ...extraPaths.map((p) => BASE + p)].filter(
  (u) => (seen.has(u) ? false : (seen.add(u), true)),
);

const PLACEHOLDER_MARKERS = [
  "lorem ipsum", "TODO", "FIXME", "undefined", "[object", "NaN",
  "{{", "}}", "placeholder text", "coming soon", "…TBD",
];

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, "…").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d));
}

function extract(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const text = decodeEntities(clean.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  // decode &amp; etc. in URLs before fetching, and for _next/image sources
  // check the inner url= param (fewer unique URLs, tests the real asset)
  const links = [...html.matchAll(/href="([^"#]+)"/g)]
    .map((m) => decodeEntities(m[1]))
    .filter((h) => !h.startsWith("mailto:") && !h.startsWith("tel:") && !h.startsWith("javascript:"));
  const imgs = [...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)]
    .map((m) => decodeEntities(m[1]))
    .flatMap((s) => (s.includes(" ") ? s.split(" ").filter((_, i) => i % 2 === 0) : [s]))
    .filter((u) => /\.(jpe?g|png|webp|avif|svg|ico)/i.test(u) || u.includes("/_next/image"));
  return { text, links, imgs };
}

const pages = [];
const internalLinks = new Map(); // url -> first page seen on
const imageUrls = new Map();

for (const url of urls) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
    const html = await res.text();
    const { text, links, imgs } = extract(html);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? null;
    const metaDesc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? null;
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
    const markers = PLACEHOLDER_MARKERS.filter((m) => text.toLowerCase().includes(m.toLowerCase()));

    // Windows-safe slug from the pathname (a raw URL keeps ':' and NTFS
    // silently redirects the write into an alternate data stream)
    const slug = new URL(url).pathname.replace(/^\//, "").replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "home";
    writeFileSync(`${OUT}/${String(pages.length).padStart(2, "0")}-${slug}.txt`, text);

    for (const l of links) {
      const abs = l.startsWith("http") ? l : l.startsWith("/") ? BASE + l : new URL(l, url).href;
      if (abs.startsWith(BASE)) internalLinks.set(abs.split("#")[0], url);
    }
    for (const i of imgs) {
      const abs = i.startsWith("http") ? i : i.startsWith("/") ? BASE + i : new URL(i, url).href;
      imageUrls.set(abs.split(" ")[0], url);
    }

    pages.push({
      url, status: res.status, finalUrl: res.url, title, metaDesc, h1,
      words: text.split(" ").length, markers,
      titleHtmlEscapeIssue: /\b(Label AshB|Dress|Top)\b&amp;/.test(title ?? ""),
    });
    console.log(`${res.status} ${url}`);
  } catch (e) {
    pages.push({ url, error: e.message });
    console.log(`ERR ${url} ${e.message}`);
  }
}

// robots.txt
try {
  const r = await fetch(`${BASE}/robots.txt`, { headers: { "user-agent": UA } });
  const robots = await r.text();
  writeFileSync(`${OUT}/robots.txt`, robots);
  pages.push({ url: `${BASE}/robots.txt`, status: r.status, sitemapLine: robots.includes("sitemap") });
} catch (e) { pages.push({ url: "robots", error: e.message }); }

// Resolve every internal link found anywhere
console.log(`\nchecking ${internalLinks.size} unique internal links...`);
const badLinks = [];
for (const [link, from] of internalLinks) {
  try {
    const r = await fetch(link, { headers: { "user-agent": UA }, redirect: "follow" });
    if (r.status >= 400) badLinks.push({ link, from, status: r.status });
  } catch (e) { badLinks.push({ link, from, error: e.message.slice(0, 60) }); }
}

// Resolve every image URL (excluding the deliberate probe page noise)
console.log(`checking ${imageUrls.size} unique images...`);
const badImages = [];
for (const [img, from] of imageUrls) {
  try {
    const r = await fetch(img, { method: "HEAD", headers: { "user-agent": UA } });
    if (r.status >= 400) {
      const r2 = await fetch(img, { headers: { "user-agent": UA } }); // HEAD may be rejected
      if (r2.status >= 400) badImages.push({ img: img.slice(0, 160), from, status: r2.status });
    }
  } catch (e) { badImages.push({ img: img.slice(0, 160), from, error: e.message.slice(0, 60) }); }
}

writeFileSync(`${OUT}/summary.json`, JSON.stringify({
  crawled: pages.length,
  pages,
  badLinks,
  badImages,
  uniqueInternalLinks: internalLinks.size,
  uniqueImages: imageUrls.size,
}, null, 2));

console.log(`\n=== DONE: ${pages.length} pages, ${badLinks.length} broken links, ${badImages.length} broken images`);
for (const b of badLinks) console.log(`LINK ${b.status} ${b.link} (from ${b.from})`);
for (const b of badImages) console.log(`IMG  ${b.status} ${b.img.slice(0, 110)} (from ${b.from})`);
