# Setup Instructions

Everything needed to take this repository from nothing to a working
deployment: GitHub, Cloudflare, Google Cloud, and the contact webhook.

This is the *initial setup* guide. Day-to-day facts about how the site works
(the LIVE badge's quota window, the contact form's `outcome` codes, the
branch strategy) live in [`README.md`](./README.md) — this document tells you
which buttons to press, once.

**Nothing in here contains a real secret value.** Every key, token and ID is
written as a placeholder. Fill them in directly in the GitHub and Cloudflare
dashboards; never commit them to the repository.

---

## 0. What you need before you start

| Thing | Why | Notes |
|---|---|---|
| **GitHub account** with admin on the repo | Pages, Actions secrets, branch rules | Admin is required — Settings pages are hidden otherwise |
| **Cloudflare account** | Hosts the Worker and the live site | Free plan is enough |
| **A domain in that Cloudflare account** | The production URL | Currently `cloudkid.link`, serving `tygerberg-sda.cloudkid.link` |
| **Google account** | YouTube Data API key for the LIVE badge | Optional — everything else works without it |
| **Somewhere to receive form submissions** | The contact form's destination | Zapier / Make / Apps Script / n8n / any JSON webhook |
| **Node 24 LTS + git** | Local development only | Version is pinned in `.nvmrc` |

The site degrades honestly when a piece is missing: no YouTube key means the
LIVE badge simply never appears, and no contact webhook means the request
forms say so instead of silently dropping people's messages. You can set this
up in stages.

---

## 1. Local development

```sh
nvm use            # picks up Node 24 from .nvmrc
npm install
npm run dev        # http://localhost:4321
```

`npm run dev` runs Astro alone, so the `/api/*` routes don't exist and any
call to them 404s. That's harmless — the LIVE badge stays hidden and the
contact form reports a network error.

To run the site the way production actually serves it (static assets **plus**
the Worker), use Wrangler:

```sh
npm run worker:dev     # builds, then wrangler dev on http://localhost:8788
```

For local secrets, copy the example file — `.dev.vars` is gitignored, so it
never leaves your machine:

```sh
cp .dev.vars.example .dev.vars
```

```ini
# .dev.vars
YOUTUBE_API_KEY="<your-key>"
YOUTUBE_CHANNEL_ID="UCtZlioPBBORWMMMSJ9BE1Wg"
CONTACT_WEBHOOK_URL="https://<your-webhook>"
```

Two local-testing tips:

- Widening `LIVE_CHECK_CRON` to `* * * * *` in `.dev.vars` saves waiting
  until Saturday morning to see the LIVE badge work.
- To test the contact form without a real webhook, point
  `CONTACT_WEBHOOK_URL` at any local server that returns `200` and log what
  it receives.

---

## 2. GitHub setup

### 2.1 Branches

Two long-lived branches, and the workflows key off them:

| Branch | Role | Deploys to |
|---|---|---|
| `dev` | Integration. Feature PRs target this. | GitHub Pages devtest preview |
| `main` | Production. Only moves via a reviewed `dev` → `main` promotion PR. | Cloudflare (the live site) |

Create them if they don't exist, and set **`dev` as the repository's default
branch** (Settings → General → Default branch) so new PRs target it
automatically.

### 2.2 Enable GitHub Pages

Settings → **Pages** → *Build and deployment* → **Source: GitHub Actions**.

Do this before the first `dev` push, or the devtest workflow fails at its
deploy step with a "Pages is not enabled" error. Nothing else on the Pages
screen needs changing — the workflow supplies the artifact.

### 2.3 Add the Actions secrets

Settings → **Secrets and variables → Actions** → *New repository secret*.
Both are needed only by the production workflow:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The API token from step 3.2 |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID from step 3.1 |

> These are **build-time** credentials for deploying. They are *not* how the
> Worker gets its own secrets — see step 4, and the warning there.

### 2.4 Branch protection (recommended)

Settings → **Rules → Rulesets** (or Branches → Protection rules) on `main`:

- Require a pull request before merging
- Require the *Deploy production (Cloudflare)* check where you want it
- Disallow force pushes

The point is that production only ever moves through a reviewed promotion PR,
which is the whole reason `main` is separate from `dev`.

### 2.5 The two workflows

Both live in `.github/workflows/` and read the Node version from `.nvmrc`, so
bumping that file is enough to move CI to a newer Node LTS.

| Workflow | Trigger | What it does |
|---|---|---|
| `deploy-devtest-pages.yml` | push to `dev`, or manual | Static preview on GitHub Pages. No secrets needed. Builds with `ASTRO_BASE=/<repo-name>/` (Pages project sites serve from a subpath) and `PUBLIC_HAS_API=false` (no Worker here). |
| `deploy-production-cloudflare.yml` | push to `main`, or manual | The real site: static assets + Worker + `/api/*`. |

Both also expose **`workflow_dispatch`**, so you can re-run either from the
Actions tab without pushing a new commit — useful for redeploying after
changing a Worker secret, and for previewing a feature branch on devtest
without merging it. Keep that trigger in place.

---

## 3. Cloudflare setup

### 3.1 Find your account ID

Cloudflare dashboard → **Workers & Pages**. The account ID is in the right-hand
sidebar (and in the URL: `dash.cloudflare.com/<account-id>/...`). Copy it into
the `CLOUDFLARE_ACCOUNT_ID` GitHub secret from step 2.3.

### 3.2 Create the API token

**My Profile → API Tokens → Create Token.**

The quickest correct route is the **"Edit Cloudflare Workers"** template. If
you build a custom token instead, it needs:

| Scope | Permission |
|---|---|
| Account → Workers Scripts | **Edit** |
| Account → Account Settings | **Read** |
| Zone → Workers Routes | **Edit** (for the custom domain) |
| Zone → DNS | **Edit** (so `wrangler deploy` can attach the domain) |

Scope it to the one account and the one zone rather than "all accounts".

Copy the token **immediately** — Cloudflare shows it exactly once — into the
`CLOUDFLARE_API_TOKEN` GitHub secret.

### 3.3 The Worker itself

You do **not** create the Worker by hand. `wrangler deploy` creates it on the
first run from `wrangler.jsonc`, which already pins:

- **name** — `tygerberg-sda-website`
- **main** — `src/worker/index.ts`
- **assets** — the Astro build in `./dist`, bound as `ASSETS`
- **vars** — `LIVE_CHECK_CRON`, `LIVE_CHECK_TZ` (non-secret, safe in git)
- **routes** — `tygerberg-sda.cloudkid.link` as a `custom_domain`

Because the zone already lives in the same Cloudflare account, that route is
provisioned and attached automatically on deploy — there's no separate DNS
record to add. To use a different domain, change the `routes` entry, make sure
that zone is in the same account, and redeploy.

### 3.4 First deploy

Easiest path is to merge to `main` and let the workflow run. To deploy from
your machine instead:

```sh
npx wrangler login
npm run deploy        # astro build && wrangler deploy
```

---

## 4. Worker secrets

> **These must be Worker secrets, not GitHub Actions secrets.** Actions
> secrets exist only at build time and would never reach the running Worker.
> Worse, exposing an API key to the client build would publish it to anyone
> who views source.

Set them in the Cloudflare dashboard — **Workers & Pages →
`tygerberg-sda-website` → Settings → Variables and Secrets** — or from the CLI:

```sh
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put YOUTUBE_CHANNEL_ID
npx wrangler secret put CONTACT_WEBHOOK_URL
```

| Secret | Required for | Value |
|---|---|---|
| `YOUTUBE_API_KEY` | LIVE badge | A Google Cloud API key with YouTube Data API v3 enabled (step 5) |
| `YOUTUBE_CHANNEL_ID` | LIVE badge | `UCtZlioPBBORWMMMSJ9BE1Wg` |
| `CONTACT_WEBHOOK_URL` | Contact form | Where submissions are delivered (step 6) |

Secrets take effect on the next deploy. After changing one, re-run the
production workflow from the Actions tab (`workflow_dispatch`) or run
`npm run deploy`.

**If a key is ever exposed** — pasted into a chat, committed, screenshotted —
treat it as burned: delete it in Google Cloud, create a fresh one, and
`wrangler secret put` the new value. Rotating is a two-minute job; a leaked
key on someone else's quota is not.

---

## 5. Google Cloud (YouTube API key)

Only needed for the LIVE badge. Skip it and the badge simply never shows —
the video embed on the homepage works without any key, because it always
embeds the channel's auto-generated uploads playlist.

1. [Google Cloud Console](https://console.cloud.google.com/) → create a
   project (e.g. *Tygerberg SDA Website*).
2. **APIs & Services → Library** → find **YouTube Data API v3** → **Enable**.
3. **APIs & Services → Credentials** → *Create credentials* → **API key**.
4. **Restrict the key** (do not skip this):
   - *API restrictions* → **Restrict key** → YouTube Data API v3 only.
   - *Application restrictions* → **None**. The key is used from the Worker,
     server-side; an HTTP-referrer restriction would block it, since there's
     no browser referrer on a Worker's outbound request.
5. Put the key in the `YOUTUBE_API_KEY` Worker secret (step 4).

**Watch the quota.** `search.list` costs 100 units against a 10,000/day
default, and there's no server-side caching by design, so cost scales with
concurrent viewers rather than with time. The Saturday-morning window in
`wrangler.jsonc` is what keeps this affordable — see the README's LIVE badge
section before widening it.

---

## 6. The contact webhook

`/verbind` and `/bybelstudies` post to `/api/contact`, which forwards each
validated submission as JSON to `CONTACT_WEBHOOK_URL`. Any endpoint that
accepts a JSON `POST` works, which keeps the church off any single vendor.

Common choices: a **Zapier** catch hook, a **Make** custom webhook, a **Google
Apps Script** web app, or a self-hosted **n8n** webhook — each of which can
turn the payload into an email to the right person.

The payload delivered to your webhook looks like this:

```json
{
  "topic": "bible-study",
  "name": "Jan Bybel",
  "email": "jan@example.co.za",
  "phone": "021 555 0100",
  "message": "Ek wil graag ’n studie aanvra.",
  "submittedAt": "2026-07-27T18:30:42.804Z",
  "consent": true,
  "source": "tygerberg-sda-website"
}
```

- `topic` is either `connect` (general enquiry, from `/verbind`) or
  `bible-study` (from `/bybelstudies`) — use it to route to the right person.
- Exactly one of `email` / `phone` is guaranteed non-empty; the other may be
  an empty string. The form asks for the minimum needed to reply.
- `consent` and `submittedAt` are recorded because POPIA consent has to be
  demonstrable after the fact, and your inbox is the only place the
  submission survives. **Keep them.**

Whoever receives these is handling personal information: route them to a
shared church inbox rather than an individual's personal address, and delete
them once the request is dealt with.

Until `CONTACT_WEBHOOK_URL` is set, the endpoint answers `not-configured` and
the form tells visitors it isn't live yet rather than pretending a message was
sent.

---

## 7. Verifying the setup

After the first production deploy:

```sh
# Worker is serving and the LIVE-badge window resolves
curl https://tygerberg-sda.cloudkid.link/api/live-status

# Contact route rejects a submission with no consent (should be 400)
curl -i -X POST https://tygerberg-sda.cloudkid.link/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"topic":"connect","name":"Test","email":"test@example.com"}'
```

A green setup looks like:

- [ ] `https://tygerberg-sda.cloudkid.link` loads the homepage
- [ ] `/api/live-status` returns JSON with a `source` field — `outside-window`
      on most days is correct, not an error
- [ ] `/verbind` and `/bybelstudies` load and show the form
- [ ] Submitting a real request lands in the church inbox
- [ ] The devtest Pages URL loads, with the form shown read-only behind its
      preview notice (expected — no Worker there)

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Devtest deploy fails on "Get Pages site" | Pages source isn't GitHub Actions | Step 2.2 |
| Devtest CSS/links 404 under a subpath | `ASTRO_BASE` not applied | The workflow sets it; only an issue when building Pages by hand |
| Production deploy fails with a 10000/authentication error | Token lacks scope, or wrong account ID | Recreate the token per step 3.2 |
| `/api/*` 404s in production | Worker didn't deploy, or the route isn't attached | Check the Actions run, then the Worker's Triggers tab |
| LIVE badge never shows | Missing/invalid key, or outside the window | `curl /api/live-status` and read `source` |
| `/api/live-status` says `not-configured` | Secrets missing on the Worker | Step 4 — and check they weren't added as Actions secrets by mistake |
| `/api/live-status` says `invalid-schedule` | Malformed cron or unknown timezone in `wrangler.jsonc` | Fails closed and spends no quota; fix the expression and redeploy |
| Contact form says it isn't live yet | `CONTACT_WEBHOOK_URL` unset | Step 6, then redeploy |
| Contact form reports a send failure | Webhook timed out or returned non-2xx | Check the webhook; the Worker waits 10s |
| A secret change had no effect | Secrets apply at deploy time | Re-run the production workflow, or `npm run deploy` |
