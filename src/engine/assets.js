import { Assets, TextureSource } from 'pixi.js';
import { buildSheet } from './asepriteAdapter.js';

// Vite-imported assets: PNG -> hashed URL (resolved correctly under file:// via base:'./'),
// JSON -> bundled object (no fetch — robust in the packaged Electron app).
import efePng from '../sprites/efe.png';
import mogiPng from '../sprites/mogi.png';
import efeJson from '../sprites/efe.json';
import mogiJson from '../sprites/mogi.json';

TextureSource.defaultOptions.scaleMode = 'nearest';

export const Sheets = {};
let _loaded = false;

export async function loadCharacters(onProgress) {
  if (_loaded) return Sheets;
  const list = [['efe', efePng, efeJson], ['mogi', mogiPng, mogiJson]];
  let done = 0;
  for (const [who, png, json] of list) {
    const tex = await Assets.load(png);
    tex.source.scaleMode = 'nearest';
    Sheets[who] = await buildSheet(tex, json);
    done++;
    if (onProgress) onProgress(done / list.length);
  }
  _loaded = true;
  return Sheets;
}
