export default function PublicLoading() {
  return (
    <div
      className="mx-auto min-h-[50vh] max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <div className="h-8 w-48 rounded bg-muted/80" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-muted/60" />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
