import { demoteH1 } from "@/lib/html";

export function LegalPage({
  title,
  bodyHtml,
}: {
  title: string;
  bodyHtml: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-labelashb-h1 text-labelashb-ink">{title}</h1>
      <div
        className="prose prose-sm mt-8 max-w-none text-labelashb-ink-soft [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-labelashb-h3 [&_h2]:text-labelashb-ink [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-medium [&_h3]:text-labelashb-ink [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: demoteH1(bodyHtml) }}
      />
    </main>
  );
}
