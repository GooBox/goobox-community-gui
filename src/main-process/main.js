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
import {app, ipcMain, Menu} from "electron";
import storage from "electron-json-storage";
import log from "electron-log";
import menubar from "menubar";
import path from "path";
import {ChangeStateEvent, ConfigFile, OpenSyncFolderEvent, Synchronizing, UsedVolumeEvent} from "../constants";
import icons from "./icons";
import Sia from "./sia";
import utils from "./utils";

const DefaultSyncFolder = path.join(app.getPath("home"), app.getName());


if (app.isReady()) {
  log.info("the app is already ready");
  main();
} else {
  app.on("ready", main);
}

function main() {

  const mb = menubar({
    index: "file://" + path.join(__dirname, "../../static/popup.html"),
    icon: icons.getIdleIcon(),
    tooltip: app.getName(),
    preloadWindow: true,
    width: 518,
    height: 400,
    alwaysOnTop: true,
    showDockIcon: false,
  });

  mb.app.on("quit", async () => {
    if (global.storj) {
      await global.storj.close();
    }
    if (global.sia) {
      await global.sia.close();
    }
  });

  // Allow running only one instance.
  const shouldQuit = mb.app.makeSingleInstance(() => {
    mb.showWindow();
  });
  if (shouldQuit) {
    mb.app.quit();
    return;
  }
  mb.window.setResizable(false);
  if ("production" !== process.env.NODE_ENV) {
    mb.window.toggleDevTools();
  }

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
    utils.openDirectory(DefaultSyncFolder);
  });

  mb.tray.on("right-click", () => {
    mb.tray.popUpContextMenu(ctxMenu);
  });

  mb.on("focus-lost", () => {
    mb.hideWindow();
  });

  // Start backends.
  log.info("Loading the config file.");
  storage.get(ConfigFile, (err, cfg) => {
    if (err) {
      log.error(err);
      return;
    }
    log.debug(JSON.stringify(cfg));
    if (cfg.sia && !global.sia) {
      global.sia = new Sia();
      global.sia.start();
    }
  });

  // Register event handlers.
  ipcMain.on(ChangeStateEvent, async (event, arg) => {
    if (arg === Synchronizing) {
      if (global.sia) {
        global.sia.start();
      }
      mb.tray.setImage(icons.getIdleIcon());
    } else {
      if (global.sia) {
        await global.sia.close();
      }
      mb.tray.setImage(icons.getPausedIcon());
    }
    event.sender.send(ChangeStateEvent, arg);
  });

  ipcMain.on(OpenSyncFolderEvent, (event) => {
    storage.get(ConfigFile, cfg => {
      utils.openDirectory(cfg ? cfg.syncFolder : DefaultSyncFolder);
      event.sender.send(OpenSyncFolderEvent);
    });
  });

  ipcMain.on(UsedVolumeEvent, async (event) => {
    return new Promise((resolve, reject) => {
      storage.get(ConfigFile, cfg => {
        utils.totalVolume(cfg ? cfg.syncFolder : DefaultSyncFolder)
          .then(volume => {
            event.sender.send(UsedVolumeEvent, volume / 1024 / 1024);
          })
          .catch(err => {
            console.log(err);
            reject();
          })
          .then(resolve);
      });
    });
  });

}
