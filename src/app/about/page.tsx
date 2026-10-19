import type { Metadata } from "next";
import facts from "../../../_knowledge/facts.json";

export const metadata: Metadata = {
  title: "About",
  description:
    "Label AshB is a small boutique label built on thoughtful design, considered fabric sourcing and hand-finished craftsmanship.",
  alternates: { canonical: "/about" },
};

// About, rebuilt (Oct 2026 Quiet Luxury pass). Three movements:
// 1. Binita's founder letter (facts.brand.founderLetter - her own words,
//    approved by her via the brand questionnaire) in the display serif.
// 2. The counters band - honest, client-confirmed numbers (Christy
//    Dawn-style proof) on the stone ground.
// 3. The original longer aboutHtml retained below as "The longer story"
//    so nothing that was there before is lost.
export default function AboutPage() {
  const letter = facts.brand.founderLetter;
  const counters = facts.brand.counters.items;

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-6 pt-14 pb-labelashb-section-standard sm:px-10 sm:pt-20 lg:px-16">
        <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent">
          Our story
        </p>
        {/* Single h1 on the page; the letter itself is body-scale so the
            founder's words, not a giant headline, carry the page. */}
        <h1 className="font-labelashb-serif mt-4 text-labelashb-h1 text-labelashb-ink">
          About Label AshB
        </h1>

        <div className="mt-labelashb-section-standard grid gap-10 md:grid-cols-[1.3fr_1fr] md:gap-16">
          <div>
            <p className="font-labelashb-serif text-labelashb-h3 text-labelashb-ink">
              {letter.salutation}
            </p>
            <div className="mt-5 space-y-5">
              {letter.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-labelashb-body-lg text-labelashb-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="font-labelashb-serif mt-8 text-labelashb-h3 italic text-labelashb-ink">
              — {letter.signature}
            </p>
          </div>

          {/* Quiet pull-quote column: the line the whole redesign hangs
              on, from Binita's own founding vision. */}
          <aside className="md:border-l md:border-labelashb-border md:pl-10">
            <blockquote className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink">
              &ldquo;The woman wearing the garment feels quietly
              confident.&rdquo;
            </blockquote>
            <p className="mt-4 text-labelashb-small text-labelashb-ink-soft">
              The founding intent, in Binita&rsquo;s words.
            </p>
          </aside>
        </div>
      </section>

      <section
        className="bg-labelashb-ground-alt px-6 py-labelashb-section-standard sm:px-10 lg:px-16"
        aria-label="The atelier in numbers"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {counters.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-labelashb-serif text-labelashb-h1 text-labelashb-ink">
                {value}
              </p>
              <p className="mt-2 text-labelashb-eyebrow uppercase tracking-[0.22em] text-labelashb-ink-soft">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-labelashb-section-standard sm:px-10">
        <h2 className="font-labelashb-serif text-labelashb-h2 text-labelashb-ink">
          The longer story
        </h2>
        <div
          className="prose prose-sm mt-6 max-w-none text-labelashb-ink-soft [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: facts.brand.aboutHtml }}
        />
      </section>
    </main>
  );
}
