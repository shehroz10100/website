export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-10 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-80 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-12 w-full animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading products…</span>
    </div>
  );
}
