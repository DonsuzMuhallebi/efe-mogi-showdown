// Reproducible base-sprite generator.
// Renders the current vector characters (src/characters.js) to 64x96 PNGs that
// serve as the Aseprite import base ("bu karakterleri baz alarak").
// Run: npm run gen:sprites
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { drawEfe, drawMogi } from '../src/characters.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'assets', 'sprites', '_base');
mkdirSync(outDir, { recursive: true });

const FW = 64, FH = 96, YOFF = 8; // 64x88 art placed with feet near the 96px-frame bottom

for (const [who, fn] of [['efe', drawEfe], ['mogi', drawMogi]]) {
  const cv = createCanvas(FW, FH);
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(0, YOFF);
  fn(ctx);
  ctx.restore();
  writeFileSync(join(outDir, `${who}.png`), cv.toBuffer('image/png'));
  console.log(`wrote assets/sprites/_base/${who}.png (${FW}x${FH})`);
}
