const { app, BrowserWindow, Tray, Menu } = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path');
let mainWindow = null;
let tray = null;

const autoLauncher = new AutoLaunch({
  name: 'FNEvent',
  path: app.getPath('exe'),
});


app.whenReady().then(() => {

  autoLauncher.enable().catch((err) => {
    console.error('AutoLaunch error:', err);
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
  mainWindow.loadFile('index.html');




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
    { label: '終了', click: () => {
        app.isQuitting = true;
        app.quit();
      }
    },
  ]);
  tray.setToolTip('MyElectronApp');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow.show();
  });
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