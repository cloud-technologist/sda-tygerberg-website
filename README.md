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

These end up as **Worker secrets**. An Actions secret on its own never reaches
the Worker — it exists only inside the workflow run — so setting one in GitHub
and stopping there leaves the badge hidden with nothing to explain why.

The production workflow bridges the two: `deploy-production-cloudflare.yml`
lists both names under the deploy step's `secrets:` input and supplies their
values through that step's `env`, and `wrangler-action` runs
`wrangler secret put` for each before deploying. So storing them as repo
secrets *is* enough, but only because the workflow explicitly carries them
across. Setting them directly on the Worker (dashboard or
`wrangler secret put`) works too.

The `env` block is scoped to the deploy step, deliberately: the key is never
present during `npm run build`, so it cannot reach the client bundle.

Until both are set the endpoint reports `not-configured` and the badge stays
hidden.

Note the endpoint checks the *window* before the credentials, so on any day
except Saturday it answers `outside-window` whether or not the secrets are
configured. To confirm they arrived, check the deploy run's log for the secret
upload rather than curling the endpoint mid-week.

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

**Spam filtering is Cloudflare's, not the app's.** The Worker validates and
forwards; it does no bot detection of its own. Bot Fight Mode and a WAF
rate-limiting rule sit in front of `/api/contact` at the edge, where they see
the whole request and cost nothing to run.

> Those two settings are **not on by default**, and they only apply on a
> custom domain — a `*.workers.dev` URL gets no zone-level protection. Until
> they're enabled, this endpoint is unprotected. See
> [SETUP-INSTRUCTIONS.md §3.5](./SETUP-INSTRUCTIONS.md).

Turnstile is the next step up if that isn't enough, and unlike the above it
needs code: a widget in the form and a `siteverify` call before the forward.

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
| `deploy-devtest-pages.yml` | GitHub Pages | push to `dev`, or manual | Free static preview, no secrets required. Built with `ASTRO_BASE=/<repo-name>/` since Pages project sites serve from a subpath, `PUBLIC_HAS_API=false` so the LIVE badge doesn't poll a Worker route that doesn't exist here, and `PUBLIC_IMAGE_CDN=false` because there is no Cloudflare in front of Pages to serve `/cdn-cgi/image/*` — that skips the runtime probe and serves the fallback copies from the start (see "Department head photos"). |
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
| `src/data/site.ts` | Address, map coordinates, external links, Sabbath service times and building hours |
| `src/data/homeCopy.ts` | Homepage bilingual copy + weekly ministry schedule + the "your first visit" answers |
| `src/data/beliefsCopy.ts` | Beliefs-page header copy |
| `src/data/beliefs.ts` | All 28 Fundamental Beliefs, bilingual, grouped into 6 categories (final content, not placeholder) |
| `src/data/departmentHeads.ts` | Department-head carousel data — real names from the board's 2025/2026 Ampsdraers roster plus the Personal Ministries committee chair, with headshots for 11 of the 21 (see "Department head photos") |
| `src/data/requestCopy.ts` | Copy for the `/connect` and `/bible-studies` request pages, including the POPIA privacy/consent wording |
| `src/data/resources.ts` | External resource links (logos self-hosted under `public/logos/`) |
| `src/data/giving.ts` | EFT banking details shown in the Give card's expandable panel |

## Church symbol

The official Seventh-day Adventist symbol — the open Bible, the cross, and the
flame — lives at `src/assets/sda-symbol.svg` and is the only copy. It is
imported as raw markup (`?raw`) rather than as an `<img>` so it inherits
`currentColor`: navy on the cream headers, cream on the navy footers, from one
file.

Two derived files are generated from it and committed rather than built:
`public/favicon.svg` (solid navy) and `public/apple-touch-icon.png` (reversed
out of navy). `public/og-image.png` embeds it too. See `tools/README.md` for
how to regenerate them.

The symbol is a trademark of the General Conference of Seventh-day Adventists,
used here by a member congregation. It is reproduced from the official artwork
and only recoloured — the identity system governs its proportions, so it must
never be redrawn or distorted to fit a layout.

## Department head photos

The carousel on the homepage shows studio headshots for 11 of the 21 people on
the roster. The rest keep the striped placeholder, and adding one is described
at the end of this section.

**Two copies of each photo on the origin, and a third form generated on
request:**

| Where | What |
|---|---|
| `public/images/hod/TG-DH-*.jpg` | The studio originals as shot — ~3,500 × 5,300, 7-10 MB each. Served, but only ever fetched by Cloudflare's transformer. No visitor should receive one. |
| `public/images/hod/fallback/TG-DH-*.jpg` | 1400px, ~200 kB copies built by `tools/build-headshots.mjs`. What gets served when there is no transformer to resize the original. |
| `/cdn-cgi/image/<options>,width=N/images/hod/...` | What visitors normally get — resized per viewport at the edge, as AVIF/WebP/JPEG depending on the browser. Generated on request; nothing is stored in the repo. |

The transform layer is the same approach as the gallery on
`wedding.cloudkid.link` (`wedding-site-worker/src/_helpers.ts` in the
`cloudkid-link` repo): one full-size image on the origin, a `srcset` of
`/cdn-cgi/image/...` URLs, and a `sizes` attribute describing the card's real
width so the browser picks the right one. It all lives in
`src/lib/cdnImage.ts`.

Two invariants there, both commented in place:

- `HEADSHOT_SIZES` describes the card widths that `CARD_WIDTH` in
  `AboutCarousel.tsx` actually renders. Change either and the other is wrong,
  and every card downloads the wrong size.
- The largest of `HEADSHOT_WIDTHS` is the floor for `MASTER_WIDTH` in
  `tools/build-headshots.mjs`, so a fallback copy is never smaller than the
  srcset candidate it stands in for.

Cloudflare's ceiling for a transform source is 100 MB, 100 MP and 12,000 px on
a side; these sit well inside all three (10 MB, 21 MP, 5,949 px), and the
Workers per-asset limit of 25 MiB has similar room.

**No Cloudflare setup was needed.** Image Transformations are already enabled
on the `cloudkid.link` zone — that is what serves the wedding gallery — and
`tygerberg-sda.cloudkid.link` is on the same zone. `/cdn-cgi/*` is handled by
Cloudflare before a request reaches the Worker, so `src/worker/index.ts`
neither sees nor routes these.

### Deciding whether the transformer is there

The originals are far too heavy to send to a browser, so the site never guesses
about this. Two mechanisms, in order:

1. **A build-time flag** for an environment known to have no transformer. The
   devtest Pages workflow sets `PUBLIC_IMAGE_CDN=false`, because `/cdn-cgi/*`
   is a plain 404 on GitHub Pages. That skips step 2 entirely and renders the
   fallback copies from the start.
2. **A runtime probe.** On hydration the carousel sends one `HEAD` to a
   `/cdn-cgi/image/...` URL and waits for a `2xx` with an `image/*`
   content-type. The URL it probes is already in the first card's `srcset`, so
   the check costs no bytes (empty `HEAD` body) and no extra billable
   transformation. One probe per page load, shared by every card.

Until the probe answers, the cards render transform URLs — which is what the
server-rendered HTML contains, so hydration matches and the visible images are
already in flight. If the answer is "no", every card that has not started
loading switches to its fallback copy without ever requesting a transform.
Individually, a card whose transform fails also drops to its own fallback.

There is deliberately no `onerror=redirect` on the transform URLs: that option
hands the visitor the transform's *source*, which here is the multi-megabyte
original — the one thing that must not happen.

### Adding a photo

1. Put the original in `public/images/hod/`.
2. Run `node tools/build-headshots.mjs` to build its fallback copy.
3. Set `photo` on that person in `src/data/departmentHeads.ts` — just the
   filename, e.g. `TG-DH-Jaco.jpg`; both paths are derived from it.

Commit the generated file in `public/images/hod/fallback/` along with the
change. Note that `public/` is publicly reachable, so a photo lands on a real
URL the moment it is committed, whether or not a card points at it.

## Findability

`src/layouts/Layout.astro` emits a canonical URL, Open Graph and Twitter Card
tags, and a `Church` JSON-LD block built by `src/lib/structuredData.ts` from
`src/data/site.ts`. `astro.config.mjs`'s `site` is the single source for the
production origin; change it there and canonical tags, OG URLs and the sitemap
all follow.

Two things worth knowing:

- **The sitemap is not advertised.** Cloudflare serves a managed `robots.txt`
  on this zone and it carries no `Sitemap:` directive, so `/sitemap.xml` has to
  be submitted once in [Google Search Console](https://search.google.com/search-console)
  before it does anything. This is a manual step nobody will be prompted for.
- **The devtest preview is publicly crawlable** and `robots.txt` cannot cover
  it — that file is only honoured at a domain root, and the root there belongs
  to `github.io`. The Pages workflow sets `PUBLIC_INDEXABLE=false`, which emits
  `noindex,nofollow`, and canonical tags on that build point at production. Both
  exist to stop the preview competing with the real site in search results.

## Known open items (carried over from the design handoff)

These were explicitly flagged as unresolved by the church board in the
original handoff and are **not** blockers for this MVP:

1. **Department head photos** — partly resolved: 11 of the 21 cards now carry
   a studio headshot (see "Department head photos" above for how to add the
   rest). Two things still need the board:

   - Headshots for the remaining 10 — Arnold Neuhoff, Lisa Branders, Morné
     Louw, Adéle Meyer, Chris Meyer, Gert Coetzee, Peter Wallace, Sanet
     Stevens, Bertie Hoffman and the Louw family.
   - **Laura's surname.** She chairs the Persoonlike Bedieningkomitee &
     Evangelisasie and now has a card, but the board supplied the portfolio
     without a full name, so the card reads just "Laura" — the only
     single-name entry other than "Louw Familie". Her card also fills a gap in
     the Ampsdraers 2025/2026 roster, which records Personal Ministries only
     as one of the elder's titles and lists no chair for the committee itself;
     worth confirming the roster is what needs updating rather than the site.
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
6. **"Your first visit" answers** — the section is built
   (`src/components/react/FirstVisit.tsx`) and hides itself while
   `homeCopy.firstVisit` is empty, which it currently is. Nothing here is
   invented; the board needs to answer, in both languages:

   - Where do visitors park?
   - Is there a children's programme, and for what ages?
   - Is the building wheelchair accessible?
   - What do people usually wear?
   - Are services in Afrikaans, English, or both?

   Adding entries to `firstVisit` in `src/data/homeCopy.ts` publishes the
   section; no component change needed.
7. **Sitemap submission** — `/sitemap.xml` exists but nothing points crawlers
   at it (see "Findability"). Someone with access needs to submit it once in
   Google Search Console.
8. **A photograph for the social card** — `public/og-image.png` is currently a
   typographic card composed from the symbol and the design tokens. A photo of
   the building or the congregation would be better and is a one-file swap
   (`tools/README.md`).
