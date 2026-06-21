// Pack extracted character frames (from extract-gif-frames.ps1) into per-animation
// spritesheets + a manifest.json the engine loads. One PNG per animation: rows =
// directions, cols = frames (transparent-padded). Computes the feet baseline (anchorY)
// from the idle/south frame so the sprite stands on the ground.
//
// Usage: node tools/pack-character.mjs <charName> [framesDir]
//   e.g. node tools/pack-character.mjs efe
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const char = process.argv[2] || 'efe';
const framesDir = process.argv[3] || join(process.env.TEMP || '/tmp', 'emi_frames', char);
const outDir = join(here, '..', 'src', 'sprites', char);

const DIRS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
const index = JSON.parse(readFileSync(join(framesDir, '_index.json'), 'utf8').replace(/^﻿/, ''));

// frame size from the first available frame
const firstAnim = Object.keys(index)[0];
const firstDir = Object.keys(index[firstAnim])[0];
const probe = await loadImage(join(framesDir, `${firstAnim}__${firstDir}__0.png`));
const FW = probe.width, FH = probe.height;

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// feet baseline + horizontal center from idle/south frame 0 (fallback: first frame)
function bbox(img) {
  const c = createCanvas(FW, FH); const x = c.getContext('2d');
  x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, FW, FH).data;
  let minX = FW, maxX = 0, minY = FH, maxY = 0, any = false;
  for (let y = 0; y < FH; y++) for (let xx = 0; xx < FW; xx++) {
    if (d[(y * FW + xx) * 4 + 3] > 16) { any = true; if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return any ? { minX, maxX, minY, maxY } : null;
}
const baseAnim = index.idle ? 'idle' : firstAnim;
const baseImg = await loadImage(join(framesDir, `${baseAnim}__${index.idle ? 'south' : firstDir}__0.png`));
const bb = bbox(baseImg) || { minX: 0, maxX: FW, minY: 0, maxY: FH };
const anchorX = +(((bb.minX + bb.maxX) / 2) / FW).toFixed(4);
const anchorY = +((bb.maxY + 1) / FH).toFixed(4); // feet = bottom of opaque region

const manifest = { fw: FW, fh: FH, anchorX, anchorY, anims: {} };

for (const anim of Object.keys(index)) {
  const dirsPresent = DIRS.filter(d => index[anim][d] != null);
  const maxFrames = Math.max(...dirsPresent.map(d => index[anim][d]));
  const sheet = createCanvas(FW * maxFrames, FH * dirsPresent.length);
  const ctx = sheet.getContext('2d'); ctx.imageSmoothingEnabled = false;
  const rows = {};
  for (let r = 0; r < dirsPresent.length; r++) {
    const d = dirsPresent[r]; const n = index[anim][d];
    for (let f = 0; f < n; f++) {
      const img = await loadImage(join(framesDir, `${anim}__${d}__${f}.png`));
      ctx.drawImage(img, f * FW, r * FH);
    }
    rows[d] = { row: r, frames: n };
  }
  writeFileSync(join(outDir, `${anim}.png`), sheet.toBuffer('image/png'));
  manifest.anims[anim] = { rows };
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`packed ${char}: ${Object.keys(manifest.anims).length} anims, ${FW}x${FH}, anchor (${anchorX}, ${anchorY}) -> src/sprites/${char}/`);
