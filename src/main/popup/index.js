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
import {app, dialog, Menu, systemPreferences} from "electron";
import log from "electron-log";
import menubar from "menubar";
import path from "path";
import {Synchronizing} from "../../constants";
import * as ipcActionTypes from "../../ipc/constants";
import addListener from "../../ipc/receiver";
import {getConfig} from "../config";
import * as desktop from "../desktop";
import icons from "../icons";
import {installJRE} from "../jre";
import Sia from "../sia";
import Storj from "../storj";
import utils from "../utils";
import {
  calculateUsedVolumeHandler,
  changeStateHandler,
  openSyncFolderHandler,
  siaFundEventHandler,
  themeChangedHandler,
  updateStateHandler,
  willQuitHandler,
} from "./handlers";

export const DefaultWidth = 360;
export const DefaultHeight = 340;

export const popup = async () => {
  let width = DefaultWidth;
  if (process.env.DEV_TOOLS) {
    width *= 2;
  }

  const mb = menubar({
    index: `file://${path.join(__dirname, "../popup.html")}`,
    icon: icons.getSyncIcon(),
    tooltip: app.getName(),
    preloadWindow: true,
    alwaysOnTop: true,
    showDockIcon: false,
    width,
    height: DefaultHeight,
  });
  mb.window.setSkipTaskbar(true);
  mb.app.on("window-all-closed", app.quit);
  mb.app.on("will-quit", willQuitHandler(mb.app));
  mb.app.on("quit", (_, code) =>
    log.info(`[GUI main] Goobox is closed: status code = ${code}`)
  );
  mb.appState = Synchronizing;

  // Allow running only one instance.
  if (!mb.app.requestSingleInstanceLock()) {
    mb.app.quit();
    return;
  }
  mb.app.on("second-instance", () => {
    mb.showWindow();
  });

  mb.window.setResizable(false);
  if (process.env.DEV_TOOLS) {
    mb.window.toggleDevTools();
  }

  const ctxMenu = Menu.buildFromTemplate([
    {
      label: "exit",
      click: app.quit,
    },
  ]);

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

  // noinspection JSUnresolvedFunction
  mb.on("focus-lost", () => {
    mb.hideWindow();
  });

  // Register GUI event handlers.
  log.debug("[GUI main] Register changeStateHandler");
  addListener(ipcActionTypes.ChangeState, changeStateHandler(mb));
  log.debug("[GUI main] Register openSyncFolderHandler");
  addListener(ipcActionTypes.OpenSyncFolder, openSyncFolderHandler());
  log.debug("[GUI main] Register calculateUsedVolumeHandler");
  addListener(ipcActionTypes.CalculateUsedVolume, calculateUsedVolumeHandler());
  if (systemPreferences.subscribeNotification) {
    log.debug(
      "[GUI main] Register AppleInterfaceThemeChangedNotification event handler"
    );
    systemPreferences.subscribeNotification(
      "AppleInterfaceThemeChangedNotification",
      themeChangedHandler(mb)
    );
  }

  // Start back ends.
  try {
    await installJRE();

    const cfg = await getConfig();
    log.verbose(`[GUI main] Config = ${JSON.stringify(cfg)}`);

    // Prepare desktop integration.
    await desktop.register(cfg.syncFolder);

    // Start sync-storj app.
    if (cfg.storj && !global.storj) {
      global.storj = new Storj();
      global.storj.start(cfg.syncFolder);
    }
    if (global.storj) {
      log.debug("[GUI main] Register updateStateHandler");
      global.storj.on("syncState", updateStateHandler(mb));
    }

    // Start sync-sia app.
    if (cfg.sia && !global.sia) {
      global.sia = new Sia();
      global.sia.start(cfg.syncFolder);
    }
    if (global.sia) {
      log.debug("[GUI main] Register updateStateHandler");
      global.sia.on("syncState", updateStateHandler(mb));
      log.debug("[GUI main] Register siaFundEventHandler");
      global.sia.on("walletInfo", siaFundEventHandler());

      mb.tray.setImage(
        global.sia.syncState === Synchronizing
          ? icons.getSyncIcon()
          : icons.getIdleIcon()
      );
      mb.appState = global.sia.syncState;
    }
  } catch (err) {
    log.error(`[GUI main] Failed to start synchronization ${err}`);
    dialog.showErrorBox("Goobox", `Cannot start Goobox: ${err}`);
    app.quit();
  }
};

export default popup;
