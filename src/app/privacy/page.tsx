import type { Metadata } from "next";
import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Label AshB collects, uses, shares and protects your personal information, including cookies and your data rights.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={policies.privacy.title}
      bodyHtml={policies.privacy.bodyHtml}
      breadcrumbName="Privacy Policy"
      path="/privacy"
    />
  );
}
