// Placeholder animated spritesheet generator (Aseprite "By Rows" export format).
// Produces src/sprites/{efe,mogi}.png + .json so the real Aseprite->Pixi pipeline
// can be built and verified BEFORE the user's hand-drawn art exists. The user's
// Aseprite export drops into src/sprites/ and replaces these verbatim.
// Run: npm run gen:placeholder
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { drawEfe, drawMogi } from '../src/characters.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'sprites');
mkdirSync(outDir, { recursive: true });

const FW = 64, FH = 96, YBASE = 8; // 64x88 art, 8px headroom, feet at bottom

// [tag, frameCount] — full anim set so CharSprite has every tag (placeholder motion = bob/lean)
const TAGS = [
  ['idle', 4], ['run', 4], ['jump', 3], ['hurt', 2],
  ['attack', 4], ['win', 4], ['lose', 3], ['carry', 4],
];
const FPS = { idle: 6, run: 12, jump: 9, hurt: 8, attack: 14, win: 8, lose: 6, carry: 8 };

const TOTAL = TAGS.reduce((n, [, c]) => n + c, 0);

for (const [who, fn] of [['efe', drawEfe], ['mogi', drawMogi]]) {
  const cv = createCanvas(FW * TOTAL, FH);
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const frames = {};
  const frameTags = [];
  let gi = 0; // global frame index (column)
  for (const [tag, count] of TAGS) {
    const from = gi;
    for (let i = 0; i < count; i++, gi++) {
      // placeholder motion so frames are visibly distinct
      const phase = count > 1 ? (i / count) * Math.PI * 2 : 0;
      const bob = Math.round(Math.sin(phase) * (tag === 'run' ? 2 : 1));
      const lean = tag === 'run' ? Math.round(Math.cos(phase) * 1) : 0;
      ctx.save();
      ctx.translate(gi * FW + lean, YBASE + bob);
      fn(ctx);
      ctx.restore();
      frames[`${tag}${i}`] = {
        frame: { x: gi * FW, y: 0, w: FW, h: FH },
        rotated: false, trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: FW, h: FH },
        sourceSize: { w: FW, h: FH },
        duration: Math.round(1000 / FPS[tag]),
      };
    }
    frameTags.push({ name: tag, from, to: gi - 1, direction: 'forward' });
  }

  writeFileSync(join(outDir, `${who}.png`), cv.toBuffer('image/png'));
  const json = {
    frames,
    meta: {
      app: 'placeholder-generator', version: '1.0',
      image: `${who}.png`, format: 'RGBA8888',
      size: { w: FW * TOTAL, h: FH }, scale: '1',
      frameTags,
    },
  };
  writeFileSync(join(outDir, `${who}.json`), JSON.stringify(json, null, 2));
  console.log(`wrote src/sprites/${who}.png (${FW * TOTAL}x${FH}, ${TOTAL} frames) + ${who}.json`);
}
