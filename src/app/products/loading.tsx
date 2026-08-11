// Matches the real /products layout (title, filter sidebar, card grid) so
// the skeleton doesn't jump when live data arrives. Relevant on slower
// India mobile networks per PRD.md §4 - this route fetches the full
// Storefront catalog live, not statically.
export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="h-11 w-48 animate-pulse bg-labelashb-ground-alt" />
      <div className="mt-2 h-5 w-24 animate-pulse bg-labelashb-ground-alt" />

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="h-3 w-16 animate-pulse bg-labelashb-ground-alt" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 w-20 animate-pulse bg-labelashb-ground-alt" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-16 animate-pulse bg-labelashb-ground-alt" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-24 animate-pulse bg-labelashb-ground-alt" />
              ))}
            </div>
          </div>
        </aside>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] animate-pulse bg-labelashb-ground-alt" />
              <div className="mt-4 h-3 w-16 animate-pulse bg-labelashb-ground-alt" />
              <div className="mt-2 h-5 w-40 animate-pulse bg-labelashb-ground-alt" />
              <div className="mt-2 h-4 w-20 animate-pulse bg-labelashb-ground-alt" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
