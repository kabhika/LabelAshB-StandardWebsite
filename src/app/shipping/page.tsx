import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Label AshB's shipping policy: dispatch timelines, free domestic shipping, international delivery via DHL, and order tracking.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalPage
      title={policies.shipping.title}
      bodyHtml={policies.shipping.bodyHtml}
      breadcrumbName="Shipping Policy"
      path="/shipping"
    />
  );
}
