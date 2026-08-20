# Firebase rules (source of truth in this repo)

These files are **not** published by GitHub Pages and must **not** be deployed from this agent.

Project: **subx-skins** (not bakasan-art).

Publish by hand in the Firebase console:

1. Firestore rules from `firestore.rules`
2. Storage rules from `storage.rules`
3. Composite index from `firebase.indexes.json` (`posts`: `siteId` ASC, `createdAt` DESC)

Until the index exists, the live feed query will fail in the compose error line — that is expected, not a fake-success path.
