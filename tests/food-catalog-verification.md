# Food catalog verification

- Source: seven user-supplied posters, split into 25 vendors (7 Busan local food, 18 food lounge), with 66 explicitly published menu/price entries.
- Extracted 25 representative photographs/logos, 384.7 KiB combined WebP. No generated food, inferred individual-menu photos, or invented booth coordinates.
- Incomplete poster menus retain the published total count without inventing missing entries. Portion labels, the limited bingsu item, and Birak event note are retained.
- Browser checks: 320px and 390px mobile layouts and 1280px desktop; vendor detail; menu search; group counts 7/18; independent wanted/eaten toggles; one-place eaten filter; badge earned; records survive reload and a local build update. Test checkmarks were then undone through the UI.
- Simulated local server HTTP 503: app restarted and the Samjin menu and photograph remained available from the prepared cache. The server was restored to normal after this check.
- Build and 41 focused tests pass. Full TypeScript checking still reports the three pre-existing server type errors (`cloudflare:workers`, `Fetcher`, `D1Database`); there are no additional food/map type errors.
- Kakao domains and production services were not modified. The local isolated test origin uses the 2026 fallback guide because it is not an authorized Kakao domain.
- Output is for local / Cloudflare Preview testing. No production deployment was performed. This does not waive the installed-PWA migration release gates recorded in `cloudflare-diagnostic-2026-09-29.md`.
