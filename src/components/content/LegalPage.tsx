import { demoteH1 } from "@/lib/html";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function LegalPage({
  title,
  bodyHtml,
  breadcrumbName,
  path,
}: {
  title: string;
  bodyHtml: string;
  breadcrumbName: string;
  path: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: breadcrumbName, path },
        ])}
      />
      <h1 className="text-labelashb-h1 text-labelashb-ink">{title}</h1>
      <div
        className="prose prose-sm mt-8 text-labelashb-ink-soft [&_b]:mt-8 [&_b]:mb-2 [&_b]:block [&_b]:font-normal [&_b]:text-labelashb-eyebrow [&_b]:uppercase [&_b]:text-labelashb-ink [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: demoteH1(bodyHtml) }}
      />
    </main>
  );
}
