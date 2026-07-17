export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
