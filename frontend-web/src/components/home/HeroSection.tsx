import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
          Advancing Knowledge
          <br />
          Through Open Science
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-[var(--color-muted)]">
          Imperial Press publishes peer-reviewed research across science, technology, and the
          humanities. Submit your work to our rigorous, fast-turnaround journals.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/submissions"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-medium text-white hover:opacity-90 transition-opacity"
          >
            Submit a Paper
          </Link>
          <Link
            href="/journals"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-6 py-3 text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
          >
            Browse Journals
          </Link>
        </div>
      </div>
    </section>
  );
}
