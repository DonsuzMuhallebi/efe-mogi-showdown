import { Application, Container, TextureSource } from 'pixi.js';

TextureSource.defaultOptions.scaleMode = 'nearest';

let app = null;
let world = null;
let _forceInteger = false;

export function isReady() { return !!app; }
export function getApp() { return app; }
export function getWorld() { return world; }
export function setForceInteger(v) { _forceInteger = !!v; if (app) requestRelayout(); }

let _last = null; // remember last layout args for relayout on toggle
function requestRelayout() { if (_last) layoutPixi(..._last); }

export async function initPixi() {
  if (app) return app;
  const canvas = document.getElementById('pcanvas');
  if (!canvas) throw new Error('pixiApp: #pcanvas not found');
  app = new Application();
  await app.init({
    canvas,
    backgroundAlpha: 0,
    antialias: false,
    roundPixels: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    powerPreference: 'high-performance',
    preference: 'webgl', // WebGPU under file:// is riskier; force WebGL for Electron parity
  });
  app.ticker.autoStart = false;
  app.ticker.stop();              // loop() owns timing — never Pixi's ticker (determinism)
  app.stage.eventMode = 'none';   // DOM keeps sole ownership of input (clientToV stays the truth)
  world = new Container();
  app.stage.addChild(world);
  return app;
}

// Mirror the canvas2D contain-fit (min scale). Default = "fill" (fractional, crisp via
// nearest + roundPixels — the Stardew look). forceInteger snaps to integer scale (true
// pixel-perfect, thin letterbox). rectW/rectH in CSS px; dpr is the (capped) device ratio.
export function layoutPixi(rectW, rectH, dpr, VW, VH) {
  if (!app || !world) return;
  _last = [rectW, rectH, dpr, VW, VH];
  app.renderer.resize(rectW, rectH);
  let sBack = Math.min((rectW * dpr) / VW, (rectH * dpr) / VH);
  if (_forceInteger) sBack = Math.max(1, Math.floor(sBack));
  const sCss = sBack / dpr;
  world.scale.set(sCss);
  world.position.set(Math.round((rectW - VW * sCss) / 2), Math.round((rectH - VH * sCss) / 2));
}

export function renderPixi() {
  if (app) app.renderer.render(app.stage);
}
