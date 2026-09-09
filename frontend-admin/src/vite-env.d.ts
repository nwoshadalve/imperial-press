/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
