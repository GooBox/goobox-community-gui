/*
 * Copyright (C) 2017-2018 Junpei Kawamoto
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
import {app, dialog, Menu} from "electron";
import log from "electron-log";
import menubar from "menubar";
import path from "path";
import * as ipcActionTypes from "../ipc/constants";
import addListener from "../ipc/receiver";
import {getConfig} from "./config";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  updateStateHandler,
  willQuitHandler
} from "./handlers";
import icons from "./icons";
import {installJRE} from "./jre";
import Sia from "./sia";
import Storj from "./storj";
import utils from "./utils";

export const core = async () => {

  let width = 518;
  if ("development" === process.env.NODE_ENV) {
    width *= 2;
  }

  const mb = menubar({
    index: "file://" + path.join(__dirname, "../../static/popup.html"),
    icon: icons.getSyncIcon(),
    tooltip: app.getName(),
    preloadWindow: true,
    width: width,
    height: 400,
    alwaysOnTop: true,
    showDockIcon: false,
  });
  mb.window.setSkipTaskbar(true);
  mb.app.on('window-all-closed', app.quit);
  mb.app.on("will-quit", willQuitHandler(mb.app));
  mb.app.on("quit", (_, code) => log.info(`[GUI main] Goobox is closed: status code = ${code}`));

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
    click: app.quit,
  }]);

  const onClick = mb.tray.listeners("click")[0];
  let visible = false;
  let singleClicked = false;
  mb.tray.removeAllListeners("click");
  mb.tray.on("click", (e, bounds) => {
    singleClicked = true;
    setTimeout(() => {
      if (singleClicked) {
        // After enabling skipTaskbar, window.isVisible always returns false.
        // To close the window when users clock the tray icon, here is some hack.
        // If altKey is true, onClick hides the window, so we use it when the window is visible.
        if (visible) {
          e.altKey = true;
        }
        visible = !visible;
        onClick(e, bounds);
      }
    }, 250);
  });

  mb.tray.removeAllListeners("double-click");
  mb.tray.on("double-click", async () => {
    singleClicked = false;
    const cfg = await getConfig();
    utils.openDirectory(cfg.syncFolder);
  });

  mb.tray.on("right-click", () => {
    mb.tray.popUpContextMenu(ctxMenu);
  });

  mb.on("focus-lost", () => {
    mb.hideWindow();
  });

  // Register GUI event handlers.
  addListener(ipcActionTypes.ChangeState, changeStateHandler(mb));
  addListener(ipcActionTypes.OpenSyncFolder, openSyncFolderHandler());
  addListener(ipcActionTypes.CalculateUsedVolume, calculateUsedVolumeHandler());

  // Start back ends.
  log.info("[GUI main] Loading the config file.");
  try {
    await installJRE();

    const cfg = await getConfig();
    log.debug(`[GUI main] Config = ${JSON.stringify(cfg)}`);
    // Start sync-storj app.
    if (cfg.storj && !global.storj) {
      global.storj = new Storj();
      global.storj.start(cfg.syncFolder);
    }
    if (global.storj) {
      global.storj.on("syncState", updateStateHandler(mb));
    }

    // Start sync-sia app.
    if (cfg.sia && !global.sia) {
      global.sia = new Sia();
      global.sia.start(cfg.syncFolder);
    }
    if (global.sia) {
      global.sia.on("syncState", updateStateHandler(mb));
      global.sia.on("walletInfo", siaFundEventHandler());
    }

  } catch (err) {
    log.error(`[GUI main] Failed to start synchronization ${err}`);
    dialog.showErrorBox("Goobox", `Cannot start Goobox: ${err}`);
    app.quit();
  }

};
