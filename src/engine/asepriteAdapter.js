import { Spritesheet } from 'pixi.js';

// Aseprite "Hash" JSON (with meta.frameTags) -> parsed Pixi Spritesheet.
// sheet.animations[tag] = Texture[] in frame order.
// Asserts untrimmed frames so the bottom-center anchor stays exact.
export async function buildSheet(texture, ase) {
  const frameKeys = Object.keys(ase.frames);
  for (const k of frameKeys) {
    if (ase.frames[k].trimmed) {
      throw new Error(`asepriteAdapter: frame "${k}" is trimmed — re-export from Aseprite with Trim OFF (uniform grid required for the feet anchor).`);
    }
  }
  const animations = {};
  for (const tag of (ase.meta.frameTags || [])) {
    animations[tag.name] = frameKeys.slice(tag.from, tag.to + 1);
  }
  const data = { frames: ase.frames, meta: ase.meta, animations };
  const sheet = new Spritesheet(texture, data);
  await sheet.parse();
  return sheet;
}
