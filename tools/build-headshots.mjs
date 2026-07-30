#!/usr/bin/env node
/**
 * Builds the fallback copies of the department-head headshots.
 *
 *   public/images/hod/TG-DH-*.jpg   ->   public/images/hod/fallback/TG-DH-*.jpg
 *
 * The originals are what Cloudflare transforms, and in the normal case they are
 * the only copy that matters — no visitor ever receives one, because every size
 * a browser asks for is made at the edge (see src/lib/cdnImage.ts).
 *
 * These are for when that does not happen. Without a transformer there is
 * nothing between the visitor and a ~20 megapixel, 8 MB studio file, and the
 * carousel would hand them ten of those. So each original also gets a 1400px,
 * ~200 kB copy here, and the component serves those instead whenever the
 * transformer is unreachable — the devtest build on GitHub Pages, an
 * unavailable /cdn-cgi/image, or a single transform that fails.
 *
 * Only the fallbacks are resized here. Nothing resizes the originals, and
 * nothing should: MASTER_WIDTH exists to bound the fallback, not the site.
 * Keep it >= the largest entry in HEADSHOT_WIDTHS (src/lib/cdnImage.ts) so a
 * fallback is never smaller than a real srcset candidate would have been.
 *
 * Nothing here runs during `npm run build` or on deploy — like the rest of
 * `tools/`, this is a one-off whose output is committed. Re-run it whenever a
 * headshot is added or replaced:
 *
 *   node tools/build-headshots.mjs
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(REPO, 'public/images/hod');
const OUT_DIR = path.join(SRC_DIR, 'fallback');

/** Headroom over the 1280 top of HEADSHOT_WIDTHS. */
const MASTER_WIDTH = 1400;
const QUALITY = 82;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

await mkdir(OUT_DIR, { recursive: true });

// Every original in the directory, which is every photo already published —
// `public/` is a live URL whether or not a card points at one, so there is
// nothing here that a fallback would expose for the first time. `withFileTypes`
// keeps this from recursing into its own output.
const originals = (await readdir(SRC_DIR, { withFileTypes: true }))
  .filter((e) => e.isFile() && /\.jpe?g$/i.test(e.name))
  .map((e) => e.name)
  .sort();

if (!originals.length) {
  console.error(`No headshots found in ${path.relative(REPO, SRC_DIR)}`);
  process.exitCode = 1;
}

for (const name of originals) {
  const from = path.join(SRC_DIR, name);
  const to = path.join(OUT_DIR, name);

  // `.rotate()` with no argument applies the EXIF orientation before the
  // resize, so a camera-rotated original cannot come out sideways. Sharp then
  // drops EXIF and the ICC profile, which is both a size win and strips the
  // camera/location metadata the originals carry. Safe to strip rather than
  // convert here: the originals are already sRGB IEC61966-2.1.
  const { size } = await sharp(from)
    .rotate()
    .resize({ width: MASTER_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toFile(to);

  const before = (await stat(from)).size;
  console.log(`${name.padEnd(22)} ${kb(before).padStart(8)} -> ${kb(size).padStart(7)}`);
}
