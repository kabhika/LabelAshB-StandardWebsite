import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export default function ReturnsPage() {
  return (
    <LegalPage title={policies.refund.title} bodyHtml={policies.refund.bodyHtml} />
  );
}
