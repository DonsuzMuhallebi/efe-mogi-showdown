// Electron main process — desktop window + auto-update + display controls.
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
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
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
  win.maximize(); // fill the screen by default
}

// Display controls from the in-game settings.
ipcMain.on('win-fullscreen', (e, on) => { if (win) win.setFullScreen(on); });
ipcMain.on('win-toggle-fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.on('win-size', (e, { w, h }) => {
  if (!win || !w || !h) return;
  win.setFullScreen(false);
  win.unmaximize();
  win.setSize(w, h);
  win.center();
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Auto-update: check GitHub releases on launch, download, offer restart.
  try {
    autoUpdater.autoDownload = true;
    autoUpdater.on('update-downloaded', (info) => {
      const r = dialog.showMessageBoxSync(win, {
        type: 'info',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update ready 💞',
        message: 'A new version (' + ((info && info.version) || '') + ') is ready. Restart to update?'
      });
      if (r === 0) autoUpdater.quitAndInstall();
    });
    autoUpdater.checkForUpdatesAndNotify();
  } catch (e) { /* offline / dev — ignore */ }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
