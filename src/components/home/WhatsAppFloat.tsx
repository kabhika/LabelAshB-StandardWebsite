import { MessageCircle } from "lucide-react";

// wa.me needs digits only (no +, spaces, or punctuation) - facts.contact.whatsapp
// is formatted for human display ("+91 98107 25683"), so it's stripped here
// rather than duplicating a second raw-digit copy of the same number in
// facts.json.
function toWhatsAppHref(displayNumber: string, message: string): string {
  const digits = displayNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppFloat({ phone }: { phone: string }) {
  const href = toWhatsAppHref(phone, "Hi! I have a question about a Label AshB piece.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Label AshB on WhatsApp"
      // Inline style, not bottom-5/right-5: on a notched phone in landscape
      // (or one with a rounded-corner home indicator), a bare 1.25rem offset
      // can sit partly under the unsafe area. max() keeps the normal 1.25rem
      // everywhere env() resolves to 0 (most devices, and this value is only
      // non-zero at all once layout.tsx's viewportFit: "cover" is set) and
      // grows only on the devices that actually need it.
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
      }}
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-labelashb-emerald text-labelashb-ivory shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-emerald focus-visible:ring-offset-2"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
