import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Label AshB's cancellation, return, exchange and refund policy, including timelines, eligibility and how to start a return.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title={policies.refund.title}
      bodyHtml={policies.refund.bodyHtml}
      breadcrumbName="Refund Policy"
      path="/returns"
    />
  );
}
