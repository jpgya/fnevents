const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');
let mainWindow = null;
let tray = null;

const autoLauncher = new AutoLaunch({
  name: 'FNEvent',
  path: app.getPath('exe'),
});


function showErrorPage() {
  if (mainWindow) {
    mainWindow.loadFile('error.html').catch((err) => {
      console.error('Failed to load error.html:', err);
    });
  }
}

app.whenReady().then(() => {
  autoLauncher.enable().catch((err) => {
    console.error('AutoLaunch error:', err);
    showErrorPage();
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile('index.html').catch((err) => {
    console.error('Failed to load index.html:', err);
    showErrorPage();
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process crashed:', details);
    showErrorPage();
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Web contents unresponsive');
    showErrorPage();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
    showErrorPage();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  tray = new Tray(path.join(__dirname, 'icon.png')); //莉音へ　：　忘れないために書きます。ここにアイコンの正しいパスに置き換えてね
  const contextMenu = Menu.buildFromTemplate([
    { label: 'アプリを表示', click: () => mainWindow.show() },
    {
      label: '終了',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip('MyElectronApp');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
});

ipcMain.on('error-in-renderer', (event, error) => {
  console.error('Error in renderer process:', error);
  showErrorPage();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in main process:', err);
  showErrorPage();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    return;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});