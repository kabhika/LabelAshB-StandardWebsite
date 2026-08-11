import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-labelashb-h2 text-labelashb-ink">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
        The link may be out of date, or the piece may no longer be listed.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/products" variant="primary">
          Shop all products
        </Button>
        <Link href="/" className="text-labelashb-small text-labelashb-accent underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
