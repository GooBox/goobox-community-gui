"use strict";
import path from "path";
import { app, ipcMain, BrowserWindow } from "electron";

app.on("ready", () => {

    const mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        useContentSize: true,
        resizable: false,
        fullscreenable: false
    });
    mainWindow.loadURL("file://" + path.join(__dirname, "../static/opening_screen.html"));

    app.on("window-all-closed", () => {
        app.quit();
    });

});
