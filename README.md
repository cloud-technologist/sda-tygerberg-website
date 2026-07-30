# Tygerberg SDA Church Website

Bilingual (Afrikaans/English) site for Tygerberg Seventh-day Adventist Church
(Boston, Bellville, Cape Town). Astro static output + React islands, served by a
Cloudflare Worker.

Setting this up from scratch? See [`SETUP-INSTRUCTIONS.md`](./SETUP-INSTRUCTIONS.md).

Design rationale is not repeated here — it lives in comments next to the code it
explains. This file is what you need to run, deploy and maintain the site.

## Stack

Astro (static) · React islands · Tailwind CSS v4 (tokens in
`src/styles/global.css`) · TypeScript · Cloudflare Workers via Wrangler · Node
24 LTS (`.nvmrc`).

## Commands

```sh
nvm use
npm install

npm run dev          # Astro dev server, http://localhost:4321
npm run build        # static build into dist/
npm run worker:dev   # build, then wrangler dev — Worker + /api/* locally
npm run deploy       # build, then wrangler deploy
npx tsc --noEmit     # typecheck
```

For the LIVE badge locally, copy `.dev.vars.example` to `.dev.vars` (gitignored)
and add a YouTube API key. Widening `LIVE_CHECK_CRON` to `* * * * *` there avoids
waiting for Saturday.

## Configuration

**Worker secrets** — Cloudflare dashboard → Workers & Pages →
`tygerberg-sda-website` → Settings → Variables and Secrets, or
`wrangler secret put`:

| Secret | Purpose |
|---|---|
| `YOUTUBE_API_KEY` | Google Cloud key with YouTube Data API v3 enabled. Without it the LIVE badge stays hidden. |
| `YOUTUBE_CHANNEL_ID` | `UCtZlioPBBORWMMMSJ9BE1Wg` |
| `CONTACT_WEBHOOK_URL` | Where `/api/contact` forwards submissions. Any JSON POST endpoint. Without it the form reports `not-configured`. |

These must be **Worker** secrets. An Actions secret alone never reaches the
Worker. Storing the two YouTube values as repo secrets does work, but only
because `deploy-production-cloudflare.yml` names them under the deploy step's
`secrets:` input and `wrangler-action` uploads them — remove one from repo
settings without removing it there and an empty value gets uploaded.

`CONTACT_WEBHOOK_URL` must never be a build-time variable: it is a delivery
address, and a public one invites spam.

In `deploy-production-cloudflare.yml` the `env:` block carrying these values is
scoped to the deploy step, deliberately — keep it there. Hoisting it to job level
would put `YOUTUBE_API_KEY` in the environment during `npm run build`, where it
can reach the client bundle.

**Worker vars** (`wrangler.jsonc`, edit and redeploy — no code change):

| Var | Default | Meaning |
|---|---|---|
| `LIVE_CHECK_CRON` | `* 6-11 * * 6` | When the LIVE badge may spend API quota, read as a *window*, not a schedule. Saturdays 06:00–11:59, closing at noon. |
| `LIVE_CHECK_TZ` | `Africa/Johannesburg` | Timezone the window is evaluated in. |

- Day-of-week `6` is Saturday; cron counts from `0` = Sunday.
- **Keep the minute field `*`.** It controls whether the window is *open*, not
  the poll rate. `*/5 9-11 * * 6` would close the window for four minutes out of
  every five and make the badge blink. Poll rate is `POLL_INTERVAL_MS` in
  `src/components/react/useLiveStatus.ts` (5 minutes).
- The window closes at 12:00 while Divine Service starts at 11:00, so a service
  running past noon loses the badge. Widen the hour field (`6-13`) if needed.

**Build-time env vars** (set by the workflows; unset means the first value):

| Var | Effect when set |
|---|---|
| `ASTRO_BASE` | Serve under a subpath, e.g. `/sda-tygerberg-website/` for GitHub Pages. |
| `PUBLIC_HAS_API=false` | No Worker present: skip the live-status poll, render the contact form read-only behind a notice. |
| `PUBLIC_INDEXABLE=false` | Emit `noindex,nofollow`. |
| `PUBLIC_IMAGE_CDN=false` | No edge transformer: skip the runtime probe and serve the fallback headshots directly. |

## Branch strategy and CI/CD

- **`dev`** — integration. Feature PRs target `dev`; each merge deploys the
  GitHub Pages preview.
- **`main`** — production. Moves only via a reviewed `dev` → `main` promotion PR;
  merging deploys to Cloudflare.

| Workflow | Target | Trigger | Build env |
|---|---|---|---|
| `deploy-devtest-pages.yml` | GitHub Pages | push to `dev`, or manual | `ASTRO_BASE`, `PUBLIC_HAS_API=false`, `PUBLIC_INDEXABLE=false`, `PUBLIC_IMAGE_CDN=false` |
| `deploy-production-cloudflare.yml` | Cloudflare Workers | push to `main`, or manual | — (full Worker + `/api/*`) |

Both read the Node version from `.nvmrc`.

One-time setup: Settings → Pages → Source = **GitHub Actions**; repo secrets
`CLOUDFLARE_API_TOKEN` (Workers Scripts + Account Settings: Edit) and
`CLOUDFLARE_ACCOUNT_ID`. Production is wired to `tygerberg-sda.cloudkid.link`
via `routes` in `wrangler.jsonc` (`custom_domain: true`), attached automatically
on deploy since the `cloudkid.link` zone is in the same account.

## Diagnostics

`curl https://tygerberg-sda.cloudkid.link/api/live-status` returns the resolved
window plus a `source`:

| `source` | Meaning |
|---|---|
| `youtube-api` | Checked live |
| `outside-window` | Outside `LIVE_CHECK_CRON`; no API call made |
| `not-configured` | Secrets missing |
| `invalid-schedule` | Malformed cron or unknown timezone — fails closed, zero API calls |
| `api-error` | YouTube refused; usually exhausted quota |

The window is checked *before* credentials, so on any day but Saturday you get
`outside-window` whether or not secrets are set. To confirm secrets arrived,
check the deploy log's upload step rather than curling mid-week.

`POST /api/contact` returns an `outcome`:

| `outcome` | Meaning |
|---|---|
| `forwarded` | Accepted by the webhook — the only case the visitor is told it sent |
| `not-configured` | No `CONTACT_WEBHOOK_URL` |
| `invalid` | Failed validation; `errors` lists the field names |
| `forward-error` | Webhook timed out or refused; the visitor is asked to retry |

**Quota.** `search.list` costs 100 units against 10,000/day, and there is no
server-side caching, so cost scales with concurrent viewers: one viewer over a
3-hour window is ~3,600 units, three exceeds the free tier. `api-error` late in
a service means quota — narrow the window, raise `POLL_INTERVAL_MS`, or raise
the quota.

**Contact-form abuse protection is Cloudflare's, not the app's.** Bot Fight Mode
and a WAF rate-limiting rule sit in front of `/api/contact`.

> Neither is on by default, and both need a custom domain — a `*.workers.dev`
> URL gets no zone protection. Until enabled, the endpoint is unprotected. See
> [SETUP-INSTRUCTIONS.md §3.5](./SETUP-INSTRUCTIONS.md). Turnstile is the next
> step up and needs code: a widget plus a `siteverify` call before forwarding.

**POPIA.** The form takes a name plus an email *or* phone, requires a ticked
consent box (validated server-side too), and records `consent` and `submittedAt`
in the forwarded payload, since consent must be demonstrable and the church
inbox is the only place a submission survives. Visitor-facing wording is in
`src/data/requestCopy.ts`.

## Editing content

All copy and structured content is under `src/data/`, away from components:

| File | Holds |
|---|---|
| `site.ts` | Address, map coordinates, external links, service times, building hours |
| `homeCopy.ts` | Homepage copy, weekly ministry schedule, "your first visit" answers |
| `beliefsCopy.ts` | Beliefs-page header copy |
| `beliefs.ts` | All 28 Fundamental Beliefs, bilingual, in 6 categories |
| `departmentHeads.ts` | Carousel roster — 21 people, 11 with headshots |
| `requestCopy.ts` | `/connect` and `/bible-studies` copy, including POPIA wording |
| `resources.ts` | External resource links (logos in `public/logos/`) |
| `giving.ts` | EFT banking details |

The homepage video always embeds the channel's auto-generated uploads playlist
(`SITE.youtubeUploadsEmbedUrl`), newest-first with no API key. Which video plays
never depends on `YOUTUBE_API_KEY` — that is only the LIVE badge.

## Church symbol

`src/assets/sda-symbol.svg` is the only copy, imported as raw markup (`?raw`) so
it inherits `currentColor`. `public/favicon.svg` and
`public/apple-touch-icon.png` are generated from it and committed, not built; see
`tools/README.md`.

It is a General Conference trademark, used here by a member congregation. It may
be recoloured and nothing else — never redrawn or distorted to fit a layout.

## Department head photos

Two copies on the origin, and a third form made per request:

| Where | What |
|---|---|
| `public/images/hod/TG-DH-*.jpg` | Studio originals, ~3,500 × 5,300, 7-10 MB. Served, but only ever fetched by Cloudflare's transformer. |
| `public/images/hod/fallback/TG-DH-*.jpg` | 1400px, ~300 kB, from `tools/build-headshots.mjs`. Served when there is no transformer. |
| `/cdn-cgi/image/<options>,width=N/images/hod/...` | What visitors normally get, resized at the edge as AVIF/WebP/JPEG. Not stored. |

Which of the two gets used is decided in `src/lib/cdnImage.ts`: the
`PUBLIC_IMAGE_CDN=false` build flag short-circuits to the fallbacks, otherwise a
single `HEAD` probe on hydration confirms the transformer is answering. A card
whose transform fails individually also drops to its fallback.

Image Transformations are already enabled on the `cloudkid.link` zone, so no
dashboard change was needed. `/cdn-cgi/*` is handled by Cloudflare before a
request reaches the Worker.

**Two invariants**, both commented where they live:

- `HEADSHOT_SIZES` must describe the widths `CARD_WIDTH` in `AboutCarousel.tsx`
  actually renders, or every card downloads the wrong size.
- `MASTER_WIDTH` in `tools/build-headshots.mjs` must stay ≥ the largest
  `HEADSHOT_WIDTHS` entry, so a fallback is never smaller than the srcset
  candidate it replaces.

### Adding a photo

1. Put the original in `public/images/hod/`.
2. `node tools/build-headshots.mjs` — builds its fallback copy.
3. Set `photo` on that person in `src/data/departmentHeads.ts`: the filename
   only, e.g. `TG-DH-Jaco.jpg`. Both paths derive from it.

Commit the generated fallback too. `public/` is publicly reachable, so a photo
is on a live URL once committed, whether or not a card points at it.

## Findability

`src/layouts/Layout.astro` emits the canonical URL, Open Graph/Twitter tags, and
a `Church` JSON-LD block from `src/lib/structuredData.ts`. `site` in
`astro.config.mjs` is the single source for the production origin — change it
there and canonicals, OG URLs and the sitemap follow.

- **`/sitemap.xml` is not advertised.** Cloudflare serves a managed `robots.txt`
  on this zone with no `Sitemap:` directive, so it must be submitted once in
  [Google Search Console](https://search.google.com/search-console). Nobody will
  be prompted for this.
- **The devtest preview is publicly crawlable** and `robots.txt` cannot cover it.
  `PUBLIC_INDEXABLE=false` and production-pointing canonicals keep it out of
  search results.

## Open items

Needs the church board:

1. **Headshots for 10 of the 21** — Arnold Neuhoff, Lisa Branders, Morné Louw,
   Adéle Meyer, Chris Meyer, Gert Coetzee, Peter Wallace, Sanet Stevens, Bertie
   Hoffman, the Louw family.
2. **The Ampsdraers 2025/2026 roster is missing an entry.** Laura Rolff chairs
   the Persoonlike Bedieningkomitee & Evangelisasie and has a card here, but the
   roster records Personal Ministries only as one of the elder's titles and names
   no chair. The site is the more current of the two.
3. **"Your first visit" answers.** `FirstVisit.tsx` is built and hides itself
   while `homeCopy.firstVisit` is empty, which it is. Needs, in both languages:
   parking, children's programme and ages, wheelchair access, what people wear,
   service language. Adding entries publishes the section.
4. **Weekly ministry schedule** is 4 fixed entries in `homeCopy.ts`. Move to a
   KV/CMS-backed Worker route if it starts changing seasonally.
5. **A photograph for the social card.** `public/og-image.png` is a typographic
   card; a building or congregation photo would be better. One-file swap at
   1200×630 — dimensions are declared in `Layout.astro`.

Needs someone with access: **submit `/sitemap.xml`** (see Findability), and set
the Worker secrets above.
