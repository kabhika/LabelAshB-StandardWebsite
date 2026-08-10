import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export default function PrivacyPage() {
  return (
    <LegalPage
      title={policies.privacy.title}
      bodyHtml={policies.privacy.bodyHtml}
    />
  );
}
