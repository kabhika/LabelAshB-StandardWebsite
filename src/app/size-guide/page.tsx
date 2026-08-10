import facts from "../../../_knowledge/facts.json";
import { demoteH1 } from "@/lib/html";

export default function SizeGuidePage() {
  const { sizeGuide } = facts;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-labelashb-h1 text-labelashb-ink">Size Guide</h1>
      <div
        className="prose prose-sm mt-8 max-w-none text-labelashb-ink-soft [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: demoteH1(sizeGuide.bodyHtml) }}
      />
      <a
        href={sizeGuide.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-labelashb-body text-labelashb-accent underline"
      >
        Download the full size guide (PDF)
      </a>
    </main>
  );
}
