/**
 * Cloudflare Image Transformations, in the shape used by
 * wedding.cloudkid.link (`wedding-site-worker/src/_helpers.ts` in the
 * cloudkid-link repo): one full-size image on the origin, and every size the
 * browser actually downloads produced at the edge from a `/cdn-cgi/image/...`
 * URL, picked per viewport by the browser's own `srcset`/`sizes` resolution.
 *
 * This zone (cloudkid.link) already has transformations enabled — that is what
 * serves the wedding gallery — so `tygerberg-sda.cloudkid.link` inherits them
 * with no dashboard change.
 *
 * `/cdn-cgi/*` is handled by Cloudflare before a request ever reaches the
 * Worker, so `src/worker/index.ts` neither sees nor needs to route these.
 *
 * Two things guard the case where that machinery is not there, because the
 * source images are ~8 MB each and are never an acceptable thing to serve:
 * a build-time flag (IMAGE_CDN_ENABLED) for environments known not to have a
 * transformer, and a runtime probe (probeImageCdn) for everywhere else. Both
 * land on the pre-resized copies under `fallback/`.
 */
import { withBase } from './base';

/**
 * `format=auto` negotiates AVIF/WebP/JPEG off the request's `Accept` header;
 * `fit=scale-down` resizes without cropping or upscaling, leaving the framing
 * to CSS (see AboutCarousel's photo box).
 *
 * Unique transformations are billed per source image per option set, so this
 * string is shared: adding a second variant of it doubles the count.
 */
export const IMAGE_TRANSFORM_OPTIONS = 'format=auto,quality=82,fit=scale-down';

/**
 * srcset candidates for a department-head card.
 *
 * The card is at most ~435 CSS px wide (at the top of the `sm` range — see
 * HEADSHOT_SIZES), so 1280 covers it to just under 3x. Keep this list short:
 * each width is a separately billed transformation per photo.
 *
 * The sources are the studio originals — ~3,500 x 5,300 — so any width here is
 * a genuine downscale. `fit=scale-down` never upscales, so a width beyond what
 * the original holds would silently return something smaller and still bill
 * for it; there is a lot of headroom before that matters.
 *
 * The largest entry is also the floor for MASTER_WIDTH in
 * tools/build-headshots.mjs, so a fallback copy is never smaller than the
 * candidate it stands in for.
 */
export const HEADSHOT_WIDTHS = [320, 480, 640, 960, 1280];

/**
 * What the browser needs to resolve HEADSHOT_WIDTHS: the card's rendered CSS
 * width at each breakpoint. This mirrors `CARD_WIDTH` in AboutCarousel.tsx
 * (`w-[72%] sm:w-[45%] lg:w-[31%]`) measured against the section's content box
 * (`max-w-content px-7` — capped at 1180px wide, less 56px of padding), so the
 * two must be changed together or every card downloads the wrong size.
 */
export const HEADSHOT_SIZES = [
  '(max-width: 639px) calc(72vw - 40px)',
  '(max-width: 1023px) calc(45vw - 25px)',
  '(max-width: 1179px) calc(31vw - 17px)',
  '348px',
].join(', ');

/**
 * Where the two copies of each headshot live. `photo` in departmentHeads.ts is
 * a bare filename so that both are derived from it and cannot drift apart.
 *
 * The original is the transform source and nothing else — no visitor should
 * ever be sent one. The fallback is a 1400px, ~200 kB copy built by
 * `tools/build-headshots.mjs`, and it is what gets served whenever the
 * transformer is not there to do the resizing.
 */
export const HEADSHOT_DIR = '/images/hod';
export const HEADSHOT_FALLBACK_DIR = `${HEADSHOT_DIR}/fallback`;

/** The transform source: full-size, only ever fetched by Cloudflare. */
export const headshotSource = (file: string) => `${HEADSHOT_DIR}/${file}`;

/** The pre-resized copy, as a URL a browser can use directly. */
export const headshotFallbackUrl = (file: string) => withBase(`${HEADSHOT_FALLBACK_DIR}/${file}`);

/**
 * A hard "there is no transformer here", known at build time.
 *
 * The devtest build on GitHub Pages has no Cloudflare in front of it, so
 * `/cdn-cgi/image/...` is a plain 404 there. The Pages workflow sets
 * PUBLIC_IMAGE_CDN=false, which skips the probe below entirely and goes
 * straight to the fallback copies — same reasoning as PUBLIC_HAS_API.
 */
export const IMAGE_CDN_ENABLED = import.meta.env.PUBLIC_IMAGE_CDN !== 'false';

/**
 * Deliberately no `onerror=redirect`.
 *
 * That option hands the visitor the transform's *source* when a transform
 * fails fatally — which here is the multi-megabyte original, the one thing
 * that must never reach a browser. The fallback copy is the better answer and
 * the component reaches it on its own, so the redirect is left off.
 */
export function cdnImageUrl(path: string, width: number): string {
  return `/cdn-cgi/image/${IMAGE_TRANSFORM_OPTIONS},width=${width}${withBase(path)}`;
}

export function cdnSrcset(path: string, widths: number[] = HEADSHOT_WIDTHS): string {
  return widths.map((w) => `${cdnImageUrl(path, w)} ${w}w`).join(', ');
}

export type ImageCdnStatus = 'unknown' | 'available' | 'unavailable';

/** One probe per page load, however many components ask for it. */
let inFlight: Promise<boolean> | null = null;

/**
 * Ask, once, whether the transformer is actually answering — so the cards can
 * commit to real transform URLs or to the fallback copies, rather than each
 * discovering the answer by failing.
 *
 * `HEAD`, and against a URL that is already in the `srcset`: the response body
 * is empty, and the variant is one Cloudflare would have generated anyway, so
 * the probe costs no bytes and no extra billable transformation. Verified live
 * that `/cdn-cgi/image/...` answers HEAD with `200` and an `image/*`
 * content-type, and that a path it cannot serve is a `404` — hence checking
 * both, since a 404 page is a perfectly successful `fetch`.
 */
export function probeImageCdn(sampleUrl: string): Promise<boolean> {
  if (!IMAGE_CDN_ENABLED) return Promise.resolve(false);
  inFlight ??= fetch(sampleUrl, { method: 'HEAD' })
    .then((res) => res.ok && (res.headers.get('content-type') ?? '').startsWith('image/'))
    // A network error is indistinguishable from a missing transformer, and the
    // answer is the same either way: use the copies we know exist.
    .catch(() => false);
  return inFlight;
}
