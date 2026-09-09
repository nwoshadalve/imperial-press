/**
 * Load merged repo-root environment (.env.compose + .env).
 * Later files win; process.env wins over all files.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILES = [
  ".env.compose.example",
  ".env.compose",
  ".env.example",
  ".env",
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq === -1) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  } else {
    const hash = value.indexOf(" #");
    if (hash !== -1) value = value.slice(0, hash).trim();
  }

  return [key, value];
}

function parseEnvFile(content) {
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (parsed) result[parsed[0]] = parsed[1];
  }
  return result;
}

/**
 * @param {string} repoRoot Absolute path to the monorepo root.
 * @returns {Record<string, string>}
 */
export function loadRepoEnv(repoRoot) {
  const merged = {};

  for (const name of ENV_FILES) {
    const path = resolve(repoRoot, name);
    if (!existsSync(path)) continue;
    Object.assign(merged, parseEnvFile(readFileSync(path, "utf8")));
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && value !== "") merged[key] = value;
  }

  return merged;
}
