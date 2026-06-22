// Post-process generated UI assets in src/sprites/ui/:
//  - whiteKey: turn (near-)white background pixels transparent
//  - trim: crop transparent margins so the art fills its frame
// Usage: node tools/postprocess-ui.mjs
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const uiDir = join(here, '..', 'src', 'sprites', 'ui');

async function proc(name, { whiteKey = false, trim = false } = {}) {
  const img = await loadImage(join(uiDir, name));
  const w = img.width, h = img.height;
  const c = createCanvas(w, h); const x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0);
  const id = x.getImageData(0, 0, w, h); const p = id.data;
  if (whiteKey) {
    for (let i = 0; i < p.length; i += 4) {
      if (p[i] >= 232 && p[i + 1] >= 226 && p[i + 2] >= 210) p[i + 3] = 0;
    }
    x.putImageData(id, 0, 0);
  }
  let minX = w, minY = h, maxX = 0, maxY = 0, any = false;
  if (trim) {
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      if (p[(y * w + xx) * 4 + 3] > 16) { any = true; if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
  }
  if (!trim || !any) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
  const tw = maxX - minX + 1, th = maxY - minY + 1;
  const out = createCanvas(tw, th); const ox = out.getContext('2d');
  ox.imageSmoothingEnabled = false; ox.drawImage(c, minX, minY, tw, th, 0, 0, tw, th);
  writeFileSync(join(uiDir, name), out.toBuffer('image/png'));
  console.log(`${name}: ${w}x${h} -> ${tw}x${th}${whiteKey ? ' white-keyed' : ''}${trim ? ' trimmed' : ''}`);
}

await proc('sign.png', { whiteKey: true });       // keep aspect, just drop the white bg
await proc('trees.png', { whiteKey: true });
await proc('btn-gold.png', { trim: true });        // crop to the pill so it fills the button box
await proc('btn-rose.png', { trim: true });
await proc('btn-wood.png', { trim: true });
