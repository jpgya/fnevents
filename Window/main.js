const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs').promises;
const remoteMain = require('@electron/remote/main'); 
remoteMain.initialize(); 
let win;

app.on("ready",async()=>{
    win = new BrowserWindow({
            width: 800,
            height: 600,
            icon: 'icon.png',//アイコン★
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
                
            },
            
        });
})


/*
まだ未完成のため、`npm sart`を実行してもエラーを吐きます💀
*/