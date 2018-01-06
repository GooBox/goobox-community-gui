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
import {app, dialog, ipcMain, Menu} from "electron";
import log from "electron-log";
import menubar from "menubar";
import path from "path";
import {ChangeStateEvent, OpenSyncFolderEvent, Synchronizing, UsedVolumeEvent} from "../constants";
import {getConfig} from "./config";
import icons from "./icons";
import {installJRE} from "./jre";
import Sia from "./sia";
import Storj from "./storj";
import utils from "./utils";

const DefaultSyncFolder = path.join(app.getPath("home"), app.getName());


if (app.isReady()) {
  log.info("the app is already ready");
  main();
} else {
  app.on("ready", main);
}

async function main() {

  const mb = menubar({
    index: "file://" + path.join(__dirname, "../../static/popup.html"),
    icon: icons.getSyncIcon(),
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
  if ("development" === process.env.NODE_ENV) {
    mb.window.toggleDevTools();
  }

  const ctxMenu = Menu.buildFromTemplate([{
    label: "exit",
    click: app.quit
  }]);

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

  // Define event handlers.
  const SiaEventHandler = line => {
    const e = JSON.parse(line);
    log.debug(`Received a SIA event: ${e.eventType}`);
    switch (e.eventType) {
      case "Synchronizing":
        log.debug("Update the tray icon to the synchronizing icon");
        mb.tray.setImage(icons.getSyncIcon());
        break;
      case "Synchronized":
        log.debug("Update the tray icon to the idle icon");
        mb.tray.setImage(icons.getIdleIcon());
        break;
    }
  };

  // Register event handlers.
  ipcMain.on(ChangeStateEvent, async (event, arg) => {
    if (arg === Synchronizing) {
      if (global.sia) {
        global.sia.start();
        global.sia.stdout.on("line", SiaEventHandler);
      }
      log.debug("Update the tray icon to the idle icon");
      mb.tray.setImage(icons.getIdleIcon());
    } else {
      if (global.sia) {
        global.sia.stdout.removeListener("line", SiaEventHandler);
        await global.sia.close();
      }
      log.debug("Update the tray icon to the paused icon");
      mb.tray.setImage(icons.getPausedIcon());
    }
    event.sender.send(ChangeStateEvent, arg);
  });

  ipcMain.on(OpenSyncFolderEvent, async (event) => {
    try {
      const cfg = await getConfig();
      utils.openDirectory(cfg ? cfg.syncFolder : DefaultSyncFolder);
    } catch (err) {
      log.error(err);
    }
    event.sender.send(OpenSyncFolderEvent);
  });

  ipcMain.on(UsedVolumeEvent, async (event) => {
    let volume = 0;
    try {
      const cfg = await getConfig();
      volume = await utils.totalVolume(cfg ? cfg.syncFolder : DefaultSyncFolder);
    } catch (err) {
      log.error(err);
    }
    event.sender.send(UsedVolumeEvent, volume / 1024 / 1024);
  });

  // Start back ends.
  log.info("Loading the config file.");
  try {
    await installJRE();

    const cfg = await getConfig();
    log.debug(JSON.stringify(cfg));
    // Start sync-storj app.
    if (cfg.storj && !global.storj) {
      global.storj = new Storj();
      global.storj.start();
    }

    // Start sync-sia app.
    if (cfg.sia && !global.sia) {
      global.sia = new Sia();
      global.sia.start(cfg.syncFolder);
    }
    if (global.sia && global.sia.stdout) {
      global.sia.stdout.on("line", SiaEventHandler);
    }

  } catch (err) {
    log.error(err);
    dialog.showErrorBox("Goobox", `Cannot start Goobox: ${err}`);
    app.quit();
  }

}
