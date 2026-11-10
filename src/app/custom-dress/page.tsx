import type { Metadata } from "next";
import Image from "next/image";
import facts from "../../../_knowledge/facts.json";
import { JsonLd } from "@/components/shared/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create Your Custom Dress",
  description:
    "Discuss your occasion, fit and design ideas directly with Binita, founder of Label AshB, and explore a custom dress made around you.",
  alternates: { canonical: "/custom-dress" },
};

const callHref = `tel:${facts.contact.phone.replace(/[^+\d]/g, "")}`;

export default function CustomDressPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Custom dress", path: "/custom-dress" },
        ])}
      />

      <section className="bg-labelashb-ground-alt">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-10 sm:px-10 sm:py-16 lg:grid-cols-[1fr_0.86fr] lg:gap-20 lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-ink-soft">
              A personal conversation with the atelier
            </p>
            <h1 className="mt-5 font-labelashb-serif text-5xl leading-[0.98] text-labelashb-ink sm:text-6xl lg:text-7xl">
              A dress that begins with you.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-labelashb-ink-soft">
              Have an occasion, a colour or a feeling in mind? Speak directly
              with Binita, the founder of Label AshB, about a dress made around
              your preferences.
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={callHref}
                className="inline-flex min-h-14 items-center justify-center bg-labelashb-ink px-8 text-sm font-medium tracking-[0.12em] text-labelashb-ivory uppercase transition-colors hover:bg-labelashb-espresso-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-labelashb-accent"
              >
                Call Binita about your dress
              </a>
              <span className="text-sm text-labelashb-ink-soft">
                {facts.contact.hours}
              </span>
            </div>
            <p className="mt-5 text-sm text-labelashb-ink-soft">
              Call <a href={callHref} className="underline underline-offset-4">{facts.contact.phone}</a> from anywhere in India.
            </p>
          </div>

          <figure className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[640/1249] overflow-hidden bg-labelashb-ground">
              <Image
                src="/campaign/custom-dress-look.png"
                alt="A full-length ivory dress shown as inspiration for a personal Label AshB look"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs leading-relaxed text-labelashb-ink-soft">
              An example of the Label AshB aesthetic. Your design is discussed individually.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
        <div className="max-w-2xl">
          <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-accent">
            The conversation
          </p>
          <h2 className="mt-4 font-labelashb-serif text-4xl leading-tight text-labelashb-ink sm:text-5xl">
            Tell us what you imagine.
          </h2>
          <p className="mt-4 text-labelashb-body-lg text-labelashb-ink-soft">
            You do not need a finished design before you call. Start with an idea,
            a reference, or simply how you want to feel in the dress.
          </p>
        </div>
        <ol className="mt-10 grid gap-8 border-t border-labelashb-border pt-8 md:grid-cols-3 md:gap-12">
          <li>
            <span className="font-labelashb-serif text-3xl text-labelashb-accent">01</span>
            <h3 className="mt-3 font-labelashb-serif text-2xl text-labelashb-ink">Share your idea</h3>
            <p className="mt-3 leading-relaxed text-labelashb-ink-soft">
              Tell Binita about the occasion, silhouette, colours and details you love.
            </p>
          </li>
          <li>
            <span className="font-labelashb-serif text-3xl text-labelashb-accent">02</span>
            <h3 className="mt-3 font-labelashb-serif text-2xl text-labelashb-ink">Explore what is possible</h3>
            <p className="mt-3 leading-relaxed text-labelashb-ink-soft">
              Discuss fit and customisation options, where the design permits.
            </p>
          </li>
          <li>
            <span className="font-labelashb-serif text-3xl text-labelashb-accent">03</span>
            <h3 className="mt-3 font-labelashb-serif text-2xl text-labelashb-ink">Decide with clarity</h3>
            <p className="mt-3 leading-relaxed text-labelashb-ink-soft">
              Confirm the design, price and making timeline with the atelier before you order.
            </p>
          </li>
        </ol>
      </section>

      <section className="bg-labelashb-espresso px-6 py-16 text-center text-labelashb-ivory sm:px-10 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-labelashb-eyebrow uppercase tracking-[0.28em] text-labelashb-gold">
            Label AshB · Gurugram atelier
          </p>
          <h2 className="mt-4 font-labelashb-serif text-4xl leading-tight sm:text-5xl">
            Let us make the look yours.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-labelashb-ivory/80">
            Your first step is a conversation with Binita about the dress you have in mind.
          </p>
          <a
            href={callHref}
            className="mt-8 inline-flex min-h-14 items-center justify-center bg-labelashb-ivory px-8 text-sm font-medium tracking-[0.12em] text-labelashb-ink uppercase transition-colors hover:bg-labelashb-ground-alt focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-labelashb-gold"
          >
            Call {facts.contact.phone}
          </a>
          <p className="mt-5 text-sm text-labelashb-ivory/70">{facts.contact.hours}</p>
        </div>
      </section>
    </main>
  );
}
