/**
 * Renders a JSON-LD structured-data block. React drops it into the document
 * where placed; search engines and AI crawlers read it regardless of position.
 * The pre-render step bakes it into each route's static HTML.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Build a schema.org FAQPage from a list of Q&A pairs. */
export function faqPageSchema(faq: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
