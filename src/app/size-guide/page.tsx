import type { Metadata } from "next";
import facts from "../../../_knowledge/facts.json";
import { demoteH1 } from "@/lib/html";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Find your Label AshB size with our inch-based size guide, covering S to 3XL with notes on made-to-order sizing above that range.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  const { sizeGuide } = facts;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Size Guide", path: "/size-guide" },
        ])}
      />
      <h1 className="text-labelashb-h1 text-labelashb-ink">Size Guide</h1>
      <div
        className="prose prose-sm mt-8 max-w-none text-labelashb-ink-soft [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: demoteH1(sizeGuide.bodyHtml) }}
      />
      <a
        href={sizeGuide.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-labelashb-body text-labelashb-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
      >
        Download the full size guide (PDF)
      </a>
    </main>
  );
}
