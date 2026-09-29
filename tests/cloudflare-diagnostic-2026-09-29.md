# Cloudflare ERR_FAILED investigation

Date: 2026-09-29 (Asia/Seoul).

## Release status: HOLD

The user requires existing public-link and home-screen users to keep working without manual recovery. Do not upload the current ZIP to production yet. This hold supersedes the deployment instructions below. No production deployment has been performed.

- The 36 focused tests were rerun successfully, but they are not a release approval.
- The legacy-worker browser test used `/repair`. It did not establish that a user opening the ordinary link or an installed home-screen app automatically recovers without seeing an error first.
- A failed worker installation preserves the previous cache. However, network-first navigation can still serve newer HTML before its dependencies have been prepared, so that test alone does not prove every failed release leaves the previous app usable.
- A separate preview URL protects production during testing, but has separate browser storage and service-worker registration. A clean preview install does not test migration of production-origin users. Test a predecessor-to-candidate update on the same isolated test origin as well.
- Release gates: real iOS and Android home-screen startup; same-test-origin update from the affected predecessor; existing PICK, personal plans and badge preservation; interrupted update; online/offline restart; and rollback with a valid worker replacement. Do not use clearing all site data or manual `/repair` as the normal upgrade path.
- Keep the current public release unchanged until these gates pass and the user approves production deployment. Retain `/repair` only as a last-resort recovery route.

Scope: investigate only. Production source, upload directory, ZIP and Cloudflare deployment were not modified.

## Confirmed failure mechanism

- Cloudflare redirects `/index.html` to `/` with HTTP 308.
- The generated production worker precaches both paths using `cache.addAll`.
- The cached `/index.html` response has `redirected: true`; the cached `/` response has `redirected: false`.
- `vite.upload.config.ts` returns the cached `/index.html` response for root document navigations. Chromium rejects this redirected response for the navigation, producing `ERR_FAILED` before the app or Kakao Maps can start.
- This was reproduced in the actual in-app Chromium browser using the existing production build and a loopback HTTP server implementing the observed Cloudflare redirect.
- A comparison worker, modified in memory by the diagnostic server, changes only the navigation cache lookup to `/` (plus a distinct test cache name). The same build, images and dependencies then load correctly, including a subsequent reload.
- The browser tool could not inspect the generated error interstitial because its generated `data:` URL is restricted. The navigation failure output included `ERR_FAILED`; the preceding diagnostic page confirmed the redirected cached response. No security warning was bypassed.

## Public deployment evidence

Read-only HTTP probes around 2026-09-29 01:37 UTC:

- `/` serves rolled-back HTML referencing `index-BPjsKeqh.js` and `index-CLozN7mS.css`.
- The old JS does not contain the service worker registration or Kakao SDK loader.
- `/sw.js` still returns a CDN cache hit for `busan-offline-5a47590abf0aebac`, listing `index-DxopuK4-.js` and `index-CZl-bYkR.css`.
- `/offline-version.json` returns a CDN cache hit with `updated: 2026-09-23T06:29:17.000Z`.
- A cache-busting request to `/sw.js?diagnostic=20260929` returns the rolled-back HTML, content type `text/html`, rather than JavaScript.
- This means a server rollback alone does not reliably replace the installed faulty worker. A stale CDN response can keep the bad code; an HTML response is not a valid worker update. The exact installed worker on the user's phone was not inspected.

## Reproduction

Run `node tests/cloudflare-diagnostic-server.mjs` and open `http://127.0.0.1:4187/_diagnostic` in a test browser profile.

1. Install production worker; inspect cached HTML to verify the redirect flags.
2. Open cached app: navigation fails with `ERR_FAILED`.
3. Open the diagnostic path in another tab and install the canonical-path test worker.
4. Open cached app and reload: home screen and offline-ready status appear normally.

The fixture is outside the public build. It reads `cloudflare-upload`; it does not rewrite it. The temporary server was stopped after testing.

## Repair needed before redeployment

1. Cache a canonical, non-redirected document response and validate cached HTML before serving navigations.
2. Supply a valid replacement `/sw.js` to recover already installed faulty workers; include an explicit update/recovery strategy and appropriate cache headers. Simply deleting `sw.js` or rolling back to a version without one is not sufficient.
3. Test fresh load, controlled reload, upgrade, rollback and offline startup with Cloudflare-style redirects, not only the development server.
4. Preserve localStorage containing PICK selections, personal plans and badges. Do not advise users to clear all site data as the default repair.

Reference: https://developers.cloudflare.com/pages/configuration/serving-pages/

## Repair completed locally

Follow-up request: the user authorized fixing the issue. The notes above describe the earlier investigation; the following changes are now included in the regenerated upload folder and ZIP, but have not been deployed to Cloudflare.

- `scripts/offline-worker.mjs`: builds a worker that normalizes document responses, uses network-first navigation with a four-second fallback, and precaches a build-specific HTML shell checked against its SHA-256 hash. It does not cache a live root document alongside potentially mismatched hashed assets.
- The worker activates automatically after successful preparation, retains two previous asset caches for existing tabs, and never touches localStorage or IndexedDB. Duplicate installation of the same complete cache does not rewrite or delete it.
- Responses are consumed as they arrive, avoiding an install stall from waiting for all HTTP response headers before consuming large image bodies. A regression test covers this ordering.
- `scripts/offline-repair.html`: a standalone `/repair` page registers the new worker with a build-specific query to bypass stale script responses. It is outside the old root-navigation cache interception. It does not delete personal records.
- `public/_headers`: explicit no-store headers for the worker, recovery page and version metadata. See https://developers.cloudflare.com/pages/configuration/headers/.
- `app/offline-status.tsx`: notices worker replacements, cleans up listeners, and reads existing cached metadata if a worker update fails while the app is already controlled/offline.

Verification:

- Static production build succeeded.
- 36 focused tests passed, including 16 worker/build/recovery tests.
- Actual Chromium: installed the legacy redirected-document cache, opened `/repair`, completed recovery, opened the app, and reloaded successfully.
- Diagnostic localStorage sentinel remained `keep-records` after recovery.
- Actual Chromium: server HTTP 503 and a completely stopped app server both still allowed the cached home/timetable to open.
- Actual Chromium: a simulated server rollback displayed the rollback HTML, not the cached newer document.
- Actual Chromium: fresh installation, another fixed release, and repeated same-version recovery completed successfully.
- Mobile 390 x 844 recovery layout inspected; screenshot is `tests/offline-repair-mobile.png`.
- Full `tsc --noEmit` still reports three pre-existing server-only type errors: `cloudflare:workers`, `Fetcher`, and `D1Database`. No new type errors were reported.
- Real iOS Safari/Android Chrome and the uploaded HTTPS deployment still require a post-upload check. Test servers were stopped; production was not modified.

Deployment: upload the regenerated `busan-rock-cloudflare.zip` to the existing Cloudflare Pages project. After deployment, an affected user can open `https://busan-rock-timetable.pages.dev/repair`, choose the recovery button, then reopen the app. Do not clear all site data.
