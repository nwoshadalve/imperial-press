import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Dashboard</h1>
      <p className="text-[var(--color-muted)]">
        Welcome back. Your submissions and reviews will appear here.
      </p>
    </div>
  );
}
