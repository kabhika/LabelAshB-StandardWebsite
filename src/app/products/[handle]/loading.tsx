export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse bg-labelashb-ground-alt" />
        <div>
          <div className="h-3 w-20 animate-pulse bg-labelashb-ground-alt" />
          <div className="mt-3 h-11 w-3/4 animate-pulse bg-labelashb-ground-alt" />
          <div className="mt-4 h-6 w-24 animate-pulse bg-labelashb-ground-alt" />
          <div className="mt-8 space-y-2">
            <div className="h-3 w-16 animate-pulse bg-labelashb-ground-alt" />
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-12 animate-pulse bg-labelashb-ground-alt" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
