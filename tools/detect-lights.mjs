// Detect the string-light bulb centers in src/sprites/ui/menu-bg.png so the
// twinkle glints can be aligned exactly on the bulbs.
// Usage: node tools/detect-lights.mjs
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const img = await loadImage(join(here, '..', 'src', 'sprites', 'ui', 'menu-bg.png'));
const W = img.width, H = img.height;
const c = createCanvas(W, H); const x = c.getContext('2d'); x.drawImage(img, 0, 0);
const d = x.getImageData(0, 0, W, H).data;

// scan the top third for bright cream/yellow bulb pixels (brighter + more yellow than the peach sky)
const topH = Math.round(H * 0.36);
const pts = [];
for (let y = 0; y < topH; y++) for (let xx = 0; xx < W; xx++) {
  const i = (y * W + xx) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
  if (r > 235 && g > 218 && b > 150 && (g - b) > 25) pts.push([xx, y]);
}
// cluster by proximity (~10px)
const used = new Array(pts.length).fill(false);
const clusters = [];
for (let a = 0; a < pts.length; a++) {
  if (used[a]) continue;
  let sx = 0, sy = 0, n = 0; const stack = [a];
  used[a] = true;
  while (stack.length) {
    const k = stack.pop(); sx += pts[k][0]; sy += pts[k][1]; n++;
    for (let m = 0; m < pts.length; m++) {
      if (!used[m] && Math.abs(pts[m][0] - pts[k][0]) <= 9 && Math.abs(pts[m][1] - pts[k][1]) <= 9) { used[m] = true; stack.push(m); }
    }
  }
  if (n >= 4) clusters.push({ x: sx / n, y: sy / n, n });
}
clusters.sort((p, q) => p.x - q.x);
console.log(`bulbs: ${clusters.length}`);
console.log('xPct=[' + clusters.map(c => +(100 * c.x / W).toFixed(1)).join(',') + ']');
console.log('yPct=[' + clusters.map(c => +(100 * c.y / H).toFixed(1)).join(',') + ']');
