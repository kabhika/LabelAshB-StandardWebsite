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
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.15-1.35a10 10 0 0 0 4.89 1.25h.01c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm5.87 14.3c-.25.7-1.24 1.28-2.03 1.45-.54.11-1.25.2-3.63-.78-2.84-1.17-4.67-4.06-4.81-4.25-.14-.19-1.15-1.53-1.15-2.92s.72-2.07.98-2.35c.25-.28.54-.35.72-.35.18 0 .36 0 .52.01.17.01.39-.06.61.47.23.55.78 1.9.85 2.04.07.14.11.3.02.49-.09.19-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.92 1.05.94 1.94 1.24 2.22 1.38.28.14.44.12.6-.07.16-.19.68-.8.87-1.07.19-.28.37-.23.62-.14.25.09 1.6.76 1.87.9.27.14.45.21.52.32.07.12.07.68-.18 1.34Z" />
      </svg>
    </a>
  );
}
