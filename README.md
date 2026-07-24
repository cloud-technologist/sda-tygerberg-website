# Tygerberg SDA Church Website

Bilingual (Afrikaans/English) marketing + information site for Tygerberg
Seventh-day Adventist Church (Boston, Bellville, Cape Town). Built from the
`SDA_Tygerberg` design handoff — see that package's `README.md` and
`reference/design-system-readme.md` for the original visual spec.

## Stack

- **[Astro](https://astro.build)** (static output) + **React islands** for the
  interactive bits (language toggle, accordions, carousel, copy-address, map
  tap-to-activate)
- **Tailwind CSS v4** (CSS-first config — see `src/styles/global.css` for the
  design tokens, ported from the handoff's `reference/tokens/*.css`)
- **TypeScript**
- **Cloudflare Workers** (static assets + a small API layer) via **Wrangler**
- **Node 24 LTS** — see `.nvmrc`

## Getting started

```sh
nvm use          # Node 24 LTS
npm install
npm run dev       # Astro dev server, http://localhost:4321
```

To exercise the `/api/*` routes locally (not available under plain `astro dev`),
run the site through Wrangler instead:

```sh
cp .dev.vars.example .dev.vars   # fill in YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID if you have them
npm run worker:dev                # builds, then wrangler dev
```

## Deployment (Cloudflare Workers)

```sh
npm run deploy     # astro build && wrangler deploy
```

This deploys the static site plus the Worker in `src/worker/` (configured in
`wrangler.jsonc`) under a single Cloudflare Workers project — static assets
are served via the `ASSETS` binding, and `/api/*` requests are handled by the
Worker.

To wire up real YouTube live-stream detection in production:

```sh
wrangler secret put YOUTUBE_API_KEY
wrangler secret put YOUTUBE_CHANNEL_ID
```

Without these set, `/api/live-status` falls back to the `MANUAL_LIVE_FLAG` var
in `wrangler.jsonc` (default `false`). Either way, the stream box always
embeds the channel's uploads playlist, so "latest video by default" works
with zero maintenance regardless of live status.

### Scheduled polling (optional)

By default `/api/live-status` checks YouTube directly on each request. To
instead poll on a schedule and cache the result in KV (cheaper, avoids
hitting the YouTube API quota on every page load):

```sh
wrangler kv namespace create LIVE_STATUS_KV
```

then uncomment the `kv_namespaces` and `triggers.crons` blocks at the bottom
of `wrangler.jsonc` and paste in the namespace id it prints. The worker code
already supports both modes (`src/worker/liveStatus.ts`) — this is purely a
config toggle, no code changes needed.

## CI/CD (GitHub Actions)

Two independent workflows under `.github/workflows/`:

| Workflow | Target | Trigger | Notes |
|---|---|---|---|
| `deploy-devtest-pages.yml` | GitHub Pages | push to `main`, or manual | Free static preview, no secrets required. Built with `ASTRO_BASE=/<repo-name>/` and `PUBLIC_HAS_API=false` since Pages project sites serve from a subpath and have no `/api/*` (that needs the Worker) — the live-status poll is skipped entirely at build time rather than hitting an endpoint that would always 404, and the badge just stays off. |
| `deploy-production-cloudflare.yml` | Cloudflare Workers | manual only | The real site, full Worker + `/api/*`. Deliberately not automatic on every push. |

One-time setup:

- **GitHub Pages**: in the repo's Settings → Pages, set "Build and
  deployment" → Source to **GitHub Actions**.
- **Cloudflare**: add repo secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts +
  Account Settings: Edit) and `CLOUDFLARE_ACCOUNT_ID` under Settings →
  Secrets and variables → Actions.

Both workflows read the Node version from `.nvmrc`, so bumping that file is
enough to move CI to a newer Node LTS.

## Content that's easy to edit

All copy and structured content lives under `src/data/`, separate from
components:

| File | What it holds |
|---|---|
| `src/data/site.ts` | Address, map coordinates, external links, manual live flag |
| `src/data/homeCopy.ts` | Homepage bilingual copy + weekly ministry schedule |
| `src/data/beliefsCopy.ts` | Beliefs-page header copy |
| `src/data/beliefs.ts` | All 28 Fundamental Beliefs, bilingual, grouped into 6 categories (final content, not placeholder) |
| `src/data/departmentHeads.ts` | Department-head carousel data — **placeholder names/photos, TBA from the board** |
| `src/data/resources.ts` | External resource links (logos self-hosted under `public/logos/`) |
| `src/data/giving.ts` | EFT banking details shown in the Give card's expandable panel |

## Known open items (carried over from the design handoff)

These were explicitly flagged as unresolved by the church board in the
original handoff and are **not** blockers for this MVP:

1. **Department head names + photos** — placeholders (`[Naam 1]`…`[Naam 6]`)
   in `src/data/departmentHeads.ts`; swap in real `name`/`photoUrl` per person
   once supplied.
2. ~~**"Get involved" contacts**~~ — resolved: Connect and Bible Studies link
   to `mailto:sdatygerbergkerk@gmail.com` (with a pre-filled subject), and
   Give shows real EFT banking details (`src/data/giving.ts`) in an
   expandable panel. The contact email is also on the Visit card and footer.
   Still open: a dedicated form or per-ministry routing if the board wants
   something more structured than a shared inbox later.
3. **Live-stream detection** — `/api/live-status` (see `src/worker/`) is
   wired for the YouTube Data API but needs a `YOUTUBE_API_KEY` +
   `YOUTUBE_CHANNEL_ID` to use it; otherwise it's a manual flag.
4. **Weekly ministry schedule** — currently 4 fixed entries in
   `homeCopy.ts`; move to a CMS/KV-backed endpoint if it starts changing
   seasonally (the Worker is already the natural place to add that route).
5. ~~**Mobile hamburger nav**~~ — resolved: below the `lg` breakpoint the
   header nav collapses behind a hamburger button (`src/components/react/Header.tsx`).
