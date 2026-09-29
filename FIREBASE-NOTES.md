# Firebase PICK integration

Project: koreanlottery25. Firestore database: (default), Seoul.

## Data boundaries

- Personal timetables remain in browser localStorage. They are never uploaded.
- No account screen is shown. Anonymous Firebase Authentication is used only when submitting PICK changes.
- Firestore stores aggregate totals under busanRock2026PickCounts/{performanceId}.
- The operations subcollection contains random retry tokens and +1/-1 deltas only. It contains no UID, device ID, name, or personal list.
- Firebase Analytics is not initialized.
- Different browsers/devices are independent. Clearing browser data resets this device's contribution history; this is not a verified unique-person vote.

## Refresh and writes

- Totals are cached locally for 10 minutes; hidden pages do not poll. Returning to the app refreshes an expired cache.
- Local selections update immediately. Contribution changes wait 2.5 seconds after editing stops, coalescing quick add/remove actions.
- Each actual change atomically writes the total and a retry receipt. Retrying the same token cannot increment again.
- A local journal survives reloads and reconnects. Web Locks prevent overlapping writers from tabs on secure origins.
- A new deployment origin is a new browser storage area, so local development selections do not automatically transfer.
- There are no scheduled Cloud Functions and no live snapshot listeners. Reads, writes, authentication, and rule checks still consume Firebase quotas. Free operation is not guaranteed for arbitrary traffic.

## Existing project rules

The previous permissive test rule was preserved for other namespaces and excluded from the new PICK namespace.
It permits other project data to be read/written until 2026-12-31; review that policy separately before wider production use.
The PICK rules constrain valid performance IDs, integer deltas, atomic receipts, and nonnegative totals.
Anonymous identities and client-side contribution records do not prevent deliberate repeated voting with new tokens.
For public abuse resistance, add App Check and server-side rate limiting before a large launch.

## Publishing

Build using npm run build and deploy with the site's intended hosting provider.
The browser Firebase configuration is public project identification, not an Admin credential.
No service-account secret is embedded. The site needs HTTPS for the full browser feature set.
Firestore rules are deployed separately with:

    firebase deploy --only firestore:rules --project koreanlottery25

Do not replace these rules with a global allow-read/write rule.
