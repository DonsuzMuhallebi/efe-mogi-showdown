# Efe & Mogi — Showdown 💞

A silly little duel for two — an online party game (best-of tournament of mini-games,
dare cards, emotes) built as a gift for Efe & Mogi. Plays as a Windows desktop app
with in-app auto-updates.

## Stack

- **Vanilla JS** game in `src/` (ES modules), bundled by **Vite**
- **Electron** desktop shell + **electron-updater** for in-app auto-updates
- Packaged & published with **electron-builder** (small `nsis-web` web installer)
- P2P multiplayer over **PeerJS** (4-letter room code, no server)

## Project structure

```
EfeMogiShowdown/
├── index.html            # Vite entry: <head> + game markup + module script
├── vite.config.js        # renderer build (base:'./' for file:// in Electron)
├── package.json          # scripts + electron-builder config
├── src/                  # renderer (the game)
│   ├── main.js           #   core: themes, i18n logic, screens, networking, games, UI, boot
│   ├── styles.css        #   all styles (cqmin units, theme CSS vars)
│   ├── i18n.js           #   STR translation table (EN / TR / ID)
│   ├── audio.js          #   Sound — WebAudio SFX + music engine
│   └── characters.js     #   procedural Efe/Mogi sprites + canvas draw helpers
├── electron/
│   ├── main.js           # main process: window, auto-update, display modes, IPC
│   └── preload.js        # contextBridge → window.desktop
├── assets/               # icon.png / icon.ico (app + installer icons)
├── build/installer.nsh   # NSIS custom install dir + shortcut
├── dist/                 # Vite build output (gitignored)
└── release/              # electron-builder installers (gitignored)
```

## Develop

```bash
npm install
npm run dev      # Vite dev server in the browser — fast UI iteration
npm start        # build the renderer then launch the Electron app
```

## Build & release

```bash
npm run pack     # build + package the installer locally (no upload) → release/
npm run publish  # build + package + publish a GitHub release (the auto-update feed)
```

`npm run publish` needs `GH_TOKEN` in the environment. **Bump `version` in
`package.json` before publishing** — installed apps auto-update to the newest release.

## Gameplay

Best-of tournament (first to 3 by default) of random mini-games — quiz, kebab-vs-rendang,
tic-tac-toe, falling chaos, TNT tag, snowball, tug-of-war, memory, simon. Loser draws a
dare card. One player CREATEs a room (gets a 4-letter code), the other JOINs with it.
Settings ⚙ cover sound, theme, language (EN/TR/ID) and (desktop) display mode.
