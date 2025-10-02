const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');

let mainWindow = null;
let tray = null;
let isErrorPageLoaded = false;

app.setPath('cache', path.join(__dirname, 'cache')); 

const autoLauncher = new AutoLaunch({
  name: 'FNEvent',
  path: app.getPath('exe'),
});

function createWindow() {
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
  mainWindow.loadFile(path.join(__dirname, 'serverstatus.html')).catch((err) => {
    console.error('Failed to load Status.html:', err);
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
}

function showErrorPage() {
  if (mainWindow && !isErrorPageLoaded) {
    isErrorPageLoaded = true;
    mainWindow.loadFile(path.join(__dirname, 'error.html')).catch((err) => {
      console.error('Failed to load error.html:', err);
      isErrorPageLoaded = false;
      mainWindow.webContents.executeJavaScript('alert("エラーが発生しました。");');
    });
  }
}

app.whenReady().then(() => {
  autoLauncher.enable().catch((err) => {
    console.error('AutoLaunch error:', err);
    showErrorPage();
  });

  createWindow();

  tray = new Tray(path.join(__dirname, 'icon.png'));
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
  tray.setToolTip('FNEvent');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
});

ipcMain.on('restart-app', () => {
  app.relaunch();
  app.exit();
});

ipcMain.on('open-discord', () => {
  require('electron').shell.openExternal('https://discord.gg/QKjdjb8rnh');
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
    app.quit();
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