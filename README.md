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

## Deployment (Cloudflare Workers)

```sh
npm run deploy     # astro build && wrangler deploy
```

This deploys the static site plus the Worker in `src/worker/` (configured in
`wrangler.jsonc`) under a single Cloudflare Workers project — static assets
are served via the `ASSETS` binding. `src/worker/index.ts` is currently a
thin passthrough with no active routes; it's the natural place to add a
future API layer (contact form, CMS-backed schedule data, etc.).

The homepage video always embeds the channel's auto-generated "uploads"
playlist (`SITE.youtubeUploadsEmbedUrl` in `src/data/site.ts`), which YouTube
keeps in newest-first order with zero maintenance and no API key/secrets
required — no live-detection polling is needed to show the latest video.

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
| `deploy-devtest-pages.yml` | GitHub Pages | push to `dev`, or manual | Free static preview, no secrets required. Built with `ASTRO_BASE=/<repo-name>/` since Pages project sites serve from a subpath. |
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
4. ~~**Mobile hamburger nav**~~ — resolved: below the `lg` breakpoint the
   header nav collapses behind a hamburger button (`src/components/react/Header.tsx`).
