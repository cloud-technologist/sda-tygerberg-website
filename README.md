# Tygerberg SDA Church Website

Bilingual (Afrikaans/English) marketing + information site for Tygerberg
Seventh-day Adventist Church (Boston, Bellville, Cape Town). Built from the
`SDA_Tygerberg` design handoff — see that package's `README.md` and
`reference/design-system-readme.md` for the original visual spec.

Setting this up from scratch (GitHub, Cloudflare, Google Cloud, the contact
webhook)? Start with [`SETUP-INSTRUCTIONS.md`](./SETUP-INSTRUCTIONS.md).

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
   The default `* 6-11 * * 6` means "any minute from 06:00 to 11:59 on
   Saturdays", closing at 12:00. Outside it the Worker returns
   `outside-window` without calling YouTube at all, so six days a week the
   badge costs nothing. Change the window by editing the `vars` block in
   `wrangler.jsonc` and redeploying; no code change needed.

   Day-of-week `6` is Saturday — cron counts from `0` = Sunday, so writing
   `7` for "the seventh day" would select Sunday instead.

   Note the window closes at 12:00 while `SERVICE_TIMES` puts Divine Service
   at 11:00, so a service running past noon loses the badge for its last
   stretch. Widen the hour field (`6-13`) if that matters.
2. **The poll interval.** The client checks every 5 minutes
   (`POLL_INTERVAL_MS` in `src/components/react/useLiveStatus.ts`) — one
   cadence whether the window is open, closed, or the last check failed. A
   failed check never ends the loop, so the badge recovers on its own once
   the Worker or the API comes back.

**Keep the cron's minute field `*`.** It decides whether the window is *open*,
not how often YouTube is polled. Writing `*/5 9-11 * * 6` to mean "poll every
5 minutes" would instead close the window for the four minutes between each
mark, and the badge would blink off and on for viewers.

**There is no server-side caching**, by design — every in-window request is a
live call to YouTube. Cost therefore scales with concurrent viewers, not with
time: one viewer across a 3-hour window is 36 polls (3,600 units), two is
7,200, and three exceeds the 10,000/day free tier. If the badge starts
reporting `api-error` late in a service, that's the quota, and the levers are
a narrower window, a longer `POLL_INTERVAL_MS`, or a raised quota.

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

## Contact form (`/connect`, `/bible-studies`)

Two pages collect requests from visitors: **Verbind** (a general enquiry) and
**Bybelstudies** (a free Bible/baptismal study). They're the same shell with
different copy — `src/components/react/RequestPage.tsx`, driven by
`src/data/requestCopy.ts`.

Both post to `POST /api/contact` (`src/worker/contact.ts`), which validates
the submission and forwards it as JSON to whatever URL is in the
`CONTACT_WEBHOOK_URL` Worker secret. Any endpoint that accepts a JSON POST
works — Zapier, Make, an Apps Script, n8n, a church-inbox webhook — which
keeps the church off any single vendor. **Set it as a Worker secret, not a
build-time variable**: it's a delivery address, and a public one invites spam.

The response `outcome` tells you what happened, the same way the LIVE badge's
`source` does:

| `outcome` | Meaning |
|---|---|
| `forwarded` | Accepted by the webhook — the only case the visitor is told it was sent |
| `not-configured` | No `CONTACT_WEBHOOK_URL` set; the form says so rather than pretending |
| `invalid` | Failed validation; `errors` lists the offending field names |
| `forward-error` | The webhook timed out or refused — the visitor is asked to retry |

Success is never reported on a delivery that didn't happen: leaving someone
waiting for a reply that was never coming is worse than showing an error.

**POPIA.** The form asks for the minimum needed to reply (a name, plus an
email *or* a phone number — not both) and will not submit without an
explicitly ticked consent box; consent is validated server-side too, so a
crafted request can't skip it. The forwarded payload records `consent` and
`submittedAt`, because POPIA consent has to be demonstrable after the fact and
the church's inbox is the only place the submission survives. The privacy
wording shown to visitors lives in `src/data/requestCopy.ts`.

A hidden "website" field acts as a **honeypot** — it's positioned off-screen
and skipped by keyboard focus, so a person never sees or fills it, but form
bots fill every field they find. A submission with it filled gets a normal
`200` and is silently dropped; telling a bot it was caught only teaches it to
try again differently. There is no rate limiting beyond that (Workers has no
shared memory between isolates) — add a KV- or D1-backed counter if spam
becomes a real problem.

On the GitHub Pages devtest build there is no Worker at all, so
`PUBLIC_HAS_API=false` renders the form read-only behind a notice rather than
letting someone fill in a form that can't submit.

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

One-time setup — full walkthrough in
[`SETUP-INSTRUCTIONS.md`](./SETUP-INSTRUCTIONS.md), in short:

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
| `src/data/departmentHeads.ts` | Department-head carousel data — real names from the board's 2025/2026 Ampsdraers roster; **photos still TBA** |
| `src/data/requestCopy.ts` | Copy for the `/connect` and `/bible-studies` request pages, including the POPIA privacy/consent wording |
| `src/data/resources.ts` | External resource links (logos self-hosted under `public/logos/`) |
| `src/data/giving.ts` | EFT banking details shown in the Give card's expandable panel |

## Known open items (carried over from the design handoff)

These were explicitly flagged as unresolved by the church board in the
original handoff and are **not** blockers for this MVP:

1. **Department head photos** — names are now real (from the board's
   "Ampsdraers 2025/2026" roster), but every card still shows the striped
   placeholder. Add `photoUrl` per person in `src/data/departmentHeads.ts` as
   headshots arrive; no component change needed.
2. ~~**"Get involved" contacts**~~ — resolved: Connect and Bible Studies now
   lead to `/connect` and `/bible-studies`, which collect a request behind an
   explicit POPIA consent checkbox and post it to `/api/contact` (see
   "Contact form" above). Still needs `CONTACT_WEBHOOK_URL` set as a Worker
   secret before submissions go anywhere. The banking contact line stays
   removed — Give shows account details only.
3. **Weekly ministry schedule** — currently 4 fixed entries in
   `homeCopy.ts`; move to a CMS/KV-backed endpoint if it starts changing
   seasonally (the Worker is already the natural place to add that route).
4. **LIVE badge credentials** — the badge is built and deployed, but stays
   hidden until `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` are set as Worker
   secrets (see "LIVE badge" above). Nothing else depends on them.
5. ~~**Mobile hamburger nav**~~ — resolved: below the `lg` breakpoint the
   header nav collapses behind a hamburger button (`src/components/react/Header.tsx`).
