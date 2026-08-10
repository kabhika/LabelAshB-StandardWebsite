import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import facts from "../../../_knowledge/facts.json";

export const metadata: Metadata = {
  title: "About",
  description:
    "Label AshB is a small boutique label built on thoughtful design, considered fabric sourcing and hand-finished craftsmanship.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalPage
      title={`About ${facts.brand.name}`}
      bodyHtml={facts.brand.aboutHtml}
      breadcrumbName="About"
      path="/about"
    />
  );
}
