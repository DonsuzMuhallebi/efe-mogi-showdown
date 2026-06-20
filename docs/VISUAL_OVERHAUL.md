# Efe & Mogi Showdown — Görsel Yenileme Spec'i (v1)

> "Bir kez doğru yap, ikinci iş doğmasın." — bu dokümanın amacı: kararları sabitlemek,
> Aseprite çizim işini netleştirmek ve adım adım (her adımda doğrulanan) bir göç planı vermek.

## 0. Mevcut durum (başlangıç noktası)

- **Menüler/HUD:** HTML + CSS (`cqmin` responsive, sıcak ahşap teması). — KORUNUR.
- **Oyun render:** tek `#gcanvas`, canvas2D, sabit sanal çözünürlük + scale transform,
  `image-rendering:pixelated` açık. İki sanal layout:
  - Yatay (PC): **960×540**
  - Dikey (telefon): **480×560**
- **Karakterler:** kodla **vektör çizimi** (`drawEfe`/`drawMogi`, 64×88 offscreen canvas,
  `blitChar` ile ~0.85–0.95 ölçekte basılıyor). Animasyon yok, tek poz.
- **Arka planlar:** gradient + **emoji** prop'lar (`bgGarden/bgField/bgStorm/bgSnow/bgArena`).
- **9 minigame:** her biri `init/update/render`; bazıları DOM tabanlı (örn. tic-tac-toe).
- **FX:** basit parçacık + screen-shake (`FX`).

## 1. Motor kararı — **PixiJS v8** (WebGL 2D renderer)

**Neden:** Profesyonel 2D oyun standardı; pixel-art'a hazır (nearest scaling, pixel-perfect);
Aseprite spritesheet'leri okur; shader/ışık/bloom/post-processing tavanı yüksek (Faz 5).
Mevcut mimariyi bozmaz — **sadece oyun-içi render katmanını** değiştirir. Netcode (PeerJS),
ekran sistemi, i18n, menüler (HTML/CSS) aynen kalır.

**Pixel-perfect kurulum (zorunlu ayarlar):**
- Texture `scaleMode: 'nearest'`
- `roundPixels: true`
- Stage'i **tam sayı (integer)** ölçekle büyüt (bulanıklık olmasın)
- Sanal çözünürlük yine 960×540 / 480×560; Pixi sahnesi bu iç çözünürlükte çizer, ekrana integer-scale.

## 2. Sanat yönü

- **Stil:** sıcak, "cozy" pixel-art — mevcut paletle uyumlu.
- **Ortak palet (~24–32 renk):** mevcut renklerden tohumlanır:
  - Ten: `#f6cda3` (Efe), `#e8bd92` (Mogi)
  - Saç: `#4a3015`/`#6b4422` (Efe), `#1c1420`/`#2a1f2e` (Mogi)
  - Aksan: gold `#e8b34a`, rose `#dd8b94`, mint `#7fb89a`, kırmızı fiyonk `#e0473a`
  - Zemin/UI: cream `#f1e3c6`, kart `#4a3826`, çizgi `#5a4630`
- Palet `assets/palette.gpl` (Aseprite'a import edilebilir) olarak da verilecek.

## 3. Karakter + animasyon spec'i (Efe & Mogi)

- **Frame boyutu:** **64×96** sabit grid (8px tepe boşluğu = zıplama/kol kaldırma için).
- **Hizalama:** anchor **bottom-center** (0.5, 1.0); ayaklar frame'in altına oturur →
  mevcut zemin hizası birebir korunur.
- **Yön:** sağa bakacak şekilde çiz; sola dönüş `scale.x = -1` ile (ayrı çizim yok).
- **Animasyon setleri** (frameTag adı : frame sayısı @ fps : loop?):

  | Tag       | Frame | FPS | Loop | Not                         |
  |-----------|-------|-----|------|-----------------------------|
  | `idle`    | 4     | 6   | ✓    | nefes alıp verme            |
  | `run`     | 6     | 12  | ✓    | yürü/koş                    |
  | `jump`    | 3     | —   | ✗    | yüksel / tepe / düş         |
  | `hurt`    | 2     | 8   | ✗    | hasar alma                  |
  | `attack`  | 4     | 14  | ✗    | atış / vuruş (kar topu, bomba) |
  | `win`     | 4     | 8   | ✓    | kazanma kutlaması           |
  | `lose`    | 3     | 6   | ✗    | kaybetme                    |
  | `carry`   | 4     | 8   | ✓    | (kebab oyunu) malzeme taşıma — opsiyonel |

- **Aseprite katman önerisi:** `body` / `hair` / `accessory` ayrı katman, export'ta flatten.

## 4. Aseprite export ayarları (pipeline girişi)

`File → Export Sprite Sheet`:
- **Sheet type:** By Rows (sabit grid, trim KAPALI → 64×96 hücreler uniform kalsın)
- **JSON Data:** Hash, **"Tags" (frameTags) işaretli**
- **Item Filename:** `{tag}{frame}`
- **Çıktı:** `assets/sprites/efe.png` + `efe.json`, `assets/sprites/mogi.png` + `mogi.json`

## 5. Runtime pipeline (benim build edeceğim kısım)

```
assets/sprites/*.png + *.json
   → loader (boot'ta preload + "loading" ekranı)
   → Aseprite-JSON adapter  →  Pixi Spritesheet + animasyon haritası
   → AnimatedSprite  →  sprite.play('idle' | 'run' | ...)
```

- `src/engine/` altında: `pixiApp.js` (uygulama/sahne kurulumu), `assets.js` (loader),
  `asepriteAdapter.js` (JSON→Pixi), `sprite.js` (animasyonlu karakter helper'ı).

## 6. "Bu karakterleri baz alarak" — referans tabanı

Mevcut vektör `drawEfe`/`drawMogi` çıktısını **64×96 PNG taban** olarak render edip
`assets/sprites/_base/` altına koyacağım. Sen Aseprite'ta bunu import edip üstünden
pixel-art'a çevirip animasyon frame'lerini çizeceksin (gerçek frame sanatı senin işin;
altyapı + entegrasyon + taban benim).

## 7. Göç planı (kademeli — HER ADIMDA build + runtime doğrulaması)

1. **Pixi kur + mount:** `npm i pixi.js`; `#playArea`'ya pixel-perfect Pixi app; tek sprite render testi.
2. **Pipeline:** loader + Aseprite adapter + animasyon helper; placeholder sheet ile test.
3. **İlk değişim:** `blitChar` → AnimatedSprite, önce TEK yerde (karakter seçim / HUD avatar); doğrula.
4. **Minigame göçü:** oyunları **tek tek** Pixi render'a taşı (taşınmayan oyun canvas2D'de kalır); her oyunu doğrula.
5. **Arka planlar:** gradient+emoji → katmanlı parallax sprite/tileset.
6. **VFX/juice:** Pixi parçacık + filtreler + geçişler (hit-stop, squash&stretch, wipe/fade).
7. **UI/menü cilası:** sprite buton/panel, pixel font, animasyonlu başlık ekranı.

## 8. İş bölümü

- **Ben (Claude):** motor/pipeline/entegrasyon, adapter, animasyon sistemi, minigame göçü,
  VFX, referans PNG tabanları, her adımda doğrulama.
- **Sen (Efe):** Aseprite'ta karakter + frame sanatı (taban + spec'e göre); sahne/arka plan
  art yönü tercihleri. (İstersen taban üretimini birlikte gözden geçiririz.)
