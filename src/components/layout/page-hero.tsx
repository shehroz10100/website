type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function PageHero({ title, description, eyebrow }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 medical-surface opacity-80" />
      <div className="hero-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-steel sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
        <div className="mt-6 h-1 w-20 rounded-full bg-primary" />
      </div>
    </section>
  );
}
