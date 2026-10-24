# bartchat

Nothing but BART. A feed of complaints, delays, and mixups — riders talking about the trains. **Not official BART.**

Static GitHub Pages shell (`index.html` + `styles.css` + `factory.js` + `site.json`) on Firebase project **subx-skins**. Not the FastAPI / Next `subx` stack. Not bakasan-art.

Wordmark: **bartchat**. Tagline: *Nothing but BART.* `SITE_ID` is `bartchat`. Guest handle: `guestbart`.

## GitHub Pages + custom domain

These files are meant to drop into an empty public repo and be served from GitHub Pages at **bartchat.com**.

1. Push this folder’s contents to branch `main` (site root, not `/docs`).
2. Repo **Settings → Pages**: Deploy from branch `main` / `/` (root).
3. Custom domain: `bartchat.com`. The `CNAME` file in this repo already contains exactly that.

**DNS at GoDaddy still needs to point at GitHub Pages.** Do not change DNS from this repo. Typical GitHub Pages records:

- Apex `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- or a `CNAME` for `www` to `<your-user>.github.io`

Until DNS is pointed, Pages will serve on the github.io URL only if the repo is project-pages configured; for the custom domain, use a user/org Pages root as above.

## Factory files

- `site.json` — siteId, name, tagline, compose/empty-state copy, BART theme tokens, right-rail trends, stations (`places`), topics, nests, Room Brief rail config (`rail`), taxonomy, Stories and feature flags (`stories`, `features`, `dms`, `pixel`, `redditCrosspost`), `minAge`, and a `seedNote` steward note. No sample seed posts, notifs or threads (removed in #16).
- `factory.js` — Auth email/password, live posts (`siteId==bartchat` orderBy `createdAt` desc limit 80), image upload, poll, reply, delete, empty-state
- Rules: subx-factory [`rules/`](https://github.com/jebbdykstra99/subx-factory/tree/main/rules) is **not** a source of truth for what is live. Its `firestore.rules.proposed` is behind the live Firestore rules. Its `storage.rules.proposed` matches the live Storage rules as of 2026-10-22 (subx-factory #6). The live rules are whatever Jebb last hand-published in the console. No rules files live in this repo. The shared nest index is in subx-factory [`factory/firestore.indexes.json`](https://github.com/jebbdykstra99/subx-factory/blob/main/factory/firestore.indexes.json).
- `firebase.indexes.json` (kept): this room's git copy of the live `posts` index (`siteId` + `createdAt`). Each room keeps its own copy: bartchat has only the `posts` index, samochat adds a `stories` index, and gpchat and 27chat carry the same file (`posts` plus the `nestSlug` index). Keep it until that index is recorded in subx-factory.
- SubX publishes rules and indexes by hand in the Firebase console for **subx-skins**. Do not `firebase deploy` from an agent.

## Product locks

- Guest is browse-only. Google provider stays off until enabled.
- Images `image/*` ≤ 5 MB. GIF is a user-uploaded `.gif`, not Tenor.
- AI off the hot path. No Reddit/X ingest.
- Preview banner and `robots.txt` noindex stay until SubX lifts them.
- Not official BART. Not X.com.
