# Efe & Mogi Showdown — Pixel-Art Prompt Paketi (PixelLab → Aseprite)

> Bu paket, **Efe & Mogi Showdown** (Electron + Vite + PixiJS v8) için **PixelLab** ile pixel-art asset **+ animasyon** üretmek üzere kopyala-yapıştır hazır İngilizce prompt'lar ve katı teknik kurallar verir. PixelLab prompt'tan üretir ve **Aseprite eklentisiyle** açık dosyana düşürür (akış: 0.1). Açıklamalar Türkçe; **her üretim promptu İngilizce** `prompt` kod bloğunda (PixelLab İngilizce'de daha iyi çalışır). Bölüm 0 tüm diğer bölümlerin **üstünde** geçerlidir — sonraki promptlar palet/ölçü/export kurallarını tekrar etmez, referans verir.

---

# BÖLÜM 0 — NASIL KULLANILIR & GLOBAL KISITLAR

## 0.1 PixelLab → Aseprite → export akışı

Sen **PixelLab** (pixellab.ai) kullanacaksın — prompt'tan pixel-art **ve animasyon** üreten AI aracı; **Aseprite eklentisi** var (Aseprite v1.3+). Bu paketteki promptlar doğrudan PixelLab'e girdidir. PixelLab base'i + animasyonu üretir, Aseprite'a düşürür, sen export kontratıyla çıkarırsın:

| Adım | Nerede | Ne yapılır |
|---|---|---|
| **(a) Base üret** | PixelLab | Karakter/nesne base'ini üret. **Reference image** = `src/sprites/_base/{efe,mogi}.png` (kimlik+stil kilidi, 0.7). View = **side**, size = hedef px (0.3). |
| **(b) Animasyon üret** | PixelLab | Her tag için **Animate** (text veya skeleton): "idle breathing", "running", "throw"… PixelLab frame-tutarlı seti kendi üretir (anchor + kimlik korunur). |
| **(c) Aseprite'a al** | PixelLab eklentisi | Sonuç açık Aseprite dosyana frame olarak düşer (ya da web'den indir → `File → Import`). |
| **(d) Palete indeksle** | Aseprite | Paleti (0.2) yükle; gerekiyorsa `Edit → Replace Color`. |
| **(e) Frame + tag** | Aseprite | Frame'leri kontrol et, **Tag** adlarını **birebir** 0.4'teki gibi koy. |
| **(f) Export** | Aseprite | `File → Export Sprite Sheet` (0.5). PNG+JSON → `src/sprites/`. |

> ✅ **PixelLab animasyonu KENDİ üretir** (walk/run/idle/attack…) — her frame'i **elle çizmen GEREKMEZ**. Bölüm 1'deki per-tag promptlar, PixelLab'in **Animate** kutusuna girecek kısa hareket açıklamalarıdır.
> 📐 **Boyut → frame sayısı:** PixelLab'de sprite büyüdükçe istek başına AZ frame döner (≈32×32→16, ≈128×128→4). 64×96'da tag başına 4-6 frame rahat çıkar; gerekirse uzun tag'i iki istekte üret.
> 🎯 **Model:** kimlik/stil eşleştirme için **BitForge** (reference-image destekli, küçük→orta); genel/büyük üretim için **PixFlux**.

## 0.2 ORTAK PALET (kopyala-yapıştır)

İki gruba ayrıldı (toplam ~40 girdi; "tek sahne ~16-24 renk" hedefi sahne başına geçerli, bu master palet tüm oyunun birleşik kaynağıdır). `src/sprites/efemogi.gpl` olarak kaydet → Aseprite `Palette (☰) → Load Palette`.

```gpl
GIMP Palette
Name: EfeMogi Showdown
Columns: 8
#
246 205 163	efe-skin f6cda3
240 184 150	efe-skin-sh f0b896
227 173 130	efe-skin-sh2 e3ad82
 74  48  21	efe-hair-dk 4a3015
107  68  34	efe-hair-mid 6b4422
143  98  48	efe-hair-hi 8f6230
176 136  80	efe-hair-hi2 b08850
110  77  46	efe-iris 6e4d2e
 74  47  24	efe-brow 4a2f18
244 236 215	efe-shirt f4ecd7
113 119 132	efe-shirt-sh 717784
 90  96 112	efe-shirt-sh2 5a6070
 60  68  82	efe-pants 3c4452
 42  42  48	dark-shoe 2a2a30
181 106  85	efe-mouth b56a55
232 189 146	mogi-skin e8bd92
219 168 122	mogi-skin-sh dba87a
 28  20  32	mogi-hair-dk 1c1420
 42  31  46	mogi-hair-mid 2a1f2e
211 216 223	mogi-jacket d3d8df
185 191 200	mogi-jacket-sh b9bfc8
 73 179 156	mogi-teal 49b39c
243 246 250	mogi-jacket-spec f3f6fa
 58  58  70	mogi-skirt 3a3a46
224  71  58	bow-red e0473a
240 106  91	bow-red-hi f06a5b
181  48  38	bow-red-sh b53026
 58  42  40	mogi-brow 3a2a28
 90  58  46	mogi-iris 5a3a2e
210  96 106	mogi-mouth d2606a
233 138 148	mogi-lip e98a94
251 247 239	eye-white fbf7ef
 26  16  18	eye-pupil 1a1012
241 227 198	ui-cream f1e3c6
 90  70  48	ui-card 5a4630
106  82  54	ui-line 6a5236
232 179  74	ui-gold e8b34a
243 207 120	ui-gold-hi f3cf78
201 142  46	ui-gold-sh c98e2e
214 160  90	ui-peach d6a05a
127 184 154	ui-mint 7fb89a
221 139 148	ui-rose dd8b94
127 180 208	ui-sky 7fb4d0
232 103  90	ui-red e8675a
 95 194 138	ui-green 5fc28a
```

> Beyaz parıltı = `#ffffff` (palet dışı, **tek piksel** highlight olarak kullanılır, glow yok).
> **GOLD AİLESİ KİLİDİ:** UI altın = base `#e8b34a` (`--gold`), shade `#c98e2e` (`--gold2`), highlight `#f3cf78`. Eski dokümanlardaki `#f0bd55/#f5d27a/#cf962f` **kullanılmaz** — tüm UI promptları yukarıdaki üçlüye hizalıdır.

## 0.3 GLOBAL ÖLÇÜ TABLOSU

Sahne katmanları **iki sanal çözünürlüğe** birden hizmet eder: yatay/PC **960×540**, dikey/telefon **480×560**.

### Karakter sprite'ları
| Özellik | Değer |
|---|---|
| Frame grid | **64×96** (sabit, uniform) |
| Anchor | **bottom-center** (0.5, 1.0) — ayaklar alt kenarda |
| Gövde yüksekliği | ~88 px (kalan ~8px tepe boşluğu) |
| Yön | **sağa bakar** (motor `scale.x=-1` ile sola çevirir) |
| Arka plan | **şeffaf** |

### Sahne katmanları (tek sanat seti hem 960×540 hem 480×560'e hizmet eder)
Kural: **yatay tile-edilebilir şerit + SABİT yükseklik, alta hizalı.** Gök dikeyde uzar; ground asla esnemez. **Tüm stripler 640 px geniştir**, sol↔sağ kenar dikişsiz; motor ~%30 overscan + parallax döngüyle çizer (640 desen, 960'ta ~1.5×).

| Katman | Parallax | Sanat yüksekliği | Tile genişliği | Not |
|---|---|---|---|---|
| L0 sky | 0 (uzar) | **560 px** | 640 | posterize gök |
| L1 far | 0.15 | **220 px** | 640 | tepe/silüet, alta hizalı |
| L2 mid | 0.4 | **300 px** | 640 | prop kümeleri, alta hizalı |
| L3 ground | 1.0 | **120 px** | 640 | çim/kum/kar bandı |
| L4 ambient | ~0.6 | partikül | — | motorda kod ile (PNG değil) |
| L5 fg (ops.) | 1.3 | 160 px | 640 | ön çit/çim |

### UI elemanları (DOM/CSS — Pixi sahnesi değil)
| Eleman | Çizim px | 9-slice |
|---|---|---|
| Buton çerçevesi | 48×24 | köşe 8 |
| Panel/kart | 64×64 | köşe 16 |
| HUD kalp | 16×16 | hayır |
| HUD pip | 12×12 | hayır |
| Skor plakası | 40×20 | ops. köşe 8 |
| Oyun kategori ikonu | 32×32 | hayır |
| Sistem ikonu (gear/quit) | 24×24 | hayır |
| Başlık wordmark | 240×160 | hayır |

## 0.4 ANİMASYON SETLERİ (frameTag : frame @ fps : loop)

Aseprite JSON'ında loop bayrağı yok → loop/fps motorda taşınır; sen doğru sayıda frame çiz ve etiketi **birebir** bu adlarla koy:

| frameTag | Frame | FPS | Loop |
|---|---|---|---|
| `idle` | 4 | 6 | ✓ |
| `run` | 6 | 12 | ✓ |
| `jump` | 3 | 9 | ✗ |
| `hurt` | 2 | 8 | ✗ |
| `attack` | 4 | 14 | ✗ |
| `win` | 4 | 8 | ✓ |
| `lose` | 3 | 6 | ✗ |
| `carry` | 4 | 8 | ✓ |

## 0.5 ASEPRITE EXPORT KONTRATI

> **Bu kontrat YALNIZCA çok-kareli/animasyonlu sheet'ler içindir** (karakterler + `explosion`/`splat`/`steam`/`fuse`). **Statik tek-kare nesneler ve UI parçaları** düz `File → Export → PNG` ile çıkar — `{tag}{frame}` ve frameTags **uygulanmaz**.

`File → Export Sprite Sheet`:

| Ayar | Değer |
|---|---|
| Sheet type | **By Rows** |
| **Trim** | **OFF** (uniform hücre — trim anchor'ı kaydırır) |
| Padding/Border/Spacing | 0 |
| JSON Data | **ON, Hash** |
| Meta → Tags (frameTags) | **ON** |
| Item Filename | **`{tag}{frame}`** |
| Output PNG | `src/sprites/efe.png` (vb.) |
| JSON | `src/sprites/efe.json` (vb.) |

> Doğrulama: her frame `frame:{x,y,w:64,h:96}` ve `trimmed:false`. Adapter trimlenmiş frame'de **erken hata** fırlatır.

## 0.6 ŞEFFAFLIK / OUTLINE / ANTI-ALIAS KURALLARI

- **Anti-alias YOK.** Kalem/şekil AA kapalı; küçültmede Nearest. Yarı-saydam kenar pikseli yasak.
- **Posterize, gradient yok.** "Smooth gradient" pixel-art değildir; tüm geçişler **ayrık renk basamaklarına** bölünür.
- **1px temiz outline** (koyu, saf siyah değil). İç hatlarda outline yerine ton farkı.
- **Şeffaf arka plan.** Zemin gölgesi sprite'a değil motorun ayrı `shadow Graphics`'ine ait — sprite'a gölge çizme.
- **Yarım piksel yok.** Tüm öğeler tam piksel grid'e otursun.

## 0.7 PixelLab AYARLARI & STİL KİLİDİ

PixelLab stili **metin-suffix ile değil, araç ayarları + reference image** ile kontrol eder. Her üretimde şunları ayarla:

- **Reference image** — `src/sprites/_base/efe.png` / `mogi.png` (karakterler) ya da ilgili base. **En güçlü kimlik+stil kilidi budur; mutlaka ver.** Yeni sahne/prop için ilk ürettiğin asset'i sonrakilere referans yap → tek görsel dil.
- **View / perspective** — **side** (yan-bakış; oyun 2D side-view). Karakterler **sağa** baksın (motor sola çevirir). 4/8 yön GEREKMEZ.
- **Size** — hedef px (karakter 64×96; diğerleri 0.3 tablosu).
- **Outline** — tek renk koyu outline (saf siyah değil). **Shading** — flat / basic. **Detail** — low-medium (küçük px'te okunur, "cozy" his; aşırı detay bulanıklaşır).
- **Background** — transparent. Anti-alias YOK (0.6).

Aşağıdaki kısa metni promptların sonuna **opsiyonel** olarak ekleyebilirsin (PixelLab'i yönlendirir; asıl kontrol yukarıdaki ayarlar + reference):

```prompt
cozy pixel art, side view facing right, clean 1px dark outline, flat shading,
limited palette, transparent background, no anti-aliasing, single subject.
```

## 0.8 `[PLACEHOLDER]` ÖZELLEŞTİRME KURALI

- Köşeli parantezli **`[BÜYÜK_HARF]`** = senin değiştireceğin kancalar. Parantezi de sil, değerini yaz.
- Parantezsiz hiçbir şeye dokunma — palet hex'leri, `64x96`, `transparent background`, `no anti-aliasing` **sabit kontrat**tır.
- İngilizce'yi Türkçe'ye çevirme; sadece `[...]` alanlarını doldur.

---

# BÖLÜM 1 — KARAKTERLER

Her karakter için: bir **master base sprite** promptu + her tag için kısa bir **Animate açıklaması**. Akış (0.1): önce base'i üret (**reference image** = `src/sprites/_base/*.png`), sonra PixelLab **Animate** (text veya skeleton) ile her tag'i üret — **PixelLab frame'leri kendi çıkarır, elle dizmen gerekmez.** Aşağıdaki per-tag prompt blokları, Animate kutusuna girecek hareket açıklamalarıdır.

### Aseprite katman düzeni (her iki karakter)
`shadow` (motor ekler, çizme) · `body` · `outfit_accent` · `hair` · `face` · `accessory` (gözlük/fiyonk en üst).

### Ortak knob'lar
`[expression]` · `[accessory]` · `[outfit color]` (kimliği bozma, ton kaydır) · `[pose]`.

---

## 1.1 EFE

**Kimlik (kilitli):** sıcak ten `#f6cda3` (gölge `#f0b896`/`#e3ad82`), kahverengi yana taranmış DOLGUN saç (outline `#4a3015`, orta `#6b4422`, highlight `#8f6230`/`#b08850`, sağa eğik perçem), yuvarlak çift cam **gözlük** (cam `#fbf7ef`, iris `#6e4d2e`), krem gömlek `#f4ecd7` (gri yaka/kol `#717784`/`#5a6070`), koyu mavi-gri pantolon `#3c4452`, ayakkabı `#2a2a30`, ağız `#b56a55`.

### Efe — MASTER BASE SPRITE
```prompt
Pixel art character base sprite, ONE single pose, 64x96 pixels, transparent background.
Subject: "Efe" — a friendly cozy boy, full body, standing relaxed, flat side-on view facing
RIGHT (slight 3/4 turn, NOT front-facing, NOT perspective). Feet touch the very bottom edge
of the frame; body fills most of the height with a small empty gap above the hair.
Identity (keep exact):
- Warm skin #f6cda3, soft shadow #f0b896, cheek/jaw shade #e3ad82.
- Full side-swept BROWN hair: dark outline #4a3015, mid #6b4422, highlight tufts #8f6230 and
  #b08850, front fringe sweeps right.
- Round oval double-lens GLASSES: lens fill #fbf7ef, warm brown iris #6e4d2e, dark pupil
  #1a1012, and exactly ONE pure-white #ffffff pixel as a glint (one pixel, no glow).
- Cream short-sleeve shirt #f4ecd7, cool grey collar/sleeve shade #717784 and #5a6070.
- Dark blue-grey trousers #3c4452, dark shoes #2a2a30.
- Calm gentle smile, soft mouth arc #b56a55, thin brows #4a2f18.
- Do NOT draw a ground shadow (engine adds it).
Style: cozy warm pixel art, clean 1px dark outline (not pure black), readable at small size.
Customization: expression [gentle smile], accessory [round glasses], outfit color
[cream shirt #f4ecd7], pose [relaxed standing].
[+ optional style snippet from 0.7 — main style lock is the reference image + PixelLab settings]
```
**Boyut:** 64×96. **Palet:** Efe grubu (0.2). **Knob:** `[expression] [accessory] [outfit color] [pose]`.

### Efe — per-animation (her Frame ayrı üretilir)
Aşağıdaki blokların her birinde "Frame N" satırı **bağımsız bir üretim promptudur**; base sprite'ı referans göster, hepsini Aseprite'ta diz.

**idle — 4 frame @ 6 fps, LOOP**
```prompt
"Efe" idle, generate EACH frame separately (64x96, transparent, facing RIGHT, feet at bottom),
same base identity/palette exactly. Subtle breathing loop:
- Frame 1: neutral standing, [gentle smile], arms relaxed.
- Frame 2: chest/shoulders rise 1px, hair tuft lifts slightly.
- Frame 3: peak — body 1px up, slight head bob.
- Frame 4: settle back toward frame 1 (loop-ready).
Feet fixed at bottom, no horizontal drift. [+ GLOBAL SUFFIX]
```
**run — 6 frame @ 12 fps, LOOP**
```prompt
"Efe" run cycle, generate EACH frame separately (64x96, transparent, facing RIGHT, feet land
at bottom), same identity/palette. Slight forward lean, arms pump, hair/hem flutter back:
- Frame 1: contact — right leg forward heel down, left arm forward.
- Frame 2: down/recoil — legs gathered, lowest point.
- Frame 3: passing — left leg drives forward, body rises.
- Frame 4: contact (mirror of f1) — left leg forward, right arm forward.
- Frame 5: down/recoil (mirror of f2).
- Frame 6: passing (mirror of f3), loops to f1.
[+ GLOBAL SUFFIX]
```
**jump — 3 frame @ 9 fps, ONCE**
```prompt
"Efe" jump, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: crouch/anticipation — knees bent, arms back, body compressed lower.
- Frame 2: launch/rise — legs extended down, arms up, body stretched, airborne (feet off bottom).
- Frame 3: apex/falling — knees tuck up, arms out for balance, hair lifted.
Customization: expression [focused], pose [athletic jump]. [+ GLOBAL SUFFIX]
```
**hurt — 2 frame @ 8 fps, ONCE**
```prompt
"Efe" hurt, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: impact flinch — head snaps back, body recoils backward, eyes squeezed (brows down),
  small open "ow" mouth, arms thrown up defensively.
- Frame 2: stagger — leaning back off-balance, one foot lifted, dazed.
Do NOT recolor skin (any damage tint is an engine overlay). [+ GLOBAL SUFFIX]
```
**attack — 4 frame @ 14 fps, ONCE**
```prompt
"Efe" attack (quick forward throw to the right), generate EACH frame separately (64x96,
transparent, facing RIGHT), same identity/palette:
- Frame 1: wind-up — arm pulled back, weight on back foot, [determined] face.
- Frame 2: step in — body rotates forward, lead foot plants.
- Frame 3: strike — arm fully extended forward right, peak reach.
- Frame 4: follow-through — arm crosses down, returning to neutral.
Customization: pose [overhand throw]. [+ GLOBAL SUFFIX]
```
**win — 4 frame @ 8 fps, LOOP**
```prompt
"Efe" win/celebrate, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: arms raised, big [happy grin].
- Frame 2: small hop (feet off bottom), fists pumped.
- Frame 3: land, cheerful wave.
- Frame 4: bounce back toward frame 1 (loop-ready). [+ GLOBAL SUFFIX]
```
**lose — 3 frame @ 6 fps, ONCE**
```prompt
"Efe" lose/dejected, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: shoulders start to drop, smile fades.
- Frame 2: head hangs, arms limp, knees slightly bent.
- Frame 3: full slump — hunched, sad downturned mouth, [dejected], small sweat-drop.
Ends on the slump. [+ GLOBAL SUFFIX]
```
**carry — 4 frame @ 8 fps, LOOP**
```prompt
"Efe" carry, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette. Holding a plain grey placeholder box #bdbdbd at chest height with BOTH hands
clearly gripping forward:
- Frame 1: both arms forward holding box, neutral stance.
- Frame 2: slight step + box bobs up 1px.
- Frame 3: opposite step, box bobs down.
- Frame 4: return toward frame 1 (loop-ready). [+ GLOBAL SUFFIX]
```
**Tüm Efe tag'leri — Boyut:** her frame 64×96. **Palet:** Efe grubu. **Export:** By Rows, Trim OFF, Hash, frameTags ON, `{tag}{frame}` → `src/sprites/efe.png`+`efe.json`.

---

## 1.2 MOGI

**Kimlik (kilitli):** açık-sıcak ten `#e8bd92` (gölge `#dba87a`), koyu siyah-mor saç `#1c1420`/`#2a1f2e` iki yandan örgü/perçem, üstte belirgin **KIRMIZI ÇENTİKLİ FİYONK** `#e0473a` (highlight `#f06a5b`, gölge `#b53026`), açık gri/beyaz ceket `#d3d8df` (gölge `#b9bfc8`) + **nane/teal yatay aksan şeridi** `#49b39c` + benekler `#f3f6fa`, koyu etek `#3a3a46`, allıklı yanaklar, pembe ağız `#d2606a`/`#e98a94`, iris `#5a3a2e`.

### Mogi — MASTER BASE SPRITE
```prompt
Pixel art character base sprite, ONE single pose, 64x96 pixels, transparent background.
Subject: "Mogi" — a friendly cozy girl, full body, standing relaxed, flat side-on view facing
RIGHT (slight 3/4 turn, NOT front-facing, NOT perspective). Feet touch the very bottom edge;
body fills most of the height with a small empty gap above the hair/bow.
Identity (keep exact):
- Warm skin #e8bd92, soft shadow #dba87a.
- Dark near-black-purple hair #1c1420 with strand shade #2a1f2e, two side braids framing the face.
- A prominent RED hair BOW on top: main #e0473a, highlight #f06a5b, shade #b53026, notched ribbon edges.
- Light grey/white jacket #d3d8df, shadow #b9bfc8, a horizontal MINT/TEAL accent stripe #49b39c
  across the chest, small light flecks #f3f6fa.
- Dark skirt #3a3a46, warm legs #e8bd92, dark shoes #2a2a30.
- Rosy blush cheeks, warm pink smiling mouth #d2606a with lip #e98a94, thin brows #3a2a28,
  eyes white #fbf7ef, iris #5a3a2e, dark pupil #1a1012, exactly ONE pure-white #ffffff glint pixel.
- Do NOT draw a ground shadow (engine adds it).
Style: cozy warm pixel art, clean 1px dark outline (not pure black), readable at small size.
Customization: expression [sweet smile], accessory [red bow], outfit color
[light jacket #d3d8df], pose [relaxed standing].
[+ optional style snippet from 0.7 — main style lock is the reference image + PixelLab settings]
```
**Boyut:** 64×96. **Palet:** Mogi grubu (0.2). **Knob:** `[expression] [accessory] [outfit color] [pose]`.

### Mogi — per-animation (her Frame ayrı üretilir)
**idle — 4 @ 6, LOOP**
```prompt
"Mogi" idle, generate EACH frame separately (64x96, transparent, facing RIGHT, feet at bottom),
same base identity/palette. Subtle breathing loop:
- Frame 1: neutral standing, [sweet smile], hands relaxed.
- Frame 2: chest rises 1px, red bow and braids lift slightly.
- Frame 3: peak — body 1px up, slight head bob, skirt hem shifts.
- Frame 4: settle toward frame 1 (loop-ready). [+ GLOBAL SUFFIX]
```
**run — 6 @ 12, LOOP**
```prompt
"Mogi" run cycle, generate EACH frame separately (64x96, transparent, facing RIGHT, feet land
at bottom), same identity/palette. Forward lean, arms pump, braids/skirt trail, red bow bounces
but stays readable on top:
- Frame 1: contact — right leg forward, left arm forward.
- Frame 2: down/recoil — legs gathered.
- Frame 3: passing — left leg drives forward, body rises.
- Frame 4: contact (mirror).
- Frame 5: down/recoil (mirror).
- Frame 6: passing (mirror), loops to f1. [+ GLOBAL SUFFIX]
```
**jump — 3 @ 9, ONCE**
```prompt
"Mogi" jump, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: crouch — knees bent, arms back, body compressed lower.
- Frame 2: launch/rise — legs extended down, arms up, airborne (feet off bottom), braids and bow lift.
- Frame 3: apex/falling — knees tuck, arms out, skirt flares.
Customization: expression [excited]. [+ GLOBAL SUFFIX]
```
**hurt — 2 @ 8, ONCE**
```prompt
"Mogi" hurt, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: impact flinch — head snaps back, body recoils, eyes shut, small open "ow" mouth,
  arms up defensively, bow jolts.
- Frame 2: stagger — leaning back off-balance, one foot lifted, dazed.
Do NOT recolor skin (damage tint is an engine overlay). [+ GLOBAL SUFFIX]
```
**attack — 4 @ 14, ONCE**
```prompt
"Mogi" attack (quick forward throw to the right), generate EACH frame separately (64x96,
transparent, facing RIGHT), same identity/palette:
- Frame 1: wind-up — arm back, weight on back foot, [determined] face.
- Frame 2: step in — body rotates forward, lead foot plants.
- Frame 3: strike — arm fully extended forward right, peak reach, braids whip forward.
- Frame 4: follow-through — arm crosses down, return to neutral. [+ GLOBAL SUFFIX]
```
**win — 4 @ 8, LOOP**
```prompt
"Mogi" win/celebrate, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: arms raised, big [happy grin], blush bright.
- Frame 2: small hop (feet off bottom), red bow bounces, hands up.
- Frame 3: land, cheerful wave, skirt settles.
- Frame 4: bounce back toward frame 1 (loop-ready). [+ GLOBAL SUFFIX]
```
**lose — 3 @ 6, ONCE**
```prompt
"Mogi" lose/dejected, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette:
- Frame 1: shoulders drop, smile fades.
- Frame 2: head hangs, arms limp, knees bent, bow droops.
- Frame 3: full slump — hunched, sad downturned mouth, [dejected], small sweat-drop.
Ends on the slump. [+ GLOBAL SUFFIX]
```
**carry — 4 @ 8, LOOP**
```prompt
"Mogi" carry, generate EACH frame separately (64x96, transparent, facing RIGHT), same
identity/palette. Holding a plain grey placeholder box #bdbdbd at chest height with BOTH hands
clearly gripping forward:
- Frame 1: arms forward holding box, neutral stance.
- Frame 2: slight step + box bobs up 1px, braids sway.
- Frame 3: opposite step, box bobs down.
- Frame 4: return toward frame 1 (loop-ready). [+ GLOBAL SUFFIX]
```
**Tüm Mogi tag'leri — Boyut:** 64×96. **Palet:** Mogi grubu. **Export:** `{tag}{frame}` → `src/sprites/mogi.png`+`mogi.json`.

---

## ⚠️ KOD GEÇİŞ NOTU (kritik — sprite'a geçerken)

`src/characters.js` mevcut buffer **64×88**, anchor üst-sol blit. Yeni kontrat **64×96, anchor bottom-center**. Güncellenecek noktalar:
- **Satır 45:** `b.height = 88 → 96`.
- **Satır 46:** `drawImage(..., x-32*s, y-88*s, Math.round(64*s), Math.round(88*s))` → y-offset `-88*s → -96*s` **VE** son parametre (hedef yükseklik) `Math.round(88*s) → Math.round(96*s)`. Üçü de değişir.
- **Satır 6 / 27:** zemin gölge elipsi y-konumu `85` (88-tabanlı) → `93` (96-tabanlı) taşınır; ayaklar alt kenarda kaldığı için zemin hizalaması korunur, ekstra 8px headroom üste eklenir.

İlgili dosya: `C:\Users\herra\Documents\Projects\GameProjects\EfeMogiShowdown\src\characters.js`.

---

# BÖLÜM 2 — PROPS & ITEMS (5 Canvas Oyunu)

Şu an `serif` emoji `fillText` ile çizilen nesnelerin yerine geçecek sprite'lar.

**ORTAK KURALLAR (tüm prop promptları):** transparent PNG; tek nesne, hücrenin TAM ortasında, simetrik kenar boşluğu; engine merkeze çizer (`textAlign=center`); statik tek-kare nesneler **düz PNG** (Export Sprite Sheet DEĞİL); çok-kareli efektler (explosion/splat/steam/fuse) karakter kontratıyla aynı export. **2× çöz kuralı:** kaynak px, engine hedefinin ~2×'i (ekranda net kalsın). 0.7'deki PixelLab ayarları (view=side, outline/shading, **reference image**) uygulanır; istersen 0.7'deki kısa prompt ekini de yapıştır.

---

## 2.1 KEBAB — Mutfak-bahçe (bgGarden, çim `#a9dd86→#7cc35f`)

### Kebab malzemeleri (Efe tarifi) — `🥩 🫓 🍅 🧅 🫑 🧂`
```prompt
A cozy pixel-art food ingredient icon set, 6 SEPARATE items, generate each on its own 48x48 px
transparent canvas, object ~40px centered with even 4px margins, single object each.
Items: (1) raw red marbled meat chunk, (2) round flatbread/lavash, (3) ripe red tomato with
green stem, (4) golden-brown onion, (5) green bell pepper, (6) salt shaker.
Palette anchor: food red #c94a3a, golden #d6a05a, bread cream #f1e3c6, garden greens.
Each must read clearly at ~27px on screen. [+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 kaynak / ~27px hedef. **Palet:** sıcak yemek tonları. **Dosya:** `kebab_meat/flatbread/tomato/onion/pepper/salt.png`.

### Rendang malzemeleri (Mogi tarifi) — `🥥 🌶️ 🌿 🧄 🫚 🍚`
```prompt
A cozy pixel-art Indonesian rendang ingredient icon set, 6 SEPARATE items, each on its own
48x48 px transparent canvas, object ~40px centered, 4px margins, single object.
Items: (1) brown coconut half with white flesh, (2) red chili, (3) green herb leaf bundle,
(4) white garlic bulb, (5) knobby beige ginger root, (6) bowl of white rice.
Each reads clearly at ~27px. [+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 / ~27px. **Dosya:** `rendang_coconut/chili/herb/garlic/ginger/rice.png`.

### Junk item'lar — `🦠 👟 🧦 🪨`
```prompt
A cozy-but-gross pixel-art junk item set, 4 SEPARATE items, each on its own 48x48 px transparent
canvas, object ~40px centered, 4px margins, single object, bold silhouette readable at tiny size.
Items: (1) simple round green blob with 3-4 chunky spikes and two dot eyes (germ), (2) worn old
sneaker, (3) dirty striped sock, (4) grey rough rock. Make them clearly "yucky / not food".
Each reads at ~27px. [+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 / ~27px. **Dosya:** `junk_germ/shoe/sock/rock.png`.

### Pot (hedef) — `🍲`
```prompt
A cozy pixel-art cooking pot on a 64x64 px transparent canvas, single object ~56px centered.
A round pot with two handles and a lid slightly ajar, warm broth inside. Pot body [POT=#8a6a44],
rim [RIM=#b08850]. NO steam, NO glow ring (engine adds the ring). Reads at ~36px. [+ GLOBAL SUFFIX]
```
**Boyut:** 64×64 / 36px. **Palet:** pot `#8a6a44`, rim `#b08850` (KEBAB ikonuyla eşleşir). **Dosya:** `pot.png`. **Knob:** `[POT] [RIM]`.

### Buhar (opsiyonel) — `steam` 3 frame @ 6 fps, LOOP
```prompt
A pixel-art steam wisp, generate EACH frame separately on a 32x40 px cell, transparent bg.
Curling steam rising and dissipating for a smooth loop, using stepped opacity in 2-3 DISCRETE
levels only (no smooth fade), hard pixel edges:
- Frame 0: low compact wisp.
- Frame 1: taller curling wisp.
- Frame 2: tallest, thinning at the top before dissipating.
Color [STEAM=#fbf7ef]. [+ GLOBAL SUFFIX]
```
**Boyut:** 32×40 / kare. **Export:** By Rows, Trim OFF, Hash, frameTags `steam` loop → `steam0..2`. **Dosya:** `steam.png`+`json`. **Knob:** `[STEAM]` (gece: `#d3d8df`).

---

## 2.2 TNT — Sumo/dojo arena (bgArena, kum `#e6c79a→#cba36e`)

### Bomba — `💣`
```prompt
A pixel-art round cartoon bomb on a 48x48 px transparent canvas, single object ~40px centered.
Spherical very dark blue-grey bomb body [BODY=#2a2a30] with a small highlight [#5a6070], a short
upward UNLIT fuse rope (no spark, no flame, no glow). Reads at ~30px.
Do NOT draw any spark or aura — engine adds those. [+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 / 30px. **Palet:** gövde `#2a2a30`, vurgu `#5a6070`. **Dosya:** `bomb.png`. **Knob:** `[BODY]`.

### Fitil kıvılcımı (opsiyonel) — `fuse` 2 frame @ 8 fps, LOOP
```prompt
A pixel-art fuse spark, generate EACH frame separately on a 16x16 px cell, transparent bg:
- Frame 0: tiny bright spark, core #ff5a3a + highlight #ffc94d.
- Frame 1: slightly larger with a few stray sparks.
Hard edges, for a fast 8fps blink. [+ GLOBAL SUFFIX]
```
**Boyut:** 16×16 / kare. **Export:** frameTags `fuse` loop → `fuse0,fuse1`. **Dosya:** `fuse.png`+`json`.

### Patlama — `explosion` 4 frame @ 14 fps, ONCE
```prompt
A pixel-art cartoon explosion, generate EACH frame separately on a 128x128 px cell, transparent
bg, blast CENTERED in every cell (uniform). 4 distinct stages, chunky hard-edged shapes only,
bold flat orange #ff7a3a + yellow #ffc94d core + a few angular debris chunks. NO soft smoke,
NO gradients:
- Frame 0: small bright white-yellow core flash.
- Frame 1: expanding orange fireball with a few debris chunks.
- Frame 2: full fireball #ff7a3a at max size with flying bits.
- Frame 3: collapsing into a few chunky grey smoke puffs.
[+ GLOBAL SUFFIX]
```
**Boyut:** **128×128** kaynak / engine ~180px'e ölçekler (burst radius'u korur). **Export:** By Rows, Trim OFF, Hash, frameTags `explosion` once → `explosion0..3`. **Dosya:** `explosion.png`+`json`. **Knob:** turuncu `#ff7a3a`, çekirdek `#ffc94d`.

---

## 2.3 SNOW — Kış açıklığı (bgSnow, `#dff1fb→#a9d4ec`)

### Kar topu — `#fff` daire (kod) yerine
```prompt
A pixel-art snowball on a 24x24 px transparent canvas, single object ~14px centered.
Simple round white #ffffff snowball with a pale-blue shadow #aaccea on the lower-right and one
1px white highlight top-left. NO outer stroke (engine adds it). Reads at ~14px. [+ GLOBAL SUFFIX]
```
**Boyut:** 24×24 / ~14px. **Dosya:** `snowball.png`.

### Kar sıçraması — `splat` 3 frame @ 14 fps, ONCE
```prompt
A pixel-art snowball splat, generate EACH frame separately on a 48x48 px cell, CENTERED,
transparent bg, plays once. Pure white #ffffff with pale-blue #aaccea accents, chunky hard edges:
- Frame 0: small white impact star.
- Frame 1: expanding ring of white snow chunks.
- Frame 2: scattered fading snow specks.
[+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 / kare. **Export:** frameTags `splat` once → `splat0..2`. **Dosya:** `snow_splat.png`+`json`. **Not:** aim imleci (`#4a8fc0`) kod ile kalsın.

---

## 2.4 DURIAN — Fırtınalı sokak (bgStorm, `#8a87b8→#5a5588`)

### Düşen tehlikeler (9) — `🧊🍖🐈⚓🧱🥥🪨📦🍩`
```prompt
A cozy pixel-art set of 9 falling hazard objects, generate each on its own 48x48 px transparent
canvas, object ~40px centered, 4px margins, single object, bold readable silhouette.
Items: (1) pale-cyan ice cube, (2) raw meat chunk on bone, (3) cute startled cat curled
mid-fall, (4) iron ship anchor, (5) red brick, (6) brown coconut, (7) grey rock, (8) cardboard
box, (9) pink-glazed donut with sprinkles. Slightly cartoony comedic hazards. Each reads at ~28px.
[+ GLOBAL SUFFIX]
```
**Boyut:** 48×48 / 28px. **Dosya:** `fall_ice/meat/cat/anchor/brick/coconut/rock/box/donut.png`.

### Can pickup (kalp) — `💖`
```prompt
A pixel-art glossy heart pickup on a 32x32 px transparent canvas, single object ~24px centered.
Plump rounded heart, base #e0473a, highlight #f06a5b, shadow #b53026, one 1px white sparkle
top-left. Bright and inviting. Reads at ~28px. [+ GLOBAL SUFFIX]
```
**Boyut:** 32×32 / 28px. **Palet:** Mogi fiyonk kırmızısı `#e0473a/#f06a5b/#b53026`. **Dosya:** `heart.png`.
**Not:** Bu kırmızı **bilinçli** olarak HUD canından (`--red #e8675a`, bkz. 4.3) farklıdır — pickup = fiyonk-kırmızı, HUD-can = `--red`.

---

## 2.5 TUG — Çamur çukuru çekiş alanı (bgField, çim `#bfe6a8→#92c971`)

### Halat tile (seamless yatay)
```prompt
A pixel-art horizontally-tileable rope segment. Author at 64x32 px (then downscale to 32x16),
transparent bg, rope spanning full width edge-to-edge so it tiles seamlessly left-right.
Thick twisted brown hemp rope, base #8a5a2a, darker twist grooves, lighter fiber highlights,
~12px thick (at 32x16) centered vertically. Left and right edges MUST align for seamless tiling
(AI rarely tiles perfectly — expect to fix the seam manually in Aseprite Tiled Mode). [+ GLOBAL SUFFIX]
```
**Boyut:** 64×32 çiz → 32×16 indir. **Engine:** `createPattern` ile x-tekrar (gerilme YOK), kalınlık `lineWidth:6`'nın 2× referansı. **Dosya:** `rope_tile.png`.

### Orta bayrak — `#e8675a` direk + flama
```prompt
A pixel-art center marker flag on a 32x48 px transparent canvas. A thin vertical pole with a
triangular pennant pointing RIGHT at the top. Pole [POLE=#b9954f], flag bright red-coral
[FLAG=#e8675a] with a single 1px fold-highlight pixel. The pole base sits at the BOTTOM-CENTER
of the canvas (rests on the rope). Pennant ~30px tall. [+ GLOBAL SUFFIX]
```
**Boyut:** 32×48 / flama ~30px, anchor bottom-center. **Dosya:** `tug_flag.png`. **Knob:** `[POLE] [FLAG]`. **Not:** taraf çizgileri (Efe mavi/Mogi pembe) kod ile kalsın.

---

## PROPS — Export Özet Tablosu
| Nesne | Kaynak px | Hedef | Frame | Tag/fps/loop | Export |
|---|---|---|---|---|---|
| Kebab/Rendang (12) | 48×48 | ~27 | 1 | — | düz PNG |
| Junk (4) | 48×48 | ~27 | 1 | — | düz PNG |
| Pot | 64×64 | 36 | 1 | — | düz PNG |
| Buhar | 32×40 | 32 | 3 | steam/6/loop | sheet+json |
| Bomba | 48×48 | 30 | 1 | — | düz PNG |
| Fitil | 16×16 | 16 | 2 | fuse/8/loop | sheet+json |
| **Patlama** | **128×128** | ~180 | 4 | explosion/14/once | sheet+json |
| Kar topu | 24×24 | ~14 | 1 | — | düz PNG |
| Kar sıçrama | 48×48 | 48 | 3 | splat/14/once | sheet+json |
| Düşen tehlike (9) | 48×48 | 28 | 1 | — | düz PNG |
| Kalp | 32×32 | 28 | 1 | — | düz PNG |
| Halat tile | 64×32→32×16 | tile | 1 | seamless | düz PNG |
| Tug bayrak | 32×48 | 30 | 1 | bottom-center | düz PNG |

Tümü → `src/sprites/`. **Not:** bomba/pot/kar topu için engine ek efektleri (kıvılcım, glow halka, stroke) kod ile çizmeye devam eder — sprite'lar "efektsiz gövde" üretilir.

---

# BÖLÜM 3 — HARİTALAR / SAHNELER (5 Sahne, Katmanlı)

Her sahne 4 PNG katman (sky/far/mid/ground) + motorda kod-particle. **Tüm stripler 640 px geniş**; yükseklik: sky 560, far 220, mid 300, ground 120. Hepsi alta hizalı, sol↔sağ dikişsiz. 0.7'deki PixelLab ayarları (view=side, outline/shading, **reference image**) uygulanır; istersen 0.7'deki kısa prompt ekini de yapıştır.

**SAHNE-ÖZEL KURALLAR (kritik):**
- **Sky = posterize:** "vertical gradient" değil → `vertical gradient banded into ~6-8 discrete horizontal color steps (posterized, visible bands, NOT smooth)`.
- **mid kalabalık olmasın:** `arrange 3-4 distinct prop clusters max, with clear empty gaps between them`.
- **Seam kolaylığı:** her katmanda `keep the outer ~24px on left/right edges simple/empty to ease manual seam-fixing`.
- **dither yok:** "highlight dithering" → `a few discrete 1px highlight pixels (hand-placed look), no noise`.
- **1× ölçek çiz** (motor pixelated upscale eder). Sahne paleti karakterlerden biraz desatüre (karakterler okunaklı kalsın).

**Ortak knob:** `[TIME_OF_DAY]` (dawn/midday/golden-hour/dusk/night) · `[SEASON]` (spring/summer/autumn/winter) · `[WEATHER]` (clear/overcast/haze).

---

## 3.1 KEBAB — Cozy Kitchen-Garden Cook-off (ambient: pollen)
```prompt
Pixel art SKY layer, 640x560 px, seamless horizontal tile (left edge matches right). Cozy
[TIME_OF_DAY=golden-hour] garden sky, vertical gradient banded into 6-8 discrete horizontal
color steps (posterized bands, NOT smooth) from warm cream-yellow #f3e3b0 at top to green-tinted
haze #cfe6a8 at bottom, a few rounded pixel clouds #f6efd6. ~16 colors, no ground. [SEASON][WEATHER].
[+ GLOBAL SUFFIX]
```
```prompt
Pixel art FAR parallax layer, 640x220 px, transparent, bottom-anchored, seamless horizontal tile,
outer ~24px of left/right edges kept simple. Distant rolling green hills and a faint tree line,
soft desaturated greens #8fc77a and #7cb866, a hint of a wooden fence silhouette, low contrast.
[+ GLOBAL SUFFIX]
```
```prompt
Pixel art MID layer, 640x300 px, transparent, bottom-anchored, seamless horizontal tile, outer
~24px edges simple. Arrange 3-4 distinct prop clusters max with clear empty gaps between them:
(1) raised wooden planter boxes, (2) a rustic table with a stone cooking hearth, (3) terracotta
pots #c47a4a with climbing tomato vines (red dots #d6604a). Warm woods #a9743a + greens, bold
readable silhouettes. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art GROUND band, 640x120 px, seamless horizontal tile, fully opaque. Top ~70px lush garden
grass posterized #a9dd86 to #7cc35f, bottom ~50px packed warm-earth path #caa86e, scattered grass
tufts #9ad277 and a few 1px pebbles, a thin darker soil seam. [+ GLOBAL SUFFIX]
```
**Particles (motorda kod):** uçuşan polen, sarı `#f6e3a0` 1-3px ayrık noktalar, sparse, yukarı-sağa. Knob `[SEASON=autumn]` → düşen yaprak `#d98b3a`.
**Dosya:** `bg/kebab_sky/far/mid/ground.png`.

## 3.2 DURIAN — Stormy Alley Dodge (ambient: rain)
```prompt
Pixel art SKY layer, 640x560 px, seamless horizontal tile. Overcast purple-grey storm sky,
vertical gradient banded into 6-8 discrete posterized steps (NOT smooth) from #8a87b8 top to
#5a5588 bottom, heavy layered pixel clouds #b6b3d8 and darker #6f6c9c, moody but cozy-stylized
not scary. ~16 cool colors, no rain here. [TIME_OF_DAY=dusk][WEATHER=overcast]. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art FAR parallax layer, 640x220 px, transparent, bottom-anchored, seamless tile, outer
~24px simple. Distant alley rooftops and chimney silhouettes in muted blue-grey #5d5a82, faint
lit windows as tiny warm #d9b56a dots, low contrast hazy backdrop. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art MID layer, 640x300 px, transparent, bottom-anchored, seamless tile, outer ~24px simple.
3-4 clusters max with gaps: (1) brick alley wall #7a6a82 with darker grout, (2) wooden crates +
a dumpster, (3) a faded-teal awning #4f8a86 with a wall lantern (warm glow dot #e0b35a). Slightly
desaturated so falling props stay readable. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art GROUND band, 640x120 px, seamless tile, fully opaque. Cobblestone pavement cool grey
#6b6880 with rain puddles reflecting pale sky #9a97c0 (use a few discrete 1px highlight pixels,
no noise), darker seams between stones, a faint center storm-drain. [+ GLOBAL SUFFIX]
```
**Particles (motorda kod):** eğik yağmur, ince beyaz-mavi `rgba(255,255,255,.22)` çizgiler ~20°. Knob `[WEATHER=clear]` → yağmur kapat, gök `#9a97c8→#6f6ca0`.
**Dosya:** `bg/durian_sky/far/mid/ground.png`.

## 3.3 TNT — Sumo/Dojo Arena (ambient: embers)
```prompt
Pixel art SKY/backdrop layer, 640x560 px, seamless tile. Warm wooden dojo back wall, vertical
gradient banded into 6-8 discrete posterized steps from lantern-lit cream #f0dcb0 top to warm
tan #d8b884 lower, faint shoji panel grid #e8d5ad, gentle paper-lantern glow spots #f2c878.
~18 warm colors, no floor. [TIME_OF_DAY=golden-hour]. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art FAR parallax layer, 640x220 px, transparent, bottom-anchored, seamless tile, outer
~24px simple. Distant dojo details: hanging banners muted red #b5564a + cream, a row of round
paper lanterns with warm glow #e8b34a, wooden beam framing #a9743a, low contrast. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art MID layer, 640x300 px, transparent, bottom-anchored, seamless tile, outer ~24px simple.
3-4 clusters max with gaps: (1) thick wooden ring border frame #a9743a with darker grain,
(2) stacked straw rice bales #e3c98a, (3) a couple of standing wooden barrels + a folded mat.
[+ GLOBAL SUFFIX]
```
```prompt
Pixel art GROUND band (dojo sand floor), 640x120 px, seamless tile, fully opaque. Raked sandy
clay posterized #e6c79a to #cba36e, with faint diagonal rake lines as discrete 1px white pixels
(~10% feel, no noise), a darker swept ring-edge seam near the top. [+ GLOBAL SUFFIX]
```
**Particles (motorda kod):** yükselen kıvılcım/toz, turuncu `#ff7a3a`/`#ff5a3a` 1-2px ayrık noktalar yukarı. Knob `[TIME_OF_DAY=night]` → fenerleri parlat, duvar `#c9a878→#9a7a52`.
**Dosya:** `bg/tnt_sky/far/mid/ground.png`.

## 3.4 SNOW — Winter Clearing Snowball (ambient: snow; mevsim kilitli winter)
```prompt
Pixel art SKY layer, 640x560 px, seamless tile. Crisp cold winter sky, vertical gradient banded
into 6-8 discrete posterized steps from pale icy white-blue #dff1fb top to soft sky blue #a9d4ec
bottom, a few thin pale clouds #f3fbff. ~14 cool colors, no snow falling here.
[TIME_OF_DAY=midday]. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art FAR parallax layer, 640x220 px, transparent, bottom-anchored, seamless tile, outer
~24px simple. Distant snowy pine forest line, rounded snow-capped evergreens cool green #6f8f7a
dusted with snow #f3fbff, faint blue shadow, low contrast. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art MID layer, 640x300 px, transparent, bottom-anchored, seamless tile, outer ~24px simple.
3-4 clusters max with gaps: (1) a few snow-laden pine trees, (2) a small wooden cabin with warm
window glow #f0bd55 and a smoking chimney, (3) a stacked snow-fort wall + a half-buried fence.
White-blue palette with warm accent windows. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art GROUND band, 640x120 px, seamless tile, fully opaque. Soft rolling snow mounds #f3fbff
with cool blue shadow dips #d2e6f2, a few footprints and small snow tufts, a few discrete 1px
sparkle highlight pixels (no noise). [+ GLOBAL SUFFIX]
```
**Particles (motorda kod):** yağan kar, beyaz `#ffffff` 1-3px ayrık noktalar (~%70 his, sabit opaklık basamağı) hafif çapraz aşağı. Knob `[TIME_OF_DAY=dusk]` → gök `#d6c9ec→#9aa8d0`.
**Dosya:** `bg/snow_sky/far/mid/ground.png`.

## 3.5 TUG — Field Mud-Pit Tug-of-War (ambient: pollen)
```prompt
Pixel art SKY layer, 640x560 px, seamless tile. Bright cheerful [TIME_OF_DAY] countryside sky,
vertical gradient banded into 6-8 discrete posterized steps from clear sky blue #9fd0ea top to
warm pale green-cream #e3f0c8 near horizon, a few big soft clouds #fbfdf6. ~16 colors, no ground.
[SEASON=summer][WEATHER=clear]. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art FAR parallax layer, 640x220 px, transparent, bottom-anchored, seamless tile, outer
~24px simple. Distant gentle green meadow hills, a far tree line and a tiny barn/windmill
silhouette, soft desaturated greens #9ec97e and #84b566, low contrast. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art MID layer, 640x300 px, transparent, bottom-anchored, seamless tile, outer ~24px simple.
3-4 clusters max with gaps, framing the sides with an OPEN clear center (mud pit goes there):
(1) leafy bushes + small trees, (2) wooden fence posts, (3) festival bunting flags overhead in
warm tones #e8675a #f0bd55 #7fb89a + a couple of hay bales #e3c98a. No rope. [+ GLOBAL SUFFIX]
```
```prompt
Pixel art GROUND band, 640x120 px, seamless tile, fully opaque. Lush green grass posterized
#bfe6a8 to #92c971 on the outer parts, a churned wet mud-pit strip across the center-bottom
#caa86e with darker squishy notches #b9954f and a few 1px puddle highlights. Grass tufts at edges.
No rope. [+ GLOBAL SUFFIX]
```
**Particles (motorda kod):** hafif polen/sinek, `#f6e3a0` 1-2px ayrık noktalar, çok sparse. Knob `[SEASON=autumn]` → çim `#cdb87a→#a89a5a`, bunting kapat.
**Dosya:** `bg/tug_sky/far/mid/ground.png`. **Not:** halat + orta bayrak motorda/sprite ile (2.5), BG'de YOK.

---

## SAHNE — İçe Aktarma Özeti
20 PNG → `src/sprites/bg/`: `{kebab,durian,tnt,snow,tug}_{sky,far,mid,ground}.png`. Genişlik 640; yükseklik sky 560 / far 220 / mid 300 / ground 120. Particle katmanları motorda kod ile. İlgili kaynak: `src\main.js` satır 276-282 (`bgGrad`, `seededProps`, `bgGarden/Storm/Arena/Snow/Field`).

---

# BÖLÜM 4 — UI SANATI

> **Tema kuralı:** UI 3 temada (Wood/Pastel/Night) CSS `:root` ile yeniden renklenir. Bu yüzden çoğu parça **NÖTR / TINTLENEBİLİR** (saf grayscale, `R=G=B`, hiç hue yok) çizilir; engine `tint` ile temaya uydurur. Hangi parçanın nötr, hangisinin sabit-marka rengi olduğu her promptta yazıyor.
> **GOLD ailesi (0.2):** base `#e8b34a`, shade `#c98e2e`, highlight `#f3cf78`.
> 0.7'deki PixelLab ayarları (view=side, outline/shading, **reference image**) uygulanır; istersen 0.7'deki kısa prompt ekini de yapıştır.

---

## 4.1 9-SLICE BUTON ÇERÇEVESİ

**Boyut:** 48×24 tile · köşe slice 8×8 · kenar 8px · orta dolgu 32×8 (esner) · alt 3px "lift" gölge bandı · köşe yarıçapı ~6px.
**Aseprite 9-slice:** Slice aracı (Shift+C) ile tüm canvas'ı kapla → çift tık → "9-Slices" ON → Center: sol 8 / üst 8 / sağ 8 / alt 11 (lift bandı dahil). Düz PNG export.
**Kritik:** orta dolgu **DÜZ TEK RENK** olmalı (gradient YOK), yoksa stretch'te bantlaşır; bevel sadece 1px üst-açık + 1px alt-koyu kenar.

```prompt
# BUTTON 9-SLICE — GOLD (primary)
Pixel art UI button frame, 9-slice, 48x24 px, transparent bg. Rounded rectangle ~6px corner
radius, clean 1px dark outline. The top face is ONE flat solid color [BASE=#e8b34a]; the bevel
is ONLY a 1px lighter top edge [HI=#f3cf78] and 1px darker bottom edge — NO gradient across the
fill. Bottom 3px is a darker "lift" shadow band [LIFT=#c98e2e] for a chunky 3D block. Center area
stays flat/uniform so it stretches cleanly. [+ GLOBAL SUFFIX]
```
**Palet:** gold ailesi. **Knob:** `[BASE][HI][LIFT][RADIUS=6][TILE=48x24]`.

```prompt
# BUTTON 9-SLICE — ROSE (alt)
Same 48x24 9-slice spec, recolored rose. Top face ONE flat color [BASE=#e09aa2], 1px top
highlight [HI=#eaaab1], 1px dark bottom edge, bottom 3px lift band [LIFT=#93505a], 1px dark
outline. Flat uniform center, NO gradient. [+ GLOBAL SUFFIX]
```
**Knob:** `[BASE=#e09aa2][HI=#eaaab1][LIFT=#93505a]`.

```prompt
# BUTTON 9-SLICE — MINT (cool)
Same 48x24 9-slice spec, recolored mint/teal. Top face ONE flat color [BASE=#7fb89a], 1px top
highlight [HI=#9fd0b8], bottom 3px lift band [LIFT=#3e6e58], 1px dark outline. Flat uniform
center, NO gradient. [+ GLOBAL SUFFIX]
```
**Knob:** `[BASE=#7fb89a][HI=#9fd0b8][LIFT=#3e6e58]`.

```prompt
# BUTTON 9-SLICE — GHOST (neutral, MUST BE TINTABLE)
Same 48x24 9-slice spec but PURE GRAYSCALE only (R=G=B on every pixel, absolutely no hue) so the
engine tints it per theme. Top face ONE flat mid-gray [#c0c0c0], 1px white top edge [#ffffff],
bottom 3px lift band [#909090], 1px dark-gray outline [#5a5a5a]. NO gradient across the fill.
[+ GLOBAL SUFFIX]
```
**Not:** ghost mutlaka grayscale+tint (kart rengi temalar arası çok değişir). Tutarlılık için gold/rose/mint de grayscale yapıp tint'leyebilirsin.
**Dosya:** `btn_gold/rose/mint/ghost.png`.

---

## 4.2 9-SLICE PANEL / KART

**Boyut:** 64×64 tile · köşe 16×16 · kenar 16px · orta 32×32 (esner) · köşe yarıçapı ~12px. **Aseprite:** Center her kenardan 16px.

```prompt
# PANEL 9-SLICE — CARD (NEUTRAL / TINTABLE)
Pixel art UI panel/card frame, 9-slice, 64x64 px, transparent bg. Rounded rectangle ~12px corner
radius. 2px outer dark outline [#5a5a5a], a 1px lighter inner highlight (top/left) [#eeeeee], a
1px inner shadow (bottom/right) [#8a8a8a] for a soft inset feel. PURE GRAYSCALE only (R=G=B, no
hue) so engine tints to theme card color. Center filled with a FLAT uniform mid-gray [#bdbdbd] so
it stretches cleanly. Corner slices 16x16, edges 16px, center 32x32. [+ GLOBAL SUFFIX]
```
**Knob:** `[CORNER=16][RADIUS=12][FILL=#bdbdbd][OUTLINE=#5a5a5a]`. **Dosya:** `panel.png`.

Opsiyonel ahşap-dokulu (Wood'a sabit, tint'siz):
```prompt
# PANEL 9-SLICE — WOOD CARD (baked, optional)
Same 64x64 9-slice spec, baked warm-wood look (no tinting). Card fill warm brown #5a4530 with
faint 2px horizontal plank lines #6a5236, border #6a5236, inner shadow #33271a, a faint 1px cream
inner highlight #f1e3c6. Center stays flat enough to stretch. [+ GLOBAL SUFFIX]
```
**Dosya:** `panel_wood.png`.

---

## 4.3 HUD — Kalp / Pip / Skor plakası

```prompt
# HUD HEART — FULL & EMPTY (generate as 2 separate 16x16 files)
Pixel art heart icon, 16x16 px, transparent bg. At this size use at most 3 colors per state.
FULL: rounded chunky heart, base red #e8675a, 1px darker outline #b53026, ONE 1px white highlight
pixel top-left. EMPTY: same silhouette, hollow — outline only #5a4630, interior transparent,
reads clearly as "lost life". [+ GLOBAL SUFFIX]
```
**Boyut:** 16×16. **Palet:** FULL = sabit `--red #e8675a`; EMPTY = nötr `#5a4630` (tint'lenebilir). **Dosya:** `heart_full.png`, `heart_empty.png`. **Not:** Bu kırmızı durian kalbinden (`#e0473a`, bkz. 2.4) bilinçli farklıdır.

```prompt
# HUD PIP — ON & OFF (generate as 2 separate 12x12 files)
Pixel art rounded-square progress pip, 12x12 px, ~3px corner radius, transparent bg, at most 3
colors. ON: green fill #5fc28a, 1px light edge #bdf0d2, ONE 1px top highlight. OFF: empty slot
fill #5a4630, 1px dark outline #33271a, slightly inset look. [+ GLOBAL SUFFIX]
```
**Boyut:** 12×12. **Palet:** ON = sabit `--green #5fc28a`; OFF = nötr (tint). **Dosya:** `pip_on.png`, `pip_off.png`.

```prompt
# HUD SCORE PLATE (NEUTRAL / TINTABLE)
Pixel art small score plate to sit behind a number, 40x20 px, transparent bg. Rounded pill ~8px
radius, 1px outline, a subtle 1px top highlight + 1px bottom shade for a pressed-token look.
PURE GRAYSCALE only (R=G=B, no hue) so engine tints to the gold family. Flat mid-gray fill
#cccccc, outline #5a5a5a. Optional 9-slice (corner 8, center stretchable). [+ GLOBAL SUFFIX]
```
**Boyut:** 40×20 (ops. 9-slice köşe 8). **Palet:** nötr, engine `--gold` tint. **Dosya:** `scoreplate.png`.

---

## 4.4 OYUN KATEGORİ İKONLARI (9) + Sistem ikonları

**Boyut:** 32×32 çizim, ~2px iç padding, ortalanmış, 1px outline, **16px'e küçülünce de okunur**. Her ikon: TEK belirgin merkez özne, en çok 2-3 detay rengi, net silüet.

```prompt
# GAME ICON — QUIZ
32x32 px pixel art icon, ONE bold central subject readable at 16px. A quiz card/speech-bubble
with a bold "?": cream card #f1e3c6, gold question mark #e8b34a outlined #c98e2e. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — KEBAB
32x32 px icon, ONE bold central subject readable at 16px. A cozy stew pot (body #8a6a44, rim
#b08850) with a single skewer leaning on it (meat #b56a55, one tomato #e8675a). Max 2-3 detail
colors. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — TTT
32x32 px icon, readable at 16px. A 3x3 grid (lines #6a5236) with one blue X #7fb4f0 and one rose
O #ef93ab (Efe-X / Mogi-O colors). [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — DURIAN
32x32 px icon, ONE bold subject readable at 16px. A spiky durian fruit (husk green #7cc35f,
spikes #5a8a3a, shade #4a7030) falling, with 2 short slanted white rain streaks. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — TNT
32x32 px icon, ONE bold subject readable at 16px. A round dark bomb (#2a2a30, highlight #5a6070)
with a small lit fuse spark (#ff5a3a core, #ffc94d) on top. Friendly, not scary. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — SNOW
32x32 px icon, ONE bold subject readable at 16px. A white snowball (#ffffff, shade #aaccea)
mid-throw with a small motion arc, cold-blue accent. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — TUG
32x32 px icon, readable at 16px. A taut brown rope (#8a5a2a) with a center red flag (pole #b9954f
+ triangle #e8675a). [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — MEMORY
32x32 px icon, readable at 16px. Two overlapping cards: one face-down (peach back #d6a05a) and
one face-up showing a tiny star #e8b34a. Max 2-3 detail colors. [+ GLOBAL SUFFIX]
```
```prompt
# GAME ICON — SIMON
32x32 px icon, readable at 16px. A 2x2 pad of the four Simon colors (red #e8675a, green #5fc28a,
blue #7fb4f0, gold #ffc94d), one pad lit/brighter. Rounded. [+ GLOBAL SUFFIX]
```
**Boyut:** her biri 32×32. **Palet:** prop renkli (sahne kimliğiyle eşleşir; gold = `#e8b34a`). **Not:** TTT-X ve Simon mavisi ortak `#7fb4f0`'a hizalandı. **Dosya:** `ico_quiz/kebab/ttt/durian/tnt/snow/tug/memory/simon.png`.

```prompt
# UI ICON — SETTINGS (gear)
24x24 px pixel art 6-tooth cog with a center hole, ONE bold subject readable at 16px and smaller.
PURE GRAYSCALE only (R=G=B, no hue) so engine tints to --ink per theme. Flat light-gray #dddddd,
outline #888888. [+ GLOBAL SUFFIX]
```
```prompt
# UI ICON — QUIT / EXIT
24x24 px pixel art quit icon (rounded X in a circle), readable at 16px. PURE GRAYSCALE only
(R=G=B, no hue) for tinting to --ink. Flat light-gray #dddddd, outline #888888. Friendly, not
alarming. [+ GLOBAL SUFFIX]
```
**Boyut:** 24×24. **Palet:** nötr, engine `--ink` tint. **Dosya:** `ico_settings.png`, `ico_quit.png`. **Not:** topbar `.ic` yuvarlak zemin + lift CSS'ten gelir; ikonu sadece glyph çiz.

---

## 4.5 BAŞLIK WORDMARK — "EFE & MOGI / SHOWDOWN"

**Boyut:** 240×160 (3:2, `#titleCv` oranı). İki satır: üst "EFE & MOGI" büyük, alt "SHOWDOWN" altın banner.
> ⚠️ **AI metni güvenilir yazamaz** — bu wordmark'ı Aseprite'ta **pixel font ile elle** kurmak çok daha güvenli. Bu promptu yalnızca **stil referansı** (renk/outline/banner şekli) için kullan, harfleri elle yaz.

```prompt
# TITLE WORDMARK — "EFE & MOGI / SHOWDOWN" (STYLE REFERENCE — retype letters by hand)
Pixel art game title logo, 240x160 px, transparent bg, two stacked centered lines.
NOTE: AI renders text unreliably — use this only for style/color/banner-shape reference, then
build the actual letters by hand in Aseprite with a pixel font.
Line 1 (big): "EFE & MOGI" in a chunky rounded pixel display style, gold letters
[FACE=#e8b34a, top highlight #f3cf78, shade #c98e2e], thick 2px dark-brown outline [#4a3015],
a 2px down-right drop shadow [#7a4e16]. The "&" reads as a small red heart [#e8675a].
Line 2 (banner): "SHOWDOWN" on a rounded gold ribbon [base #e8b34a, shade #c98e2e, outline
#4a3015], smaller, letters in dark brown [#3a2408] knocked out of the gold.
Optional flair (only if still legible at small size): tiny round glasses [#fbf7ef] on the first
"E" (Efe) and a small red bow [#e0473a] on the "M" (Mogi). Limited ~8 colors, no glow.
[+ GLOBAL SUFFIX]
```
**Boyut:** 240×160. **Palet:** sabit gold ailesi + outline `#4a3015` + drop `#7a4e16`. **Knob:** `[TXT1][TXT2][FACE][AMPERSAND=heart]`. **Dosya:** `title.png` (+ ops. `title_night.png` parlatılmış). **Not:** wordmark sabit-marka renkli, temalar arası değişmez.

---

## UI — Dışa Aktarım Özet Tablosu
| Varlık | Çizim px | 9-slice | Renk | Dosya (`src/sprites/`) |
|---|---|---|---|---|
| Buton gold/rose/mint | 48×24 | Evet (köşe 8) | sabit (ya da tint) | `btn_gold/rose/mint.png` |
| Buton ghost | 48×24 | Evet | **nötr/tint** | `btn_ghost.png` |
| Panel/kart | 64×64 | Evet (köşe 16) | **nötr/tint** | `panel.png` (+ `panel_wood.png`) |
| Kalp full/empty | 16×16 | Hayır | full=sabit `--red`, empty=nötr | `heart_full/empty.png` |
| Pip on/off | 12×12 | Hayır | on=sabit `--green`, off=nötr | `pip_on/off.png` |
| Skor plakası | 40×20 | Ops. (köşe 8) | **nötr/tint gold** | `scoreplate.png` |
| Oyun ikonu ×9 | 32×32 | Hayır | prop renkli | `ico_*.png` |
| Settings / Quit | 24×24 | Hayır | **nötr/tint** | `ico_settings/quit.png` |
| Title wordmark | 240×160 | Hayır | sabit gold | `title.png` (+ ops. `title_night.png`) |

İlgili kaynak: `src\styles.css` (satır 4 `--gold #e8b34a` / `--green #5fc28a` / `--red #e8675a`; 77-78 pip), `src\main.js` (satır 18-20 THEMES; 379 SIMCOL).

---

## KAPANIŞ — Tüm dosya hedefleri (`src/sprites/`)
- **Karakterler:** `efe.png`+`efe.json`, `mogi.png`+`mogi.json` (8 tag, By Rows/Trim OFF/Hash/frameTags/`{tag}{frame}`); `_base/efe.png`+`_base/mogi.png`.
- **Props (statik düz PNG):** kebab/rendang ×12, junk ×4, `pot`, `bomb`, `snowball`, `heart`, fall ×9, `rope_tile`, `tug_flag`.
- **Props (çok-kareli sheet+json):** `steam`, `fuse`, `explosion`, `snow_splat`.
- **Sahneler:** `bg/{kebab,durian,tnt,snow,tug}_{sky,far,mid,ground}.png` (20 PNG); particles motorda kod.
- **UI:** `btn_{gold,rose,mint,ghost}.png`, `panel.png` (+`panel_wood.png`), `heart_{full,empty}.png`, `pip_{on,off}.png`, `scoreplate.png`, `ico_*.png` (9 oyun + settings + quit), `title.png` (+`title_night.png`).
- **Palet:** `efemogi.gpl` (0.2).

Tüm yapısal kontrat (64×96 / anchor bottom-center / By Rows / Trim OFF / Hash+frameTags / `{tag}{frame}` / 640px stripler / posterize-no-gradient / pure-grayscale-tint) tutarlı ve Aseprite-hazır.