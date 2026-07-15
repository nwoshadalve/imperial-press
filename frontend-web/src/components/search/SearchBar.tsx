'use client';

import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    startTransition(() => {
      onSearch(val);
    });
  };

  return (
    <div className="relative mb-6">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        size={18}
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search papers, journals, authors…"
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </div>
  );
}
