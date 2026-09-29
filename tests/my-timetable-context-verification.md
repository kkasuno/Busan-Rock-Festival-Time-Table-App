# MY timetable context verification

Verified on 2026-09-29 against the local Cloudflare upload build.

- Default MY view shows only picked performances.
- Enabling `다른 공연 흐리게` shows 35 Day 1 performances: 2 picked at
  opacity 1 and 33 unpicked at opacity 0.48 in the shared test timetable.
- Only the 2 picked artist performances have attendance controls.
- Adding hrtz.wav from a faint card produces 3 picked cards, 3 attendance
  controls and 3 conflicting picked cards. No personal-plan dialog opens.
- Removing that pick and disabling context returns to 2 cards and no conflicts.
- Day 2 with no picks shows 35 faint cards and no attendance controls.
- ALL mode has no faint cards or attendance controls.
- Reloading preserves the display option without changing the shared test picks.
- Controls fit at 320px and 390px; document width does not exceed the viewport.
- Desktop rendering checked at 1280px; browser console reports no errors.
- User's localhost timetable retains the MY count of 34. Only its display
  preference was enabled, with 3 selected and 32 faint cards on Day 1.
- Image export, stored picks, attendance data, and worker logic were not changed.

Validation: `npm run build:upload` succeeds; existing 46 tests pass.
`npx tsc --noEmit --incremental false` still reports only the pre-existing
Cloudflare server type errors (`cloudflare:workers`, `Fetcher`, `D1Database`).

Screenshots: `artifacts/my-timetable-faint-desktop.png` and
`artifacts/my-timetable-faint-preview.png`.

Production was not deployed. The existing real-device installed-PWA release
gate remains in effect.
