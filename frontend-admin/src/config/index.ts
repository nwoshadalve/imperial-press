/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in the repo-root .env (see .env.example).`,
    )
  }
  return value
}

export const config = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
} as const
