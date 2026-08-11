"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Storefront API failures (rate limits, timeouts, network blips - a real
// risk PRD.md §8 flags on the Basic plan) would otherwise hit Next's bare
// default error screen. This is the on-brand recovery path instead.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-labelashb-h2 text-labelashb-ink">
        Something went wrong loading this page.
      </h1>
      <p className="mt-4 text-labelashb-body text-labelashb-ink-soft">
        This is usually temporary - a connection issue reaching our catalog.
        Try again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link href="/" className="text-labelashb-small text-labelashb-accent underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
