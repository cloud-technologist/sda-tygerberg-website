#!/usr/bin/env node
/**
 * Derives the web copies of the department-head headshots.
 *
 *   src/images/TG-DH-*.jpg   ->   public/images/hod/TG-DH-*.jpg
 *
 * The originals are ~20 megapixel, 8-10 MB studio files: the archive copies,
 * kept in `src/` because nothing in `src/` is served. Only `public/` ships, so
 * the web copies go there and everything the browser actually receives is
 * resized again from these by Cloudflare at the edge (see src/lib/cdnImage.ts).
 *
 * Why not hand the 20 MP originals straight to the transformer, which would
 * happily resize them?
 *
 *   - Every deploy would upload ~90 MB of assets, and each cold transform would
 *     pull a 8 MB master through the edge.
 *   - `onerror=redirect` sends the visitor to the *source* URL when a transform
 *     fails, and Cloudflare explicitly advises against that when the source is
 *     very large. The same is true of the `<img>` onError fallback and of the
 *     devtest build, where there is no transformer at all.
 *
 * Sizing: MASTER_WIDTH must stay >= the largest entry in HEADSHOT_WIDTHS
 * (src/lib/cdnImage.ts). `fit=scale-down` never upscales, so a master narrower
 * than the widest srcset candidate would silently serve a too-small image to
 * high-DPR screens.
 *
 * Nothing here runs during `npm run build` or on deploy — like the rest of
 * `tools/`, this is a one-off whose output is committed. Re-run it only when a
 * headshot is replaced or MASTER_WIDTH changes:
 *
 *   node tools/build-headshots.mjs
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(REPO, 'src/images');
const OUT_DIR = path.join(REPO, 'public/images/hod');

/** Headroom over the 1280 top of HEADSHOT_WIDTHS. */
const MASTER_WIDTH = 1400;
const QUALITY = 82;

/**
 * Built by name rather than by globbing `src/images`, so a photo of someone
 * nobody has identified yet cannot be published to a public URL by accident.
 *
 * Deliberately not in this list:
 *   TG-DH-Laura.jpg — no "Laura" on the board's Ampsdraers 2025/2026 roster
 *   (src/data/departmentHeads.ts), so there is no card for this photo to go on.
 *   Add the line once the board confirms who it is.
 */
const HEADSHOTS = [
  'TG-DH-Graig.jpg',
  'TG-DH-Gustav.jpg',
  'TG-DH-Hanlie.jpg',
  'TG-DH-Jaco.jpg',
  'TG-DH-Lenie.jpg',
  'TG-DH-Leonie.jpg',
  'TG-DH-Linda.jpg',
  'TG-DH-Marinda.jpg',
  'TG-DH-Marius.jpg',
  'TG-DH-Monique.jpg',
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

await mkdir(OUT_DIR, { recursive: true });

const present = new Set(await readdir(SRC_DIR));
const missing = HEADSHOTS.filter((name) => !present.has(name));
if (missing.length) {
  console.error(`Missing from src/images: ${missing.join(', ')}`);
  process.exitCode = 1;
}

for (const name of HEADSHOTS.filter((n) => present.has(n))) {
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
