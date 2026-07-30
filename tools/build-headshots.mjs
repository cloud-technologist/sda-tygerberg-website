#!/usr/bin/env node
/**
 * Builds the fallback copies of the department-head headshots.
 *
 *   public/images/hod/TG-DH-*.jpg  ->  public/images/hod/fallback/TG-DH-*.jpg
 *
 * The originals are Cloudflare's transform source and nothing else; these are
 * what gets served when there is no transformer. Nothing resizes the originals.
 * CONCERNS.md C-02, C-04, C-07, C-09.
 *
 * Not part of `npm run build` — a one-off whose output is committed. Re-run
 * whenever a headshot is added or replaced:
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

/** Must stay >= the largest HEADSHOT_WIDTHS entry — C-04. */
const MASTER_WIDTH = 1400;

/** Higher than the transform's 82, deliberately — CONCERNS.md C-07. */
const QUALITY = 90;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

await mkdir(OUT_DIR, { recursive: true });

// Everything in the directory is already published (`public/` is a live URL
// either way). `withFileTypes` keeps this out of its own output directory.
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

  // `.rotate()` applies EXIF orientation before the resize. Sharp then drops
  // EXIF and the ICC profile — a size win, and it strips the camera/location
  // metadata. Safe to strip: the originals are already sRGB IEC61966-2.1.
  const { size } = await sharp(from)
    .rotate()
    .resize({ width: MASTER_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toFile(to);

  const before = (await stat(from)).size;
  console.log(`${name.padEnd(22)} ${kb(before).padStart(8)} -> ${kb(size).padStart(7)}`);
}
