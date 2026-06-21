import { Assets, Texture, Rectangle, Sprite, Container, Graphics, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';

// Per-animation playback (fps + loop). Frame counts come from the packed manifest.
const ANIM = {
  idle:      { fps: 6,  loop: true },
  walk:      { fps: 10, loop: true },
  run:       { fps: 14, loop: true },
  throw:     { fps: 9,  loop: false },
  dash:      { fps: 18, loop: false },
  hurt:      { fps: 10, loop: false },
  carryIdle: { fps: 6,  loop: true },
  carryWalk: { fps: 10, loop: true },
  win:       { fps: 8,  loop: true },
  lose:      { fps: 4,  loop: false },
};

// Packed by tools/pack-character.mjs into src/sprites/<name>/{<anim>.png, manifest.json}
const _manifests = import.meta.glob('../sprites/*/manifest.json', { eager: true });
const _sheetUrls = import.meta.glob('../sprites/*/*.png', { eager: true, query: '?url', import: 'default' });

// screen-space velocity -> 8-way compass direction (down = south)
export function dirOf(vx, vy) {
  if (!vx && !vy) return null;
  const deg = (Math.atan2(vy, vx) * 180 / Math.PI + 360) % 360;
  return ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'][Math.round(deg / 45) % 8];
}

export function hasCharacter(name) {
  return !!_manifests[`../sprites/${name}/manifest.json`];
}

export async function loadCharacter(name) {
  const man = _manifests[`../sprites/${name}/manifest.json`];
  if (!man) throw new Error(`character "${name}" not packed (run npm run pack:char ${name})`);
  const manifest = man.default || man;
  const clips = {};
  for (const anim of Object.keys(manifest.anims)) {
    const url = _sheetUrls[`../sprites/${name}/${anim}.png`];
    const sheet = await Assets.load(url);
    sheet.source.scaleMode = 'nearest';
    const rows = manifest.anims[anim].rows;
    clips[anim] = {};
    for (const dir of Object.keys(rows)) {
      const { row, frames } = rows[dir];
      const arr = [];
      for (let f = 0; f < frames; f++) {
        arr.push(new Texture({ source: sheet.source, frame: new Rectangle(f * manifest.fw, row * manifest.fh, manifest.fw, manifest.fh) }));
      }
      clips[anim][dir] = arr;
    }
  }
  return new Character(manifest, clips);
}

// Animated 8-directional character. Container origin = feet (sprite anchored at the
// manifest's computed feet baseline), so place(x,y) puts the feet at (x,y).
export class Character extends Container {
  constructor(manifest, clips) {
    super();
    this.m = manifest; this.clips = clips;
    this.shadow = new Graphics();
    const sw = Math.round(manifest.fw * 0.20);
    this.shadow.ellipse(0, -2, sw, Math.max(3, Math.round(sw * 0.34))).fill({ color: 0x000000, alpha: 0.20 });
    this.spr = new Sprite();
    this.spr.anchor.set(manifest.anchorX, manifest.anchorY);
    this.addChild(this.shadow, this.spr);
    this.anim = null; this.dir = 'south'; this._t = 0; this._i = 0; this._done = false; this._onEnd = null;
    this.play('idle', 'south');
  }

  _clip(anim, dir) {
    const a = this.clips[anim]; if (!a) return null;
    return a[dir] || a.south || a[Object.keys(a)[0]];
  }

  // Idempotent for looping anims; restarts only on a real (anim,dir) change.
  play(anim, dir, onEnd) {
    dir = dir || this.dir;
    if (anim === this.anim && dir === this.dir && !this._done) return;
    const c = this._clip(anim, dir); if (!c) return;
    this.anim = anim; this.dir = dir; this._t = 0; this._i = 0; this._done = false; this._onEnd = onEnd || null;
    this.spr.texture = c[0];
  }

  setScale(s) { this.spr.scale.set(s); this.shadow.scale.set(s); }
  place(x, y) { this.position.set(Math.round(x), Math.round(y)); }

  update(dt) {
    if (this._done) return;
    const c = this._clip(this.anim, this.dir); if (!c) return;
    const spec = ANIM[this.anim] || { fps: 8, loop: true };
    this._t += dt;
    const adv = Math.floor(this._t * spec.fps);
    if (adv <= 0) return;
    this._t -= adv / spec.fps; this._i += adv;
    if (this._i >= c.length) {
      if (spec.loop) { this._i %= c.length; }
      else {
        this._i = c.length - 1; this.spr.texture = c[this._i]; this._done = true;
        if (this._onEnd) { const cb = this._onEnd; this._onEnd = null; cb(); }
        return;
      }
    }
    this.spr.texture = c[this._i];
  }
}
