---
name: run
description: Launch the Imperial Press dev server and open a browser preview. Use when asked to run, start, preview, or screenshot the app.
---

This is a monorepo. The only configured dev server right now is **frontend-admin**.

## Steps

1. Call `preview_start` with `{ "name": "frontend-admin" }` — this uses `.claude/launch.json` which runs `npm run dev` inside `frontend-admin/` on port 50174 (auto-port if busy).
2. Navigate to `/dashboard` in the opened tab. The app redirects unauthenticated users to `/login` automatically.
3. To log in during testing use:
   - **Email**: `admin@imperialpress.com`
   - **Password**: any non-empty string

## Notes

- HMR is active — after editing source files, reload the tab rather than restarting the server.
- If the server is already running, `preview_start` reuses it and returns the existing `tabId`.
- For backend or frontend-web, start those servers manually with `npm run dev` / `uvicorn` from their respective directories.
