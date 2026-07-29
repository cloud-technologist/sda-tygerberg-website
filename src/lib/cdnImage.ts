/**
 * Cloudflare Image Transformations, in the shape used by
 * wedding.cloudkid.link (`wedding-site-worker/src/_helpers.ts` in the
 * cloudkid-link repo): one master image on the origin, and every size the
 * browser actually downloads produced at the edge from a `/cdn-cgi/image/...`
 * URL, picked per viewport by the browser's own `srcset`/`sizes` resolution.
 *
 * This zone (cloudkid.link) already has transformations enabled — that is what
 * serves the wedding gallery — so `tygerberg-sda.cloudkid.link` inherits them
 * with no dashboard change.
 *
 * `/cdn-cgi/*` is handled by Cloudflare before a request ever reaches the
 * Worker, so `src/worker/index.ts` neither sees nor needs to route these.
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
 * The largest entry must stay <= the master width in tools/build-headshots.mjs.
 * `fit=scale-down` never upscales, so asking for more than the master has just
 * returns the master — silently, and still billed.
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
 * The devtest build on GitHub Pages has no Cloudflare in front of it, so
 * `/cdn-cgi/image/...` is a plain 404 there and every card would fall back an
 * image at a time. The Pages workflow sets PUBLIC_IMAGE_CDN=false and the
 * masters are served directly instead — same reasoning as PUBLIC_HAS_API.
 */
export const IMAGE_CDN_ENABLED = import.meta.env.PUBLIC_IMAGE_CDN !== 'false';

/**
 * `onerror=redirect` hands the visitor the untransformed source if a transform
 * fails outright. It only works when the source is on the same zone, which is
 * why the masters are served from this site rather than hotlinked.
 */
export function cdnImageUrl(path: string, width: number): string {
  return `/cdn-cgi/image/${IMAGE_TRANSFORM_OPTIONS},width=${width},onerror=redirect${withBase(path)}`;
}

export function cdnSrcset(path: string, widths: number[] = HEADSHOT_WIDTHS): string {
  return widths.map((w) => `${cdnImageUrl(path, w)} ${w}w`).join(', ');
}
