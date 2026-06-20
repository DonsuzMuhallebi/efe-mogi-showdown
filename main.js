// Electron main process — wraps the game in a desktop window + auto-update.
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 540,
    height: 800,
    minWidth: 380,
    minHeight: 560,
    title: 'Efe & Mogi — Showdown',
    backgroundColor: '#241a0e',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Auto-update: on launch, check GitHub releases, download, then offer restart.
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
