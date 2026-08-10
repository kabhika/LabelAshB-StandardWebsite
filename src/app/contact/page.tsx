import type { Metadata } from "next";
import facts from "../../../_knowledge/facts.json";
import { demoteH1 } from "@/lib/html";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Label AshB by email or WhatsApp for order queries, custom sizing, made-to-order support, or general questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = facts;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <h1 className="text-labelashb-h1 text-labelashb-ink">Contact</h1>
      <div
        className="prose prose-sm mt-6 max-w-none text-labelashb-ink-soft [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: demoteH1(contact.contactPageHtml) }}
      />

      <dl className="mt-8 space-y-4 text-labelashb-body">
        <div>
          <dt className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Email</dt>
          <dd className="text-labelashb-ink">
            <a href={`mailto:${contact.email}`} className="underline">
              {contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Phone / WhatsApp</dt>
          <dd className="text-labelashb-ink">{contact.phone}</dd>
        </div>
        <div>
          <dt className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Address</dt>
          <dd className="text-labelashb-ink">{contact.address}</dd>
        </div>
        <div>
          <dt className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">Hours</dt>
          <dd className="text-labelashb-ink">{contact.hours}</dd>
        </div>
      </dl>
    </main>
  );
}
