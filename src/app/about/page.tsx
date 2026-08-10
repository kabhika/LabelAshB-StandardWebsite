import { LegalPage } from "@/components/content/LegalPage";
import facts from "../../../_knowledge/facts.json";

export default function AboutPage() {
  return (
    <LegalPage title={`About ${facts.brand.name}`} bodyHtml={facts.brand.aboutHtml} />
  );
}
