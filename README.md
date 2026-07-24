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

## Known open items (carried over from the design handoff)

These were explicitly flagged as unresolved by the church board in the
original handoff and are **not** blockers for this MVP:

1. **Department head names + photos** — placeholders (`[Naam 1]`…`[Naam 6]`)
   in `src/data/departmentHeads.ts`; swap in real `name`/`photoUrl` per person
   once supplied.
2. **"Get involved" contacts** — Connect / Bible Studies / Give cards all
   currently link back to their own section; real contact methods (form,
   email, phone, giving-platform link) are TBA.
3. **Live-stream detection** — `/api/live-status` (see `src/worker/`) is
   wired for the YouTube Data API but needs a `YOUTUBE_API_KEY` +
   `YOUTUBE_CHANNEL_ID` to use it; otherwise it's a manual flag.
4. **Weekly ministry schedule** — currently 4 fixed entries in
   `homeCopy.ts`; move to a CMS/KV-backed endpoint if it starts changing
   seasonally (the Worker is already the natural place to add that route).
5. **Mobile hamburger nav** — header nav still wraps via flexbox on narrow
   widths rather than collapsing behind a menu button, matching the original
   design handoff's noted gap.
