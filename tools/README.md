# tools/

Authoring helpers. Nothing here runs during `npm run build` or on deploy — these
are one-off scripts whose *output* is committed.

## build-headshots.mjs

Turns the studio originals of the department heads into the web masters the
site serves:

```sh
node tools/build-headshots.mjs
```

`src/images/TG-DH-*.jpg` (~20 MP, 7-10 MB) → `public/images/hod/TG-DH-*.jpg`
(1400px wide, ~200 kB, EXIF stripped). Cloudflare resizes those again per
viewport at the edge — see "Department head photos" in the root README for the
whole picture, including why the originals are not served directly.

Unlike `og-image.html` below, this needs no extra install: `sharp` comes in
with Astro's own dependencies, so `npm ci` is enough. If that ever stops being
true, `npm i sharp` in a scratch directory outside the repo and run it from
there.

Which files it builds is an explicit list at the top of the script rather than
a glob over `src/images/`, so a photo of someone nobody has identified yet
cannot reach a public URL by accident. Add the filename, re-run, and commit
the output.

## og-image.html

Source for `public/og-image.png` (1200×630, the social card) and
`public/apple-touch-icon.png` (180×180).

Rendered by hand rather than generated at build time: the card changes roughly
never, and generating it per build would mean adding an image pipeline and its
dependencies to a project that deliberately runs five.

### Regenerating

Needs Playwright and a Chromium; neither is a project dependency, so install
them somewhere outside the repo.

```sh
npm i playwright            # in a scratch directory, not this repo
npx playwright install chromium
```

The template references Newsreader and Public Sans. A headless browser with no
network access renders them as fallback serif/sans, which looks wrong, so the
fonts have to be inlined first — fetch the Google Fonts CSS, replace each
`https://fonts.gstatic.com/...woff2` URL with a `data:font/woff2;base64,...`
equivalent, and substitute the result for the `<!-- FONT_CSS -->` comment.

Then screenshot at exactly 1200×630 with `deviceScaleFactor: 1`, waiting on
`document.fonts.status === 'loaded'` before capturing.

### Replacing it with a photograph

A photo of the building or the congregation would be better than a composed
card, and swapping one in needs no code change — drop a 1200×630 image at
`public/og-image.png`. The dimensions are declared in
`src/layouts/Layout.astro` (`og:image:width` / `og:image:height`); change them
there if the replacement is a different size, and update `og:image:alt` to
describe what the photo actually shows.
