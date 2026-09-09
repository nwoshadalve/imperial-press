/**
 * Derive service URLs and CORS origins from repo-root env + .env.compose ports.
 * Explicit NEXT_PUBLIC_* / VITE_* / ALLOWED_ORIGINS values always win (production overrides).
 */

/**
 * @param {Record<string, string>} env
 * @param {...string} keys
 * @returns {string | undefined}
 */
export function pick(env, ...keys) {
  for (const key of keys) {
    const value = env[key];
    if (value !== undefined && value !== "") return value;
  }
  return undefined;
}

function requirePick(env, label, ...keys) {
  const value = pick(env, ...keys);
  if (!value) {
    throw new Error(
      `Missing required environment variable for ${label} (${keys.join(" or ")}). ` +
        "Set it in the repo-root .env / .env.compose (see .env.example).",
    );
  }
  return value;
}

function isLocalDev(env) {
  const domain = pick(env, "DOMAIN");
  const infraHost = pick(env, "INFRA_HOST") ?? "localhost";
  return !domain || domain === "localhost" || infraHost === "localhost";
}

/**
 * @param {Record<string, string>} env
 * @param {string} host
 * @param {string} port
 * @param {boolean} [secure]
 */
function originUrl(env, host, port, secure = false) {
  const scheme = secure ? "https" : "http";
  const normalizedHost = host.replace(/\/+$/, "");
  const normalizedPort = String(port).trim();
  const defaultPort = secure ? "443" : "80";
  if (normalizedPort === defaultPort) {
    return `${scheme}://${normalizedHost}`;
  }
  return `${scheme}://${normalizedHost}:${normalizedPort}`;
}

/**
 * API base URL for browser clients (Next.js + admin).
 * @param {Record<string, string>} env
 */
export function resolveApiBaseUrl(env) {
  const explicit = pick(
    env,
    "NEXT_PUBLIC_API_BASE_URL",
    "VITE_API_BASE_URL",
  );
  if (explicit) return explicit;

  if (isLocalDev(env)) {
    const host = pick(env, "INFRA_HOST") ?? "localhost";
    const port = requirePick(env, "API base URL", "API_PORT");
    return originUrl(env, host, port);
  }

  const domain = requirePick(env, "API base URL", "DOMAIN");
  const port = requirePick(env, "API base URL", "HOST_API_PORT");
  return originUrl(env, domain, port);
}

/**
 * MeiliSearch host for browser-side search (Next.js public site).
 * @param {Record<string, string>} env
 */
export function resolveMeilisearchHost(env) {
  const explicit = pick(env, "NEXT_PUBLIC_MEILISEARCH_HOST");
  if (explicit) return explicit;

  const host = isLocalDev(env)
    ? (pick(env, "INFRA_HOST") ?? "localhost")
    : requirePick(env, "MeiliSearch host", "DOMAIN");
  const port = requirePick(env, "MeiliSearch host", "HOST_MEILI_PORT");
  return originUrl(env, host, port, !isLocalDev(env));
}

/**
 * Optional public site URL for OG/canonical tags.
 * @param {Record<string, string>} env
 */
export function resolveSiteUrl(env) {
  const explicit = pick(env, "NEXT_PUBLIC_SITE_URL");
  if (explicit) return explicit;

  if (isLocalDev(env)) {
    const host = pick(env, "INFRA_HOST") ?? "localhost";
    const port = pick(env, "WEB_PORT");
    if (!host || !port) return "";
    return originUrl(env, host, port);
  }

  const domain = pick(env, "DOMAIN");
  if (!domain || domain === "localhost") return "";
  return originUrl(env, domain, "443", true);
}
