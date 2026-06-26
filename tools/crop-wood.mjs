// Crop a clean wood-plank swatch from the center of sign.png so buttons use the
// EXACT same wood as the signboard. Output: src/sprites/ui/btn-wood.png
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ui = join(here, '..', 'src', 'sprites', 'ui');
const sign = await loadImage(join(ui, 'sign.png'));
// central plank region (inside the frame, away from the corner rings)
const sx = Math.round(sign.width * 0.28), sy = Math.round(sign.height * 0.38);
const sw = Math.round(sign.width * 0.44), sh = Math.round(sign.height * 0.26);
const c = createCanvas(sw, sh); const x = c.getContext('2d');
x.imageSmoothingEnabled = false;
x.drawImage(sign, sx, sy, sw, sh, 0, 0, sw, sh);
writeFileSync(join(ui, 'btn-wood.png'), c.toBuffer('image/png'));
console.log(`btn-wood.png = sign wood swatch ${sw}x${sh} from (${sx},${sy})`);
