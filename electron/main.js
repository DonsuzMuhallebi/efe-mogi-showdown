// Electron main process — desktop window + auto-update + display controls.
// The renderer is built by Vite (npm run build → dist/). In dev it loads the Vite dev server
// when VITE_DEV_SERVER_URL is set; otherwise it loads the built dist/index.html.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 420,
    minHeight: 360,
    title: 'Efe & Mogi — Showdown',
    backgroundColor: '#241a0e',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) win.loadURL(devUrl);
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  win.maximize(); // fill the screen by default
  // Start the update check only once the game UI is ready to receive events.
  win.webContents.once('did-finish-load', startUpdates);
  // Report true fullscreen state so the in-game Display highlight stays correct (F11 / OS changes).
  win.on('enter-full-screen', () => { if (win) win.webContents.send('win-fs-state', true); });
  win.on('leave-full-screen', () => { if (win) win.webContents.send('win-fs-state', false); });
}

// Auto-update wired to the in-game card: stream availability + progress + ready + none.
function startUpdates() {
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.on('update-available', (info) => { if (win) win.webContents.send('update-available', info && info.version); });
    autoUpdater.on('download-progress', (p) => { if (win) win.webContents.send('update-progress', p); });
    autoUpdater.on('update-downloaded', (info) => { if (win) win.webContents.send('update-downloaded', info && info.version); });
    // No update / offline-ish error: tell the renderer we're done checking so the boot splash can dismiss.
    autoUpdater.on('update-not-available', () => { if (win) win.webContents.send('update-none'); });
    autoUpdater.on('error', () => { if (win) win.webContents.send('update-none'); });
    autoUpdater.checkForUpdates();
  } catch (e) { /* offline / dev — ignore */ }
}

// Display controls from the in-game settings.
ipcMain.on('win-fullscreen', (e, on) => { if (win) win.setFullScreen(on); });
ipcMain.on('win-toggle-fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.on('win-maximize', () => { if (!win) return; win.setFullScreen(false); win.maximize(); });
ipcMain.on('win-windowed', () => { if (!win) return; win.setFullScreen(false); win.unmaximize(); win.center(); });

// Expose the installed app version to the in-game version label.
ipcMain.on('get-version', (e) => { e.returnValue = app.getVersion(); });
// "Restart now" button in the in-game update card.
ipcMain.on('do-restart', () => {
  try { autoUpdater.quitAndInstall(); }
  catch (e) { app.relaunch(); app.exit(0); }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
