// Placeholder homepage. The real home page (hero, featured products, brand
// story from the live catalog) is Phase 3 scope — this just clears the
// create-next-app default template so the Phase 2 gate isn't checking
// scaffold boilerplate for stray hardcoded colors.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <h1 className="text-labelashb-h1 text-labelashb-ink">Label AshB</h1>
      <p className="mt-4 max-w-md text-labelashb-body text-labelashb-ink-soft">
        Home page content lands in Phase 3. See the design system at{" "}
        <a href="/style-tile" className="underline text-labelashb-accent">
          /style-tile
        </a>
        .
      </p>
    </main>
  );
}
