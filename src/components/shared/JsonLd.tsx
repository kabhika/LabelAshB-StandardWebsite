export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON-LD, not user input - safe to inject directly.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
