"use strict";
import path from "path";
import {app, BrowserWindow, Menu, Tray} from "electron";

let tray = null;
let mainWindow = null;
app.on("ready", () => {

  mainWindow = new BrowserWindow({
    "width": 600, "height": 400,
    "frame": false,
    "resizable": false,
    "show": false,
    "skip-taskbar": true,
    useContentSize: true
  });
  mainWindow.loadURL("file://" + path.join(__dirname, "../proto/opening_screen.html"));

  mainWindow.on("blur", () => mainWindow.hide());

  tray = new Tray(path.join(__dirname, "../proto/assets/icon-win.png"));

  const ctxMenu = Menu.buildFromTemplate([
    {
      label: "exit",
      click: () => app.quit()
    }
  ]);
  tray.setToolTip(app.getName());

  tray.on("click", () => {
    toggleWindow();
  });

  tray.on("right-click", () =>{
    tray.popUpContextMenu(ctxMenu);
  });


});

const getWindowPosition = () => {
  const windowBounds = mainWindow.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  // const y = Math.round(trayBounds.y + trayBounds.height + 4)
  const y = Math.round(trayBounds.y - windowBounds.height - 4)

  return {x: x, y: y}
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  mainWindow.setPosition(position.x, position.y, false)
  mainWindow.show()
  mainWindow.focus()
}
