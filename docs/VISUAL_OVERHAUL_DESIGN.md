# Efe & Mogi Showdown — Visual Overhaul: Technical Design & What-We-Can-Do

> Deepens `docs/VISUAL_OVERHAUL.md`. Does not contradict the locked decisions: PixiJS v8 replaces **only** the in-game render layer; HTML/CSS menus, PeerJS netcode, and i18n stay; characters become Aseprite spritesheets → Pixi `AnimatedSprite` (64×96, anchor bottom-center, pixel-art); start point = asset pipeline + Aseprite characters.

---

## 1. Executive Summary — End-State Vision

Efe & Mogi Showdown becomes a **cohesive, juicy pixel-art party game** that *feels* like a real shipped title, without touching its proven P2P determinism model.

- **Characters** are hand-feel Aseprite spritesheets (idle/run/jump/hurt/attack/win/lose/carry) rendered as Pixi `AnimatedSprite`s, with facing-flip, squash-and-stretch, and per-game reaction poses driven entirely from *already-synced* sim state.
- **The 5 spatial minigames** (kebab, durian, tnt, snow, tug) render through a PixiJS v8 scene graph with layered parallax backgrounds, particle FX, screen shake, hit-stop, and impact sheets — replacing flat 2D-canvas `bg*()` gradients and `fillText` emoji.
- **The 4 board games** (quiz, ttt, memory, simon) stay DOM/CSS and get pixel-art reskins + keyframe juice (card flips, stamps, win-line draws, lantern glows) — no Pixi migration.
- **Menus/HUD** stay DOM (layout, i18n, `cqmin` responsiveness preserved) with 9-slice pixel frames, a pixel display font for chrome, sprite hearts/pips, and live `AnimatedSprite` characters on title/champion screens.
- **The seam is narrow and verified**: only `render()`, the 5 canvas-game `render()` bodies, `blitChar`/`avatarTo`, `bg*`, the fit/transform trio, and `FX` change. Simulation, seeding, host authority, and net intervals stay **byte-identical**. Games migrate **one at a time**; at every commit, N games are Pixi and 9−N are canvas2D/DOM, all shippable.

The single biggest technical risk is **packaged `file://` asset loading**, fully mitigated by keeping `base:'./'`, using `public/sprites/`, and constructing `Spritesheet` from an explicitly-loaded texture. The single biggest *quality* decision is **pixel-perfect scaling**, which forces an honest choice between integer-scale-with-letterbox (crisp, bars) vs fractional-fill-with-`roundPixels` (pixel-snapped, edge-to-edge).

---

## 2. Engine Integration Approach

### 2.1 Module layout (`src/engine/`)

| File | Role |
|---|---|
| `pixiApp.js` | `Application` bootstrap; mount `#pcanvas` over `#playArea`; letterbox/scale transform (replaces `fitCanvas`/`applyVT`); `clientToVPixi` (replaces `clientToV` math). |
| `layers.js` | Root scene-graph tree: `world` → `bg/prop/char/fx` sub-containers, z-ordered. |
| `assets.js` | `Assets.load` manifest, boot preload + progress, `nearest` scaleMode, builds tag maps. |
| `asepriteAdapter.js` | Aseprite Hash-JSON + `frameTags` → Pixi `Spritesheet` + per-tag `Texture[]` map. Grid assertion. |
| `charSprite.js` | `CharSprite` `AnimatedSprite` wrapper: `play/face/place/setScale` + shadow (replaces `blitChar`). |
| `fx.js` | Pixi-native particles + shake (drop-in for `FX.burst/ring/shake/step/render`). |
| `juice.js` | VFX layer: shake, hit-stop, flash, burst, trail, transitions (rides on top of FX). |
| `scene.js` | Per-game `Background` parallax stack (replaces `bg*`). |
| `bridge.js` | The coexistence seam: per-game `_renderer` tag + mount/unmount; the single facade `main.js` imports. |

`main.js` imports **one facade (`bridge.js`)** so its diff stays small and reviewable.

### 2.2 Mounting over `#playArea`

Create a **second** canvas `#pcanvas`, inserted into `#playArea` as a sibling of `#gcanvas`, absolutely positioned to overlap exactly (`position:absolute;inset:0;image-rendering:pixelated;pointer-events:none`). Keeping both canvases is what lets canvas2D and Pixi games coexist during migration. `#playArea` is already `position:relative` (styles.css:80), and overlays (`#recipeHud`/`#caption`/`#actBtn`) already paint after the canvas in DOM order — **no z-index work needed**. Make Pixi transparent (`backgroundAlpha:0`) to match the existing letterbox-bar behavior (bars show `--inset`).

```js
await app.init({
  backgroundAlpha: 0, antialias: false, roundPixels: true, autoDensity: true,
  resolution: Math.min(window.devicePixelRatio||1, 2),   // mirror main.js:36 DPR cap
  powerPreference: 'high-performance', preference: 'webgl', // WebGPU under file:// is riskier
});
```

### 2.3 Ticker — keep `loop()`, do NOT adopt `app.ticker` (Verification TRAP 1, MED)

`loop()` order (main.js:194) is **load-bearing**: `Cur.update(dt)` → `render()` → `hostTick` → `updateHUD` → `FX.step`. `hostTick` reads positions `update` just wrote (tnt fuse/pass, durian, snow hit). Pixi's own ticker uses a different dt source and clamp; adopting it can reorder or re-time the sim → desync on differing frame rates / backgrounded tabs.

**Mitigation:** `app.ticker.autoStart=false; app.ticker.stop()` immediately after init. Drive `Pixi.app.renderer.render(stage)` **manually from inside `render()`**, slotting into the exact point canvas2D drew. Keep the literal `dt=(now-last)/1000` and `if(dt>0.05)dt=0.05` clamp. AnimatedSprite frames advance off the **loop's `dt`** in `charSprite.update(dt)` (one clock) — never Pixi's internal ticker (else frames freeze under `ticker.stop()`).

### 2.4 Coordinate transform — keep `clientToV`, drive Pixi from its values (TRAP 2, MED-HIGH if sloppy)

`clientToV` (main.js:38) feeds `Input.aimx/aimy` → into the **networked `pos` stream** and **host-side hit detection** (snow throw/durian catch). It is pure arithmetic over `CS/COX/COY`. Pixi's `toLocal` uses renderer resolution + container transform; if these don't reproduce `CS/COX/COY` exactly, aim/hitboxes shift (a regression, not a desync, since outcomes are host-authoritative).

**Mitigation:** Treat `clientToV` as **frozen sim-input code**. Keep the DOM pointer listeners on the canvas; do **not** route input through Pixi's `EventSystem` (set stage `eventMode='none'` so Pixi adds no listeners). Drive the Pixi `world` container's transform **from the same `CS/COX/COY`** `fitCanvas` already computes. Validate by dual-logging `clientToV` vs `world.toLocal` during the first world-game migration.

### 2.5 Pixel-perfect scaling — make an explicit choice (Verification: HIGH)

The current scaler (`main.js:36` `s=Math.min(cv.w/VW,cv.h/VH)`) is a **raw float**, never floored. With DPR and the HUD stealing vertical space from `#playArea`, **no real screen yields an integer `CS`** in practice — `image-rendering:pixelated` only nearest-neighbors the *final* CSS step, not the fractional virtual→backing blit, so shipping as-is = blurry "almost-pixel-art."

Two honest tiers — **pick one and label it correctly**:

- **(A) Integer-scale + letterbox (true pixel-perfect):** `SCALE = max(1, floor(min(rect.w/VW, rect.h/VH) * dpr))`; scale `world` by integer `SCALE`, integer-floor `COX/COY` offsets, fill bars with `--inset`. `clientToVPixi` inverts with the same integer `SCALE`/offsets. Trade-off: visible bars when the window isn't a clean multiple (e.g. 1366×768 → 1× centered).
- **(B) Fractional fill + `roundPixels` (pixel-*snapped*):** keep fractional `CS` (fills screen), rely on `roundPixels:true` + `nearest` scaleMode so sprites snap to device pixels. ~90% as crisp; sub-pixel motion wobbles slightly. **Do not market this as "pixel-perfect."**

Recommended default: **(A) for landscape 960×540** (it is a clean 2× of 1080p / 4× of 4K if the HUD becomes a transparent overlay over a full-stage canvas), expose a `forceInteger` flag, and accept fractional fallback where integer would waste >~12% of the area.

**Dual-resolution finding:** landscape **960×540** is the only res with real-world clean integer multiples. Portrait **480×560** has **no** common phone height divisible by 560 (`2400/560=4.28`, `1920/560=3.43`) — it will letterbox or be fractional essentially always. **If portrait crispness matters, change VH off 560** (e.g. 480×540 → matches landscape's 540 and gives clean multiples). `setVDims()` (main.js:34) already flips VW/VH; `layoutRoot(VW,VH)` reads them live with no per-orientation branch.

### 2.6 DPR/resize ownership (Overlay verification: MED)

Let Pixi own the backing store (`autoDensity:true`, `resolution=min(DPR,2)`); call `renderer.resize(rect.w,rect.h)` from inside the existing `fitCanvas`/`fitStage` and recompute `CS/COX/COY` from the *same* numbers so `clientToV` stays consistent. One source of truth for DPR. Watch for WebGL **context loss** on the app's fullscreen/resolution settings changes (v1.0.1) — re-`layoutRoot` on the existing resize event.

### 2.7 Mixed-version P2P (TRAP 4, MED — the realistic operational risk)

Incremental rollout means two app versions can connect over PeerJS. Determinism survives **only if** the migration touches zero bytes of seeded `init`, `worldMove` clamp (main.js:283), and serialized state (`sendPos`/`sendState`/`selfState`).

**Mitigations:** (1) one PR = render only — never bundle a `worldMove`/`init` refactor with a render swap; (2) the new **facing var `World.me.f` stays strictly local and is never serialized** (it exists at worldInit:282, currently unused — derive sprite mirror from it, don't transmit it); (3) optionally bump a protocol version and gate matchmaking so Pixi/pre-Pixi builds refuse to connect, OR prove byte-identical init/physics/state via diff. The one place to refuse without a diff: **any edit inside `worldMove` or a `GAMES[*].init`**.

---

## 3. Asset & Animation Pipeline

### 3.1 Layout & packaging (Verification: MED→LOW with mitigations)

```
public/sprites/   efe.png efe.json  mogi.png mogi.json   ← Vite copies verbatim → dist/sprites/
public/palette/   efemogi.gpl                            ← shared 24–32 color palette
public/scenes/    <per-scene PNGs / atlases>             ← backgrounds (§5)
src/sprites/_base/ efe.png mogi.png                      ← generated 64×96 reference bases (§3.5)
```

Hard constraints (cause silent dev-success / packaged failure if violated):
- **`base:'./'` must stay** (vite.config.js:6); Electron loads packaged `file://` (electron/main.js:27). **Never `/`-rooted URLs.**
- Sheets in **`public/`** → stable relative names (`./sprites/efe.png`), no Vite hashing, JSON↔PNG stay coupled.
- **Construct `new Spritesheet(texture, json)` from an explicitly-loaded texture** — do **not** trust Aseprite `meta.image` auto-resolution under file://.
- WebGL under file:// is fine in Chromium/Electron; no flag needed. ASAR + fetch reads `dist/**` transparently (no `asarUnpack`). If a CSP is later added, allow `data:`/`blob:`/`file:` for `img-src`.
- **Verify in the packaged build (electron-builder), not just `npm run dev`** — this is the #1 late-failure risk.

### 3.2 Aseprite export contract (`asepriteAdapter.js`)

64×96 frames, **trim OFF** (uniform cells), By Rows, JSON Hash, `frameTags` ON, item key `{tag}{frame}`. The adapter:
- uses `meta.frameTags` index ranges (`from`..`to`) against the ordered `frames` array — **does not parse names** (robust to rename);
- asserts `trimmed===false` and uniform 64×96 (trimmed frames drift the bottom-center anchor — throws early with a clear message);
- in Pixi v8, `sheet.animations[tag]` is auto-built from `frameTags`; wrap into `{textures, durations}`. Keep a manual `frames[from..to]` slice fallback if the v8 API surface differs from the installed version.

### 3.3 Per-tag fps/loop table (`charSprite.js` `ANIM_SPEC`)

Aseprite JSON has no loop flag, so carry it code-side: `idle 6/loop, run 12/loop, jump 9/once, hurt 8/once, attack 14/once, win 8/loop, lose 6/once, carry 8/loop`.

### 3.4 `CharSprite` (drop-in for `blitChar`)

`Container` = `[shadow Graphics, AnimatedSprite(anchor 0.5,1.0)]`, so `container.position == feet` (matches `blitChar`'s feet contract).
- `play(name)` is **idempotent** (guards `this.current`) — critical because the loop calls render every frame; naive `gotoAndPlay` freezes on frame 0.
- `face(dir)` flips **only the sprite** (`scale.x=±1`), never the shadow.
- non-loop `attack/hurt/jump` use `onComplete` → fallback to idle. State drivers live in each minigame (read-only on sim vars), not in the wrapper.
- `roundPixels` handles snapping — do **not** also round in `place()` (double-snap jitters).

### 3.5 Reference base generation (`src/tools/exportBase.js`)

Renders existing `drawEfe`/`drawMogi` (characters.js:5-44) into **64×96** PNGs (current `CHARBUF` is 64×88 — characters.js:45). Drawing at the same coords into a taller canvas adds 8px empty headroom on top while feet stay bottom-aligned. Dev-only helper; ships nothing.

### 3.6 The `blitChar` / `avatarTo` seam (note the 64×88 vs 64×96 mismatch)

- `blitChar` (5 world games) → `CharSprite` per (game, who). In-world is fine — both anchor at feet; the extra 8px is empty headroom.
- `avatarTo` (6 DOM canvases: pick/lobby/HUD `#avL`/`#avR`/result/champ) → **phase-1 keep on vectors** (low value, high surface area), or repoint to draw the spritesheet's `idle` frame to each canvas (signature unchanged). When avatars move to sprites, **bump canvas attrs 64×88 → 64×96** (else ~8% squash) — change `avatarTo` body and the HTML attrs together.

---

## 4. Per-Minigame Plans (all 9)

| Game | Type | Target | Migrate to | Key driver vars (no netcode change) | Effort |
|---|---|---|---|---|---|
| **kebab** | canvas, world | Pixi | Pixi world | `carry.length`, move velocity, junk-stumble timer | L |
| **durian** | canvas, world:false | Pixi | Pixi world | `this.x` delta (facing), `inv`/`flinch`, `hearts`, `diedAt` | M |
| **tnt** | canvas, world | Pixi | Pixi world | `holder`, `dashT`, `fuse`, `exploded` | L |
| **snow** | canvas, world | Pixi | Pixi world | `cool` (throw), `inv`, move magnitude, `Input.aimx/aimy` | L |
| **tug** | canvas, world:false | Pixi | Pixi world | `rope`, `myPull` cadence | S |
| **quiz** | DOM | DOM+CSS | stays DOM | `.good/.bad`, `lockT`, 20s host rotation | M |
| **ttt** | DOM | DOM+CSS | stays DOM | `.cell.win`, `turn`, `place()` | M |
| **memory** | DOM | DOM+CSS | stays DOM | `cd.flip/done`, `pairs.efe/mogi`, `turn` | M |
| **simon** | DOM | DOM+CSS | stays DOM | `.lit`, `phase`, `seq.length`, `turn` | M |

### kebab (main.js:305-315, `bgGarden` 274) — **Pixi, L**
Cozy kitchen-garden cook-off. Tiling grass + dirt path, garden-bed/fence/string-light mid layer, drifting pollen ambient. Pots become kebab-grill / rendang-wok sprites with steam-idle + "ingredient-added" splash. 12 recipe + 4 junk item sprites replace `fillText` emoji; "yours" highlight ring (314) → pulsing outline sprite. Chars: `idle↔run` from velocity, `carry` loop when `carry.length>0`, deposit/celebrate poses. Add facing flip. Frozen: seeded item grid (306-307), pickup/deposit/junk logic, `Host.setMy`/finish.

### durian (main.js:318-322, `bgStorm` 275) — **Pixi, M**
Stormy-alley dodger (portrait-natural). Parallax storm sky + animated rain (replaces 16 static streak lines) + wet-cobble ground. 9 hazards become tumbling sprites with `it.rot` (render-only) + growing ground shadow; heart pickup sparkles. Char: `run`+**new facing flip** from `this.x` delta, `hurt` from `inv`/`flinch`, slump on `diedAt`. Periodic lightning flash ramps with `this.t`. Frozen: spawn RNG, AABB catch, `decide()`, `finish` send (death anim must not delay it).

### tnt (main.js:332-342, `bgArena` 276) — **Pixi, L (marquee FX)**
Sumo/dojo arena: tiled floor + straw-rope ring + parallax crowd. Bomb = hero prop with animated lit fuse + frantic-flash near `fuse→0`; pulsing warning ring tightens with fuse. Dash afterimage trail on `dashT`. **Explosion** = multi-frame sheet + white→orange flash + bloom peak + `FX.shake=16` (kept) + 120ms hit-stop — the loudest moment. Char: `dash` lean, holder-panic, win/lose. Frozen: host pass/boom authority (337-338), `net boom` branch, timers.

### snow (main.js:344-353, `bgSnow` 277) — **Pixi, L**
Winter clearing: parallax pines/banks + falling-snow particle layer (replaces 36 seeded dots). Snowball sprite with spin; snow-splat impact sheet replaces `FX.burst(white)`; crosshair reticle replaces dashed line. Char: wind-up→throw `attack` on `cool` reset, `hurt` from `inv` (alpha-pulse shield not hard blink), run from movement. **`Input.aimx/aimy` must come from the new pointer path — verify aim tracks cursor exactly.** Frozen: host hit-detection (349), `net hit` must still fire the (upgraded) splat on the guest.

### tug (main.js:355-361, `bgField` 278) — **Pixi, S (lowest risk)**
Tug-of-war pit over a mud puddle; crowd/fence parallax. `world:false`, so **no pos-sync netcode** — positions derive purely from `rope`. Segmented rope sprite + center flag at the *exact* existing `cx=VW/2+rope*(VW*0.32)`. Chars re-anchored to face each other, pull-cycle loop synced to `myPull` cadence, win=arms-up / lose=dragged-into-mud + splash. Frozen: `rope` host authority (357), `gm` pull/rope messages, `selfState`.

### quiz (main.js:298-302, CSS 92-95) — **stays DOM, M**
Pixel quiz-board: wooden signboard banner, 2×2 beveled answer plaques with A–D keycaps, two reaction-mascot avatars, static stage backdrop. Juice: staggered option reveal, green pop + check-stamp on correct, shake + draining `lockT` bar on wrong, top question-timer bar (from `performance.now()-startT`). **Keep `update()`/host 20s `newq` rotation/`gm` messages intact** — `build()` runs every rotation, so new nodes must be idempotent.

### ttt (main.js:325-330, CSS 98-101) — **stays DOM, M**
Carved wooden board with routed cell grooves + brass brackets. `markSVG()` X/O → pixel sprite marks (update `markSVG`+`refresh` together; marks re-inject every `refresh` so entrance anim must be a transient class set only in `place()`, not in the persistent markup). Win line = a `.winbar` rotated via a per-line lookup table, animated ≤350ms (under the 550ms `resolveRound`). Optional character busts.

### memory (main.js:364-372, CSS 103-105) — **stays DOM, M**
Cozy tabletop: felt mat, pixel card-backs, 8 pixel face icons (map `cd.e`→CSS class via `data-sym`, not `textContent`). 3D `rotateY` flip via `.memc-inner` (keep `onclick` on the outer element). Match = pop + sparkle + score-pip fill; miss = shake then flip-back (≤300ms, under the 750ms/500ms windows). Turn avatars + pip rows. There is a dead `FX&&0;` (370) at the match moment — the natural CSS-sparkle hook.

### simon (main.js:374-386, CSS 107-109) — **stays DOM, M**
Festival lantern/drum duel: 4 lantern pads (unlit/lit), stage backdrop, flanking avatars. Juice: scale-pop + bloom on `.lit` synced to `Sound.pad`, "WATCH" dim phase, fail = red flash + `#playArea` shake, level banner from `seq.length`. **Preserve `.lit` class name + `SIMCOL` order + `phase`/`turn` gating + net paths** — all timing/correctness-load-bearing.

> DOM-game optional upgrade: a transparent Pixi FX overlay above `#gdom` for shared confetti/sparkle. **Deferred** — CSS keyframes cover everything first-pass.

---

## 5. Backgrounds / Environments (`scene.js`)

Scope: the **5 canvas scenes only**. Replaces `bgGarden/bgField/bgStorm/bgSnow/bgArena` (main.js:272-278). DOM games keep CSS theming.

**Layer stack (back→front)** per `Background` instance, behind the char/prop layers in the same letterboxed `world` container:
```
L0 sky        TilingSprite, full VW×VH, no scroll
L1 far        parallax 0.15 (hills/clouds/treeline)
L2 mid        parallax 0.4  (bushes/banks/dunes/rope-posts)
L3 ground     parallax 1.0  (grass/snow/cobble/arena band, ~96px tall, bottom-anchored)
L4 ambient    ParticleContainer ~0.6 (snow/embers/rain/pollen)
L5 foreground parallax 1.3  (front grass/fence — optional)
```

**Camera:** the world has no real scroll (`worldMove` clamps to a fixed box). "Parallax" = a **local-only virtual camera** eased toward the local player's x: `camX = lerp(camX, World.me.x - VW/2, 0.08); layer.x = round(-camX*factor)`. Each scrolling TilingSprite gets ~30% overscan (width `VW*1.3`) so the ±~60px sway never reveals a seam. **Zero netcode impact — same risk class as `FX.shake`.** Round `layer.x` to integers (else subpixel shimmer).

**Two-orientation strategy:** author each layer as a horizontally-tileable strip with a fixed art height, bottom-anchored; sky stretches. One art set serves both 960×540 and 480×560 — but eyeball horizon height in portrait (560) and clamp `camX` so the tighter portrait overscan never seams.

**Per-scene ambient & tint:** garden=pollen/butterflies + warm tint; field=dust/leaf + golden hour; storm=rain + periodic lightning (`ColorMatrixFilter` flash, sprite-overlay fallback if filter perf is bad); snow=falling flakes + cool tint; arena=rising embers + torch flicker + fuse-reactive warm vignette.

Build per round in `startRound` after `Cur.init`; `update(dt)` after `Cur.update` (so `World.me.x` is current); destroy in `cleanupRound` with `destroy({children:true, texture:false})` (keep textures cached). ~30 PNGs total (mostly bands/silhouettes) — pack into 1–2 atlases; lazy-load per-scene during countdown.

---

## 6. VFX / Juice Catalog (`fx.js` + `juice.js`)

`FX` (main.js:198-200) uses unseeded `Math.random()` — **confirmed render-only, non-networked (TRAP 3, LOW tripwire).** Keep it on `Math.random()`, never wire it to `Round.seed`; never let a particle trigger a gameplay event. Same public API (`burst/ring/shake/step/render`) so call sites are renderer-agnostic; instantiate per-renderer via `bridge.js`.

| Effect | Tier | Tech | Where |
|---|---|---|---|
| Impact particles / dust / sparks | Cheap | `ParticleContainer`, pooled, cap ~400 | kebab pickup/drop, durian catch/hit, tnt explosion, snow splat, tug mash |
| Trails / afterimage | Cheap | fading texture clones | tnt dash, snowball flight |
| Squash & stretch | Cheap | `sprite.scale` + `easeOutBack` | every throw/land/hit/pickup/win; props (bomb pulse, falling-item wobble) |
| Screen shake | Cheap | `world`-container offset (replaces `ctx.translate`, keeps ×40 decay) + optional rotational/directional kick | tnt 16, durian/snow 4–6, tug snap |
| Flashes | Cheap | full-VW×VH `Graphics` rect in screen container | tnt white→orange, hit red, win gold, kebab mint |
| Hit-tint | Cheap | sprite `tint` pulse (replaces blink) | durian/snow `inv` |
| **Hit-stop** | **Cheap but NET-SENSITIVE** | freeze a separate `renderDt` only; sim/`hostTick`/net read real `dt` | tnt 120ms, durian 50ms, snow 60ms, resolve 80ms |
| Per-sprite glow | Medium | `GlowFilter` on 1–2 objects | tnt bomb, durian heart, kebab "yours" |
| Full-scene bloom | Medium | `AdvancedBloomFilter` **transient only** (~150ms) | tnt explosion peak |
| Vignette | Cheap (sprite) / Med (filter) | overlay PNG, or reactive shader | arena/snow/storm; reactive on tnt fuse / durian low-HP |
| CRT / scanline | Heavy | `CRTFilter` | **opt-in settings toggle only**; default = cheap scanline overlay sprite |
| Transitions | Cheap-Med | screen-container rect/mask, returns Promise | fade/iris/wipe — **covers the `#gdom`↔`#gcanvas` swap** (main.js:187) and countdown→game→result seams |

**Hit-stop is the highest-attention item:** keep `loop()`'s real `dt` for `Cur.update`/`hostTick`/net; maintain a separate `renderDt` that Juice zeroes during hit-stop, read by AnimatedSprite playback, emitters, S&S, shake decay. Freezing the *picture* a beat while the *sim/netcode keep running* is invisible (impacts are brief + host-authoritative). Conflate the two clocks → P2P desync. Document loudly in `juice.js`.

DOM games get CSS-native juice (quiz `.good/.bad`, memory flip, simon `.lit`, ttt win-line) and may shake `#gdom` via CSS transform from `Juice.shake`. Filters/CRT/bloom gate behind a quality toggle for unknown Electron GPUs; confirm filter FBOs work in the *packaged* build.

---

## 7. UI / Menu Overhaul

**Decision: keep menus DOM, push them hard.** Do not migrate layout/text/i18n into Pixi (pure cost). Use **one persistent transparent overlay Pixi app** for live characters on title/champion only.

1. **Foundation (CSS, no engine):** bundle a pixel **display font** via relative `@font-face` for chrome (`.heading`, `#scoreMid`, big buttons, countdown); **keep `Fredoka` for body/i18n** text (Turkish/long strings overflow a pixel font). Author one **9-slice frame PNG** set (gold/rose/mint/inset), wire `border-image` into `.btn`/`.alt`/`.cool`/`.ghost`/`.card`/`.panel`/`#hud`. Keep `:root` palette so Wood/Pastel/Night themes still recolor. Test at 480px portrait and 4K (border-image can blur at fractional `cqmin` — author at clean multiples).
2. **HUD juice:** sprite hearts/pips (`renderMeter`, main.js:197), score `+1` floating keyframe. **Fix the 120ms state-interval re-render restart:** diff and rewrite only changed meter cells, or drive loss/gain via one-shot class toggles (else CSS anims restart every tick).
3. **`avatarTo` → idle sprite frame** (one body change, 6 surfaces benefit, no live-anim risk). Bump canvases 64×88→64×96.
4. **Title:** CSS-parallax layers + pixel-logo wordmark; boot the persistent overlay Pixi app once; two live `idle` `AnimatedSprite`s (re-parented per screen, not spun up/down).
5. **Champion:** live `win`/`lose` on the overlay + optional Pixi `ParticleContainer` confetti (or keep CSS `confetti()`).
6. **Pick/lobby:** baked idle frames (free from step 3); upgrade to live sprites later only if DOM-rect-sync is worth it (avoid the fiddly rect-sync for the common screens).

All UI asset/font URLs relative (`public/` or `import.meta.url`), never `/`-rooted.

---

## 8. Risk Register

| # | Risk | Sev | Mitigation |
|---|---|---|---|
| 1 | **Packaged `file://` asset load** (leading-`/` works in dev, breaks packaged; Aseprite `meta.image` mis-resolves) | **HIGH→LOW** | `base:'./'` stays; `public/sprites/`; `new Spritesheet(explicitTexture, json)`; **test the electron-builder build, not dev** (roadmap Phase 0). |
| 2 | **Pixel-perfect scaling blur** — fractional `CS`, no integer fit on real screens; portrait 560 has no clean multiple | **HIGH** | Choose tier (A) integer+letterbox or (B) `roundPixels`-snapped fractional; add `nearest` scaleMode; **consider moving VH off 560** for portrait crispness. Label the chosen tier honestly. |
| 3 | **`loop()` ticker reorder / dt swap** | **MED** | `ticker.stop()`; manual `renderer.render()` inside `render()`; keep dt + 0.05 clamp; advance anims off loop `dt`. |
| 4 | **`clientToV` vs Pixi pointer parity** — feeds networked pos + host hit-detection | **MED-HIGH** | Keep `clientToV` math frozen; drive `world` transform from same `CS/COX/COY`; `eventMode='none'`; dual-log validation. |
| 5 | **Hit-stop dt-split** — freezing sim dt desyncs P2P | **MED** | Separate `renderDt` (zeroed) vs real sim `dt`; only visuals read `renderDt`; document in `juice.js`. |
| 6 | **Mixed-version P2P** during incremental rollout | **MED** | Render-only PRs; `World.me.f` local/never-serialized; refuse any `worldMove`/`init` edit without a diff; optional protocol-version gate. |
| 7 | **DPR/resize double-ownership** → blur / coord mismatch | **MED** | Pixi owns backing store; one DPR source; recompute `CS/COX/COY` from same numbers; re-layout on resize + context-loss. |
| 8 | **Always-on full-screen filters** (bloom/CRT) on unknown Electron GPUs | **MED** | Transient-only bloom; CRT opt-in toggle; cheap scanline-sprite default; verify FBOs in packaged build. |
| 9 | **Pixi `EventSystem` steals/preventDefaults touch** | **MED** | `eventMode='none'`; keep existing DOM listeners as sole input path. |
| 10 | **64×88 vs 64×96 mismatch** (avatar squash) | **LOW** | Bump 6 canvas attrs + `avatarTo` together when avatars go sprite. |
| 11 | **`FX`/shake non-determinism leaking into sim** | **LOW** | Keep `Math.random()`; never read `Round.seed`; never trigger gameplay from particles. |
| 12 | **Trimmed Aseprite frames** drift bottom-center anchor | **LOW** | `assertGrid()` throws; document "trim OFF" hard contract. |
| 13 | **`play()` non-idempotency** freezes anim on frame 0 | **LOW** | `this.current` guard in `CharSprite.play`. |
| 14 | **Asset weight** inflates nsis-web download / load | **LOW-MED** | Pack atlases; lazy per-scene load; keep boot splash gating `Assets.load`. |
| 15 | **Parallax overscan seam** in portrait | **LOW** | Clamp `camX`; verify 30% overscan at 480 wide. |
| 16 | **DOM-game anim restart on `refresh`/`build`** (ttt marks, quiz rotation, 120ms meter) | **LOW-MED** | Entrance anims as transient classes set only on the event, not persistent markup; diff cells. |

**Non-issues (verified):** WebGL under file:// (orthogonal to determinism); `sendState`/`sendPos` intervals (render-independent, null-safe); DOM games (render skipped, never coexist with canvas); host authority (state-driven, render can't affect it); overlay z-index (DOM order already correct).

---

## 9. Implementation Roadmap (phased, S/M/L, dependencies)

Start point (user-chosen): **asset pipeline + Aseprite characters.** Each phase is independently shippable; every game-touching step ends with a **2-client local match** confirming seeded layouts + host outcomes are unchanged (render swaps must be observably outcome-neutral).

### Phase 0 — Engine boot + asset pipeline proof  *(deps: none)*
- **[M]** `engine/pixiApp.js`: mount `#pcanvas`, `ticker.stop()`, manual render, `eventMode='none'`, transparent. (TRAP 1, overlay-MED)
- **[M]** `layoutRoot`/`fitToPlayArea` from `CS/COX/COY`; **decide pixel-scale tier (A/B)** + `forceInteger` flag. (Risk 2)
- **[S]** `clientToVPixi`; dual-log parity vs `clientToV`. (Risk 4)
- **[M]** `engine/assets.js` + `asepriteAdapter.js` + `charSprite.js` with a **placeholder** sheet; boot preload gated by `#splash`.
- **[S]** `src/tools/exportBase.js` → 64×96 base PNGs for Aseprite.
- **[S] ⚠️ Gate:** build with **electron-builder** and confirm sheets load under packaged `file://`. (Risk 1 — do this here, not later.)

### Phase 1 — Aseprite characters live  *(deps: Phase 0)*
- **[L]** Author Efe/Mogi sheets (idle/run/jump/hurt/attack/win/lose/carry) on shared palette.
- **[M]** First real swap = **HUD avatars + `avatarTo` idle frame**; bump 6 canvases to 64×96. (Risk 10) — no gameplay, proves the pipeline end-to-end.

### Phase 2 — Migrate the 5 canvas games (one PR each, simplest→hardest)  *(deps: Phase 1; `bridge.js` `_renderer` seam)*
- **[S] tug** — 1-D, `world:false`, no pos-sync. Cleanest first world game.
- **[M] durian** — slider + new facing flip.
- **[L] kebab** — World movement + items + carry.
- **[L] snow** — projectiles + aim (verify `Input.aimx/aimy` via new pointer path).
- **[L] tnt** — host fuse + explosion (heaviest; pairs with Phase 4 marquee FX).
- Freeze every `update`/`hostTick`/`net`/`selfState`/`init`/`worldMove`. (Risk 6) One PR = render only.

### Phase 3 — Backgrounds / parallax (`scene.js`)  *(deps: Phase 2 per-game)*
- **[M]** Per-scene `Background` stacks replacing the 5 `bg*()` calls; local camera; ambient particles. Cheapest big visual win; 5 isolated, logic-free swaps. Author for both orientations.

### Phase 4 — VFX / juice  *(deps: Phase 2; tnt benefits most)*
- **[M]** Port `FX`→`fx.js` (ParticleContainer + shake + flash) — parity + better. (Risk 11)
- **[M]** S&S + hit-tint + **hit-stop** (the `renderDt` split). (Risk 5)
- **[S]** Transitions (fade/iris) covering the DOM↔canvas seam.
- **[M]** Targeted glow + **transient** bloom for tnt explosion; reactive vignette. (Risk 8)
- **[S]** Opt-in CRT toggle + cheap scanline default.

### Phase 5 — DOM-game CSS polish (parallel, no engine dep)  *(deps: Phase 1 for avatars only)*
- **[M] quiz**, **[M] ttt**, **[M] memory**, **[M] simon** — pixel reskins + keyframe juice per §4. Preserve all class names, gating, net paths, and animation-restart fixes. (Risk 16)

### Phase 6 — Menu / title / champion overhaul  *(deps: Phase 1 for live sprites)*
- **[M]** 9-slice frames + pixel display font + HUD sprite meters (cell-diff fix). (Risk 16)
- **[M]** Title CSS parallax + persistent overlay Pixi app + live idle sprites.
- **[S]** Champion live win/lose + optional Pixi confetti.
- **[S]** Pick/lobby baked idle frames (free from Phase 1).

**Dependency spine:** Phase 0 → 1 → 2 → (3, 4 in parallel). Phase 5 runs anytime after Phase 1 (avatars). Phase 6 needs Phase 1's overlay-sprite path. The asset-pipeline `file://` gate in Phase 0 is the load-bearing early checkpoint — everything downstream assumes it passed in the *packaged* build.