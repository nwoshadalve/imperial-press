/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { SWRConfig } from 'swr';

/**
 * Global client-side providers. Currently wires SWR defaults for all Client
 * Component data fetching (per state-and-data principles). Server Components
 * fetch directly and are unaffected by this boundary.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        dedupingInterval: 5000,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
