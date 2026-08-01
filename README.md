# Tygerberg SDA Church Website

Bilingual (Afrikaans/English) site for Tygerberg Seventh-day Adventist Church
(Boston, Bellville, Cape Town). Astro static output + React islands, served by a
Cloudflare Worker at `tygerberg-sda.cloudkid.link`.

- **How to run, deploy and maintain it** — this file.
- **Why the code is shaped the way it is, and what breaks if you change it
  back** — [`CONCERNS.md`](./CONCERNS.md). Code carries `C-NN` references into it.
- **First-time setup from scratch** — [`SETUP-INSTRUCTIONS.md`](./SETUP-INSTRUCTIONS.md).

Astro (static) · React islands · Tailwind v4 (tokens in `src/styles/global.css`)
· TypeScript · Cloudflare Workers via Wrangler · Node 24 LTS (`.nvmrc`).

## Commands

```sh
nvm use && npm install

npm run dev          # Astro dev server, http://localhost:4321
npm run build        # static build into dist/
npm run worker:dev   # build, then wrangler dev — Worker + /api/* locally
npm run deploy       # build, then wrangler deploy
npx tsc --noEmit     # typecheck
```

`/api/*` exists only under `worker:dev` or a real deploy. For the LIVE badge
locally, copy `.dev.vars.example` to `.dev.vars` (gitignored), add a YouTube key,
and widen `LIVE_CHECK_CRON` to `* * * * *` so you needn't wait for Saturday.

## Configuration

**Worker secrets** — dashboard → Workers & Pages → `tygerberg-sda-website` →
Settings → Variables and Secrets, or `wrangler secret put`. Must be Worker
secrets, not Actions or build-time variables ([C-18](./CONCERNS.md#c-18--the-api-key-must-be-a-worker-secret-never-a-build-time-variable)):

| Secret | Purpose | Unset behaviour |
|---|---|---|
| `YOUTUBE_API_KEY` | Google Cloud key, YouTube Data API v3 enabled | LIVE badge stays hidden |
| `YOUTUBE_CHANNEL_ID` | `UCtZlioPBBORWMMMSJ9BE1Wg` | as above |
| `CONTACT_WEBHOOK_URL` | Where `/api/contact` forwards; any JSON POST endpoint | form reports `not-configured` |

The two YouTube values may be stored as repo secrets instead — the production
workflow uploads them — but remove one from repo settings without removing it
from the workflow and an empty value gets uploaded.

**Worker vars** — `wrangler.jsonc`, edit and redeploy, no code change:

| Var | Default | Meaning |
|---|---|---|
| `LIVE_CHECK_CRON` | `* 9-12 * * 6` | When the LIVE badge may spend quota, read as a *window*. Saturdays 09:00–12:59, covering the 09:00–12:30 stream. **Keep the minute field `*`** ([C-14](./CONCERNS.md#c-14--live_check_cron-is-a-window-not-a-schedule)). |
| `LIVE_CHECK_TZ` | `Africa/Johannesburg` | Timezone the window is evaluated in |

**Build-time env vars** — set by the workflows; unset means "on":

| Var | Effect when set |
|---|---|
| `ASTRO_BASE` | Serve under a subpath, e.g. `/sda-tygerberg-website/` |
| `PUBLIC_HAS_API=false` | Skip the live-status poll; contact form read-only |
| `PUBLIC_INDEXABLE=false` | Emit `noindex,nofollow` |
| `PUBLIC_IMAGE_CDN=false` | Serve the fallback headshots, skip the transformer probe |

## Branch strategy and CI/CD

- **`dev`** — integration. Feature PRs target `dev`; each merge deploys the
  GitHub Pages preview.
- **`main`** — production. Moves only via a reviewed `dev` → `main` promotion PR;
  merging deploys to Cloudflare.

| Workflow | Target | Trigger | Build env |
|---|---|---|---|
| `deploy-devtest-pages.yml` | GitHub Pages | push to `dev`, manual | `ASTRO_BASE`, `PUBLIC_HAS_API=false`, `PUBLIC_INDEXABLE=false`, `PUBLIC_IMAGE_CDN=false` |
| `deploy-production-cloudflare.yml` | Cloudflare Workers | push to `main`, manual | — |

Both read the Node version from `.nvmrc`. One-time setup: Settings → Pages →
Source = **GitHub Actions**; repo secrets `CLOUDFLARE_API_TOKEN` (Workers
Scripts + Account Settings: Edit) and `CLOUDFLARE_ACCOUNT_ID`. The custom domain
attaches itself on deploy via `routes` in `wrangler.jsonc`.

The Pages preview has no Worker and no image transformer — see
[C-22](./CONCERNS.md#c-22--the-devtest-build-has-no-worker-and-no-transformer).

## Diagnostics

`curl https://tygerberg-sda.cloudkid.link/api/live-status` returns the resolved
window and a `source`:

| `source` | Meaning |
|---|---|
| `youtube-api` | Checked live |
| `outside-window` | Outside `LIVE_CHECK_CRON`; no API call made |
| `not-configured` | Secrets missing |
| `invalid-schedule` | Bad cron or timezone — fails closed, zero API calls |
| `api-error` | YouTube refused; usually exhausted quota ([C-16](./CONCERNS.md#c-16--one-upstream-verdict-is-shared-or-quota-scales-with-viewers)) |

It also returns `cached`. `true` means the YouTube answer behind this verdict
came from the shared edge entry rather than a fresh call, so it is at most 60s
old. The window and credential checks always run fresh, so `cached` is only ever
`true` alongside `youtube-api` or `api-error` — never `outside-window`
([C-16](./CONCERNS.md#c-16--one-upstream-verdict-is-shared-or-quota-scales-with-viewers)).

The window is checked *before* credentials, so on any day but Saturday you get
`outside-window` whether or not secrets are set. To confirm secrets arrived,
check the deploy log's upload step rather than curling mid-week.

`POST /api/contact` returns an `outcome`: `forwarded`, `not-configured`,
`invalid` (with `errors` naming the fields), or `forward-error`.

`/api/contact` has no bot protection of its own and Cloudflare's is **off by
default** — [C-21](./CONCERNS.md#c-21--abuse-protection-is-cloudflares-and-it-is-off-by-default).

## Editing content

All copy and structured content is under `src/data/`, away from components:

| File | Holds |
|---|---|
| `site.ts` | Address, coordinates, external links, service times, building hours |
| `homeCopy.ts` | Homepage copy, weekly schedule, "your first visit" answers |
| `beliefsCopy.ts` | Beliefs-page header copy |
| `beliefs.ts` | All 28 Fundamental Beliefs, bilingual, in 6 categories |
| `departmentHeads.ts` | Carousel roster — 21 people, 11 with headshots |
| `requestCopy.ts` | `/connect` and `/bible-studies` copy, incl. POPIA wording |
| `resources.ts` | External resource links (logos in `public/logos/`) |
| `giving.ts` | EFT banking details |

No phone numbers or email addresses anywhere in content —
[C-20](./CONCERNS.md#c-20--popia-shapes-what-the-form-asks-and-what-it-stores).

The homepage video always embeds the channel's auto-generated uploads playlist,
newest-first, no API key. Which video plays never depends on `YOUTUBE_API_KEY`.

### Adding a department-head photo

1. Put the original in `public/images/hod/`.
2. `node tools/build-headshots.mjs` — builds its fallback copy.
3. Set `photo` on that person in `src/data/departmentHeads.ts`: filename only.

Commit the generated fallback too. `public/` is publicly reachable, so a photo
is on a live URL once committed, whether or not a card points at it.

### Icons and the social card

`src/assets/sda-symbol.svg` is the only copy of the artwork; `favicon.svg`,
`map-marker.svg`, `apple-touch-icon.png` and `og-image.png` are committed
derivations — see `tools/README.md` to regenerate. The mark may be recoloured
and nothing else ([C-25](./CONCERNS.md#c-25--the-sda-symbol-may-be-recoloured-and-nothing-else)).

## Findability

`src/layouts/Layout.astro` emits the canonical URL, Open Graph/Twitter tags and
a `Church` JSON-LD block. `site` in `astro.config.mjs` is the single source for
the production origin — change it there and canonicals, OG URLs and the sitemap
follow.

**`/sitemap.xml` is not advertised.** Cloudflare serves a managed `robots.txt`
with no `Sitemap:` directive, so it must be submitted once in
[Google Search Console](https://search.google.com/search-console). Nobody will
be prompted for this.

## Open items

Needs the church board:

1. **Headshots for 10 of the 21** — Arnold Neuhoff, Lisa Branders, Morné Louw,
   Adéle Meyer, Chris Meyer, Gert Coetzee, Peter Wallace, Sanet Stevens, Bertie
   Hoffman, the Louw family. **These ten are not on the site** — a card needs a
   photo to render ([C-29](./CONCERNS.md#c-29--a-head-without-a-headshot-is-not-rendered)),
   so the carousel currently shows 11. Note that the pastor is among the ten.
   Adding the file and a `photo:` line publishes each one.
2. **The Ampsdraers 2025/2026 roster is missing an entry** — Laura Rolff chairs
   the Persoonlike Bedieningkomitee & Evangelisasie and has a card here; the
   roster names no chair for it. The site is the more current of the two.
3. **Children's programme ages** — the answers are in and the section is live,
   but the board gave times (09:30–11:00) without an age range. Worth adding, so
   a parent knows whether it covers their child.
4. **Weekly ministry schedule** is 4 fixed entries in `homeCopy.ts`. Move to a
   KV/CMS-backed Worker route if it starts changing seasonally.
5. **A photograph for the social card** — `og-image.png` is a typographic card.
   One-file swap at 1200×630; dimensions are declared in `Layout.astro`.

Needs someone with access: **submit `/sitemap.xml`**, and set the Worker secrets
above.

Carrying known risk: **the map ships no tile attribution** —
[C-01](./CONCERNS.md#c-01--the-map-carries-no-tile-attribution).
