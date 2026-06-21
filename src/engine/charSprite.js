import { Sprite, Container, Graphics } from 'pixi.js';

// Per-tag playback timing (Aseprite JSON has no loop flag, so it lives code-side).
const SPEC = {
  idle:   { fps: 6,  loop: true },
  run:    { fps: 12, loop: true },
  jump:   { fps: 9,  loop: false },
  hurt:   { fps: 8,  loop: false },
  attack: { fps: 14, loop: false },
  win:    { fps: 8,  loop: true },
  lose:   { fps: 6,  loop: false },
  carry:  { fps: 8,  loop: true },
};

// Animated character. Container = [shadow, sprite(anchor bottom-center)], so
// `container.position == feet` — the same contract blitChar had. Frame stepping is
// manual (driven by the game loop's dt), since the Pixi ticker is stopped.
export class CharSprite extends Container {
  constructor(sheet, fallback = 'idle') {
    super();
    this.anims = sheet.animations;
    this.shadow = new Graphics();
    this.shadow.ellipse(0, -3, 15, 4).fill({ color: 0x000000, alpha: 0.16 });
    this.spr = new Sprite();
    this.spr.anchor.set(0.5, 1.0);
    this.addChild(this.shadow, this.spr);
    this._fallback = this.anims[fallback] ? fallback : Object.keys(this.anims)[0];
    this.current = null; this._t = 0; this._i = 0; this._dir = 1;
    this.play(this._fallback);
  }

  // Idempotent: calling every frame with the same name is a no-op (no frame reset).
  play(name) {
    if (name === this.current || !this.anims[name]) return;
    this.current = name; this._t = 0; this._i = 0;
    this.spr.texture = this.anims[name][0];
  }

  face(dir) { this._dir = dir < 0 ? -1 : 1; this.spr.scale.x = this._dir; } // shadow unaffected

  place(x, y) { this.position.set(x, y); }

  update(dt) {
    const frames = this.anims[this.current];
    if (!frames || !frames.length) return;
    const spec = SPEC[this.current] || { fps: 8, loop: true };
    this._t += dt;
    const adv = Math.floor(this._t * spec.fps);
    if (adv <= 0) return;
    this._t -= adv / spec.fps;
    this._i += adv;
    if (this._i >= frames.length) {
      if (spec.loop) { this._i %= frames.length; }
      else { this.spr.texture = frames[frames.length - 1]; const fb = this._fallback; this.current = null; this.play(fb); return; }
    }
    this.spr.texture = frames[this._i];
  }
}
