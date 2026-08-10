// Shopify's policy editor is inconsistent about heading markup — the
// shipping policy body opens with a literal <h1>, the other three don't.
// Any HTML injected below a page's own <h1> must never carry another one,
// so demote whatever the source sent before it hits dangerouslySetInnerHTML.
export function demoteH1(html: string): string {
  return html
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}
