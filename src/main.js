"use strict";
import path from "path";
import {app, BrowserWindow, Menu, Tray} from "electron";
import menubar from "menubar";

const mb = menubar({
  index: "file://" + path.join(__dirname, "../proto/opening_screen.html"),
  icon: path.join(__dirname, "../proto/assets/icon-win.png"),
  tooltip: app.getName(),
  preloadWindow: true,
  width: 600,
  height: 400,
});

mb.on("ready", () => {

  const ctxMenu = Menu.buildFromTemplate([
    {
      label: "exit",
      click: () => app.quit()
    }
  ]);

  mb.tray.on("right-click", () =>{
    mb.tray.popUpContextMenu(ctxMenu);
  });

});
