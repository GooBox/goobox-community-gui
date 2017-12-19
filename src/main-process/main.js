/*
 * Copyright (C) 2017 Junpei Kawamoto
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
import os from "os";
import path from "path";
import {spawn} from "child_process";

import {app, Menu, ipcMain} from "electron";
import menubar from "menubar";
import semver from "semver";

import {ChangeStateEvent, OpenSyncFolderEvent, Synchronizing, Paused} from "../constants";

const DefaultSyncFolder = path.join(app.getPath("home"), app.getName());

let idleIcon, syncIcon, pausedIcon, errorIcon;
let openDirectory;
if (process.platform === 'darwin') {
  // mac
  idleIcon = path.join(__dirname, "../../resources/mac/idle.png");
  syncIcon = path.join(__dirname, "../../resources/mac/sync.png");
  pausedIcon = path.join(__dirname, "../../resources/mac/paused.png");
  errorIcon = path.join(__dirname, "../../resources/mac/error.png");

  openDirectory = (path) => {
    spawn("open", [path]);
  }

} else {

  // windows
  let version = os.release();
  if (version.split('.').length === 2) {
    version += '.0';
  }

  if (semver.satisfies(version, '<6.2')) {
    // windows7 or older.
    idleIcon = path.join(__dirname, "../../resources/win/idle.png");
    syncIcon = path.join(__dirname, "../../resources/win/sync.png");
    pausedIcon = path.join(__dirname, "../../resources/win/paused.png");
    errorIcon = path.join(__dirname, "../../resources/win/error.png");
  } else {
    // windows8 or later.
    idleIcon = path.join(__dirname, "../../resources/win/idle.png");
    syncIcon = path.join(__dirname, "../../resources/win/sync.png");
    pausedIcon = path.join(__dirname, "../../resources/win/paused.png");
    errorIcon = path.join(__dirname, "../../resources/win/error.png");
  }

  openDirectory = (path) => {
    spawn("cmd", ["/C", "start " + path]);
  }

}


const mb = menubar({
  index: "file://" + path.join(__dirname, "../../static/popup.html"),
  icon: idleIcon,
  tooltip: app.getName(),
  preloadWindow: true,
  width: 518,
  height: 400,
  alwaysOnTop: true,
  showDockIcon: false,
});

mb.on("ready", () => {

  const ctxMenu = Menu.buildFromTemplate([
    {
      label: "exit",
      click: () => app.quit()
    }
  ]);

  const onClick = mb.tray.listeners("click")[0];
  let singleClicked = false;
  mb.tray.removeAllListeners("click");
  mb.tray.on("click", (e, bounds) => {
    singleClicked = true;
    setTimeout(() => {
      if (singleClicked) {
        onClick(e, bounds);
      }
    }, 250);

  });

  mb.tray.removeAllListeners("double-click");
  mb.tray.on("double-click", () => {
    singleClicked = false;
    openDirectory(DefaultSyncFolder);
  });

  mb.tray.on("right-click", () => {
    mb.tray.popUpContextMenu(ctxMenu);
  });

});

mb.on("focus-lost", () => {
  mb.hideWindow();
});

ipcMain.on(ChangeStateEvent, (event, arg) => {
  if (arg === Synchronizing) {
    mb.tray.setImage(idleIcon);
  } else {
    mb.tray.setImage(pausedIcon);
  }
  event.sender.send(ChangeStateEvent, arg);
});

ipcMain.on(OpenSyncFolderEvent, (event) => {
  openDirectory(DefaultSyncFolder);
  event.sender.send(OpenSyncFolderEvent);
});