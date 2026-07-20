/**
 * Run Next.js after loading the monorepo-root .env (WEB_PORT, NEXT_PUBLIC_*, …).
 *
 * Usage (from frontend-web/):
 *   node ./scripts/next-with-root-env.mjs dev
 *   node ./scripts/next-with-root-env.mjs build
 *   node ./scripts/next-with-root-env.mjs start
 */
import nextEnv from "@next/env";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(__dirname, "..");
const repoRoot = resolve(appDir, "..");

loadEnvConfig(repoRoot, process.env.NODE_ENV !== "production", console, true);

const command = process.argv[2];
if (!command) {
  console.error(
    "Usage: node ./scripts/next-with-root-env.mjs <dev|build|start> [...args]",
  );
  process.exit(1);
}

const extra = process.argv.slice(3);
const args = [command, ...extra];

const needsPort = command === "dev" || command === "start";
const hasPortFlag = extra.includes("-p") || extra.includes("--port");
if (needsPort && !hasPortFlag) {
  const port = process.env.WEB_PORT;
  if (!port) {
    console.error(
      "Missing required environment variable: WEB_PORT. Set it in the repo-root .env (see .env.example).",
    );
    process.exit(1);
  }
  args.push("--port", port);
}

const nextBin = resolve(appDir, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: appDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
