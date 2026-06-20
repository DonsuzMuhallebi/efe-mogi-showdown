// Exposes safe desktop-window controls to the game (renderer).
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  setFullscreen: (on) => ipcRenderer.send('win-fullscreen', !!on),
  toggleFullscreen: () => ipcRenderer.send('win-toggle-fullscreen'),
  setSize: (w, h) => ipcRenderer.send('win-size', { w: w | 0, h: h | 0 })
});
