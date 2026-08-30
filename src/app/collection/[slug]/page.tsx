import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  collectionGarments,
  getGarment,
} from "@/data/new-collection";
import { Gallery } from "@/components/catalog/Gallery";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import facts from "../../../../_knowledge/facts.json";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return collectionGarments.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const garment = getGarment(slug);
  if (!garment) return {};
  return {
    title: garment.name,
    description: garment.description,
    alternates: { canonical: `/collection/${garment.slug}` },
  };
}

// wa.me needs digits only - facts.contact.whatsapp is display-formatted
// ("+91 98107 25683"), same normalization as WhatsAppFloat.
function toWhatsAppHref(displayNumber: string, message: string): string {
  const digits = displayNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default async function GarmentPage({ params }: PageProps) {
  const { slug } = await params;
  const garment = getGarment(slug);
  if (!garment) notFound();

  const images = [
    { url: garment.views.front, altText: `${garment.name}, front view` },
    { url: garment.views.threeQuarter, altText: `${garment.name}, three-quarter view` },
    { url: garment.views.side, altText: `${garment.name}, side view` },
    { url: garment.views.back, altText: `${garment.name}, back view` },
    { url: garment.views.detail, altText: `${garment.name}, close-up detail` },
  ].map((image) => ({ ...image, width: 1024, height: 1536 }));

  const enquiryHref = toWhatsAppHref(
    facts.contact.whatsapp,
    `Hi! I'd like to know more about ${garment.name} from the new collection.`,
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "The New Collection", path: "/collection" },
          { name: garment.name, path: `/collection/${garment.slug}` },
        ])}
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <Gallery images={images} productTitle={garment.name} />

        <div className="flex flex-col justify-center">
          <p className="text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            The New Collection
          </p>
          <h1 className="mt-2 text-labelashb-h1 text-labelashb-ink">{garment.name}</h1>
          <p className="mt-2 text-labelashb-eyebrow uppercase text-labelashb-ink-soft">
            {garment.category}
          </p>
          <p className="mt-6 text-labelashb-body-lg text-labelashb-ink-soft">
            {garment.description}
          </p>

          <div className="mt-8 border-t border-labelashb-border pt-6">
            <p className="text-labelashb-body text-labelashb-ink-soft">
              This piece is part of our new collection. Pricing, fabric
              details and sizing on request.
            </p>
            <a
              href={enquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center border border-labelashb-ink bg-labelashb-ink px-5 text-labelashb-eyebrow uppercase text-labelashb-ivory transition-colors hover:bg-labelashb-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
            >
              Enquire on WhatsApp
            </a>
          </div>

          <Link
            href="/collection"
            className="mt-8 inline-block text-labelashb-small text-labelashb-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1"
          >
            Back to the collection
          </Link>
        </div>
      </div>
    </main>
  );
}
