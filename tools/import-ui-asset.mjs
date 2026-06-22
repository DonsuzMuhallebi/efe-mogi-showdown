// Copy/crop a generated PNG (e.g. from PixelLab) into src/sprites/ui/.
// Usage: node tools/import-ui-asset.mjs <srcPng> <destName> [cropBottomPx]
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [, , src, dest, cropBottomStr] = process.argv;
if (!src || !dest) { console.error('usage: import-ui-asset.mjs <srcPng> <destName> [cropBottomPx]'); process.exit(1); }
const cropBottom = parseInt(cropBottomStr || '0', 10);

const outDir = join(here, '..', 'src', 'sprites', 'ui');
mkdirSync(outDir, { recursive: true });

const img = await loadImage(src);
const H = img.height - cropBottom;
const c = createCanvas(img.width, H);
const x = c.getContext('2d');
x.imageSmoothingEnabled = false;
x.drawImage(img, 0, 0);
writeFileSync(join(outDir, dest), c.toBuffer('image/png'));
console.log(`wrote src/sprites/ui/${dest} (${img.width}x${H})`);
