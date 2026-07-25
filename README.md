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

To test the Worker locally (static asset serving, same as production), run
the site through Wrangler instead:

```sh
npm run worker:dev                # builds, then wrangler dev
```

To exercise the LIVE badge locally, copy `.dev.vars.example` to `.dev.vars`
(gitignored) and fill in a YouTube API key. Widening `LIVE_CHECK_CRON` to
`* * * * *` there saves waiting until Saturday morning to see it work.

## Deployment (Cloudflare Workers)

```sh
npm run deploy     # astro build && wrangler deploy
```

This deploys the static site plus the Worker in `src/worker/` (configured in
`wrangler.jsonc`) under a single Cloudflare Workers project — static assets
are served via the `ASSETS` binding. `src/worker/index.ts` serves one API
route (`/api/live-status`, below) and is the natural place to add more
(contact form, CMS-backed schedule data, etc.).

The homepage video always embeds the channel's auto-generated "uploads"
playlist (`SITE.youtubeUploadsEmbedUrl` in `src/data/site.ts`), which YouTube
keeps in newest-first order with zero maintenance and no API key/secrets
required. **Which video plays never depends on the API key** — that's only
for the LIVE badge.

## LIVE badge

A small pulsing "LIVE"/"LEWENDIG" pill appears over the video while the
channel is actually streaming. It's cosmetic: every failure path resolves to
"not live" and hides the badge, and the video embed works regardless.

`/api/live-status` answers the question, and only spends YouTube API quota
inside a configured window. `search.list` costs **100 quota units** against a
10,000/day default, so an ungated per-request check would burn a full day's
quota in about 100 page views. Two things prevent that:

1. **The window.** `LIVE_CHECK_CRON` is a standard 5-field cron expression
   read as a *window* rather than a schedule, evaluated in `LIVE_CHECK_TZ`.
   The default `* 9-11 * * 6` means "any minute from 09:00 to 11:59 on
   Saturdays" — Sabbath School through Divine Service. Outside it the Worker
   returns `outside-window` without calling YouTube at all, so six days a
   week the badge costs nothing. Change the window by editing the `vars`
   block in `wrangler.jsonc` and redeploying; no code change needed.
2. **The poll interval.** `LIVE_CHECK_MEMO_SECONDS` (default `300`, i.e. one
   poll every 5 minutes) is how often YouTube is actually called while the
   window is open — one answer is reused across every request in between, so
   a congregation refreshing during the service doesn't become one API call
   per visitor. It's a module-scope variable, not KV — nothing to provision.
   Set it to `0` to call YouTube on every in-window request.

**Keep the cron's minute field `*`.** It decides whether the window is *open*,
not how often YouTube is polled — those are the two separate knobs above.
Writing `*/5 9-11 * * 6` to mean "poll every 5 minutes" would instead close
the window for the four minutes between each mark, and the badge would blink
off and on for viewers. Set the poll rate with `LIVE_CHECK_MEMO_SECONDS`.

Worst case under the defaults: a 3-hour window at one poll per 5 minutes is
36 polls, or 3,600 quota units — comfortably inside the 10,000/day free tier
even if the isolate is recycled a few times.

Setup is two **Worker secrets** — Cloudflare dashboard → Workers & Pages →
`tygerberg-sda-website` → Settings → Variables and Secrets:

| Secret | Value |
|---|---|
| `YOUTUBE_API_KEY` | A Google Cloud API key with **YouTube Data API v3** enabled |
| `YOUTUBE_CHANNEL_ID` | `UCtZlioPBBORWMMMSJ9BE1Wg` |

These must be **Worker secrets, not GitHub Actions secrets**. Actions secrets
exist only at build time and would never reach the Worker; worse, exposing
the key to the client build would publish it to anyone viewing source. Until
both are set the endpoint reports `not-configured` and the badge stays hidden.

`curl https://tygerberg-sda.cloudkid.link/api/live-status` echoes back the
resolved window and a `source` field (`youtube-api`, `outside-window`,
`not-configured`, `invalid-schedule`, `api-error`), which is usually enough
to diagnose a badge that isn't behaving. A malformed cron or unknown
timezone fails *closed* — `invalid-schedule`, zero API calls — so a typo
costs nothing rather than quietly spending quota.

## Branch strategy

- **`dev`** — integration branch. Feature PRs target `dev`; every merge
  auto-deploys the devtest preview (GitHub Pages).
- **`main`** — production branch. Only moves via a gated `dev` -> `main`
  promotion PR, which is reviewed like any other change; merging it
  auto-deploys to Cloudflare (the live site).

This keeps production deploys deliberate (a reviewed promotion PR) without
requiring a manual dispatch for every release.

## CI/CD (GitHub Actions)

Two independent workflows under `.github/workflows/`:

| Workflow | Target | Trigger | Notes |
|---|---|---|---|
| `deploy-devtest-pages.yml` | GitHub Pages | push to `dev`, or manual | Free static preview, no secrets required. Built with `ASTRO_BASE=/<repo-name>/` since Pages project sites serve from a subpath, and `PUBLIC_HAS_API=false` so the LIVE badge doesn't poll a Worker route that doesn't exist here. |
| `deploy-production-cloudflare.yml` | Cloudflare Workers | push to `main`, or manual | The real site, full Worker + `/api/*`. Gated by the `dev` -> `main` promotion PR described above; manual dispatch is available for a re-deploy without a new merge. |

One-time setup:

- **GitHub Pages**: in the repo's Settings → Pages, set "Build and
  deployment" → Source to **GitHub Actions**.
- **Cloudflare**: add repo secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts +
  Account Settings: Edit) and `CLOUDFLARE_ACCOUNT_ID` under Settings →
  Secrets and variables → Actions. Production is wired to
  `tygerberg-sda.cloudkid.link` via the `routes` entry in `wrangler.jsonc`
  (`custom_domain: true`) — `wrangler deploy` attaches it automatically
  since the `cloudkid.link` zone already lives in that Cloudflare account.

Both workflows read the Node version from `.nvmrc`, so bumping that file is
enough to move CI to a newer Node LTS.

## Content that's easy to edit

All copy and structured content lives under `src/data/`, separate from
components:

| File | What it holds |
|---|---|
| `src/data/site.ts` | Address, map coordinates, external links |
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
2. **"Get involved" contacts** — Connect, Bible Studies, and the banking
   contact line were removed for POPIA compliance (see `src/data/giving.ts`,
   `GetInvolved.tsx`). Give still shows real EFT banking details
   (`src/data/giving.ts`) in an expandable panel. Needs a compliant contact
   mechanism (form with consent, dedicated inbox, etc.) before Connect/Bible
   Studies/a contact channel can be restored.
3. **Weekly ministry schedule** — currently 4 fixed entries in
   `homeCopy.ts`; move to a CMS/KV-backed endpoint if it starts changing
   seasonally (the Worker is already the natural place to add that route).
4. **LIVE badge credentials** — the badge is built and deployed, but stays
   hidden until `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are set as Worker
   secrets (see "LIVE badge" above). Nothing else depends on them.
5. ~~**Mobile hamburger nav**~~ — resolved: below the `lg` breakpoint the
   header nav collapses behind a hamburger button (`src/components/react/Header.tsx`).
