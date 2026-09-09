/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

// Static import.meta.env.VITE_* access is required — Vite replaces these at build
// time from vite.config.ts define. Dynamic import.meta.env[key] is not replaced.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
if (!apiBaseUrl) {
  throw new Error(
    'Missing required environment variable: VITE_API_BASE_URL. Set it in the repo-root .env (see .env.example).',
  )
}

export const config = {
  apiBaseUrl,
} as const
