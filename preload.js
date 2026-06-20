// Exposes safe desktop-window + updater controls to the game (renderer).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  version: (() => { try { return ipcRenderer.sendSync('get-version'); } catch (e) { return null; } })(),
  setFullscreen: (on) => ipcRenderer.send('win-fullscreen', !!on),
  toggleFullscreen: () => ipcRenderer.send('win-toggle-fullscreen'),
  maximize: () => ipcRenderer.send('win-maximize'),
  windowed: () => ipcRenderer.send('win-windowed'),
  onFullscreen: (cb) => ipcRenderer.on('win-fs-state', (e, on) => cb(!!on)),
  restart: () => ipcRenderer.send('do-restart'),
  onUpdate: {
    available: (cb) => ipcRenderer.on('update-available', (e, v) => cb(v)),
    progress: (cb) => ipcRenderer.on('update-progress', (e, p) => cb(p)),
    ready: (cb) => ipcRenderer.on('update-downloaded', (e, v) => cb(v)),
    none: (cb) => ipcRenderer.on('update-none', () => cb())
  }
});
