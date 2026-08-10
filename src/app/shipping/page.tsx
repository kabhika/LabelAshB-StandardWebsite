import { LegalPage } from "@/components/content/LegalPage";
import policies from "../../../_knowledge/facts-policies.json";

export default function ShippingPage() {
  return (
    <LegalPage
      title={policies.shipping.title}
      bodyHtml={policies.shipping.bodyHtml}
    />
  );
}
